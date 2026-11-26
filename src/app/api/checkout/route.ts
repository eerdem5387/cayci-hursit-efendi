import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getCartId, readCart } from "@/lib/cart";
import { buildPaymentForm } from "@/lib/ziraat";

// Tek adımda: sepeti sunucuda doğrula → tutarı sunucuda hesapla → siparişi oluştur
// → banka formunu (tutar sunucudan) hazırla. Tarayıcının gönderdiği tutar kullanılmaz.

export const dynamic = "force-dynamic";

const ATTEMPT_COOKIE = "chf_checkout";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type FieldErrors = Partial<Record<"ad" | "email" | "telefon" | "sehir" | "adres" | "sozlesme", string>>;

function clean(v: unknown, max = 300) {
  return String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null as any);
    if (!body) return NextResponse.json({ ok: false, error: "Geçersiz istek" }, { status: 400 });

    const session = await auth();
    const user = session?.user as any;

    const ad = clean(body.ad, 120);
    const email = clean(user?.email || body.email, 160).toLowerCase();
    const telefonDigits = String(body.telefon || "").replace(/\D/g, "");
    const sehir = clean(body.sehir, 80);
    const adres = String(body.adres || "").trim().slice(0, 500);

    const errors: FieldErrors = {};
    if (ad.length < 3 || !ad.includes(" ")) errors.ad = "Lütfen adınızı ve soyadınızı yazın.";
    if (!EMAIL_RE.test(email)) errors.email = "Geçerli bir e-posta adresi girin.";
    const phone = telefonDigits.replace(/^90/, "").replace(/^0/, "");
    if (!/^5\d{9}$/.test(phone) && !/^[2-4]\d{9}$/.test(phone)) errors.telefon = "Geçerli bir telefon numarası girin (05XX XXX XX XX).";
    if (sehir.length < 2) errors.sehir = "İl / ilçe bilgisini girin.";
    if (adres.length < 10) errors.adres = "Lütfen açık adresinizi (mahalle, sokak, no) yazın.";
    if (!body.sozlesme) errors.sozlesme = "Devam etmek için sözleşmeleri onaylamanız gerekiyor.";
    if (Object.keys(errors).length) {
      return NextResponse.json({ ok: false, error: "Lütfen işaretli alanları kontrol edin.", fields: errors }, { status: 422 });
    }

    const cartId = await getCartId();
    const cart = await readCart(cartId);
    if (!cartId || !cart.items.length) {
      return NextResponse.json({ ok: false, error: "Sepetiniz boş. Lütfen ürün ekleyip tekrar deneyin.", code: "EMPTY_CART" }, { status: 400 });
    }
    if (cart.removed.length) {
      return NextResponse.json({
        ok: false,
        error: `Sepetinizdeki bazı ürünler artık satışta değil: ${cart.removed.join(", ")}. Sepetinizi kontrol edin.`,
        code: "CART_CHANGED",
      }, { status: 409 });
    }
    // Ekranda gösterilen tutar ile sunucudaki tutar farklıysa (fiyat değişmiş olabilir) müşteriyi uyar
    const shownTotal = Number(body.expectedTotal);
    if (Number.isFinite(shownTotal) && Math.abs(shownTotal - cart.total) > 0.009) {
      return NextResponse.json({
        ok: false,
        error: "Sepet tutarınız güncellendi. Lütfen yeni tutarı kontrol edip tekrar onaylayın.",
        code: "TOTAL_CHANGED",
        cart,
      }, { status: 409 });
    }

    const phoneFormatted = `0${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 8)} ${phone.slice(8, 10)}`;
    const fingerprint = crypto
      .createHash("sha256")
      .update(JSON.stringify([email, ad, phone, sehir, adres, cart.items.map((i) => [i.slug, i.qty, i.price])]))
      .digest("hex")
      .slice(0, 32);

    const jar = await cookies();
    const prev = (jar.get(ATTEMPT_COOKIE)?.value || "").split(".");
    const [prevId, prevFp, prevTs] = prev;

    let orderId: string | null = null;

    // Çift tıklama / yenileme koruması: aynı bilgilerle 20 sn içinde gelen ikinci istek aynı siparişi kullanır
    if (prevId && prevFp === fingerprint && Date.now() - Number(prevTs || 0) < 20_000) {
      const existing = await prisma.order.findUnique({ where: { id: prevId }, select: { id: true, status: true } });
      if (existing?.status === "pending") orderId = existing.id;
    }

    if (!orderId) {
      // Bu tarayıcıdan başlatılmış ve ödenmemiş önceki deneme artık geçersiz
      if (prevId) {
        await prisma.order.updateMany({
          where: { id: prevId, status: "pending" },
          data: { status: "odeme_basarisiz", paymentError: "Müşteri ödemeyi tamamlamadan yeni bir deneme başlattı." },
        });
      }
      const created = await prisma.order.create({
        data: {
          customerAd: ad,
          customerName: ad,
          customerEmail: email,
          customerTelefon: phoneFormatted,
          customerSehir: sehir,
          customerAdres: adres,
          status: "pending",
          total: cart.total,
          isGuest: !user,
          userId: user?.id || null,
          contactEmail: email,
          trackingToken: crypto.randomBytes(24).toString("hex"),
          cartId,
          shippingJson: { name: ad, phone: phoneFormatted, city: sehir, address: adres } as any,
          clientIp: (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || null,
          userAgent: (req.headers.get("user-agent") || "").slice(0, 300) || null,
          items: {
            create: cart.items.map((i) => ({ slug: i.slug, qty: i.qty, name: i.name, unitPrice: i.price })),
          },
        },
        select: { id: true },
      });
      orderId = created.id;
    }

    jar.set(ATTEMPT_COOKIE, `${orderId}.${fingerprint}.${Date.now()}`, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    const { action, params } = await buildPaymentForm({ orderId, amount: cart.total });
    return NextResponse.json({ ok: true, orderId, action, params });
  } catch (e: any) {
    console.error("/api/checkout failed:", e);
    return NextResponse.json({ ok: false, error: "Ödeme başlatılamadı. Lütfen tekrar deneyin veya bizimle iletişime geçin." }, { status: 500 });
  }
}
