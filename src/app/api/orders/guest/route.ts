import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { sendMail } from "@/lib/mailer";
import { renderAdminOrderEmail, renderOrderConfirmation } from "@/lib/emails";
import { getProducts, getSettings } from "@/lib/data";

function createTrackingToken(): string {
  return crypto.randomBytes(24).toString("hex");
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json().catch(() => null as any);
    if (!data || !data.email || !data.address || !Array.isArray(data.items)) {
      return NextResponse.json({ ok: false, error: "Eksik alan" }, { status: 400 });
    }

    const total = Number(data.total || 0);
    const token = createTrackingToken();

    // Her zaman minimum alanlarla oluştur (prod DB şeması farklı olabilir)
    const created = await prisma.order.create({
      data: {
        customerAd: data.name || "",
        customerEmail: data.email,
        customerAdres: data.address || "",
        customerSehir: data.city || "",
        customerTelefon: data.phone || "",
        customerName: data.name || "",
        total,
        status: "pending",
      },
      // Select only guaranteed column(s) to avoid selecting non-existent columns in RETURNING
      select: { id: true },
    });

    // Sipariş kalemlerini kaydet (best-effort)
    try {
      const items = Array.isArray(data.items) ? data.items : [];
      const rows = items
        .map((i: any) => ({ slug: String(i.slug || ""), qty: Number(i.qty || 0) }))
        .filter((i: any) => i.slug && i.qty > 0)
        .map((i: any) => ({ orderId: created.id, slug: i.slug, qty: i.qty }));
      if (rows.length) await prisma.orderItem.createMany({ data: rows });
    } catch (_) { }
    // Yeni kolonlar varsa güncellemeyi dene (yoksa sessizce geç)
    try {
      await prisma.order.update({
        where: { id: created.id },
        data: {
          isGuest: true as any,
          contactEmail: data.email as any,
          trackingToken: token as any,
          shippingJson: (data.shipping || undefined) as any,
          billingJson: (data.billing || undefined) as any,
          clientIp: (req.headers.get("x-forwarded-for") || undefined) as any,
          userAgent: (req.headers.get("user-agent") || undefined) as any,
        },
        // Avoid selecting non-existent columns on outdated DBs
        select: { id: true },
      });
    } catch (_) { }

    // E-posta bildirimi (errors swallowed to not block checkout)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.caycihursitefendi.com";
      const trackingUrl = token ? `${baseUrl}/siparis-takip/${token}` : undefined;
      const items = Array.isArray(data.items) ? data.items.map((i: any) => ({ slug: String(i.slug), qty: Number(i.qty || 0) })).filter((i: any) => i.slug && i.qty > 0) : [];
      await sendMail(
        data.email,
        "Siparişiniz Alındı",
        renderOrderConfirmation({ orderId: created.id, trackingUrl, items })
      );

      // Admin'e özet e-posta
      const settings = await getSettings();
      const adminTo = settings.notifications?.adminEmail || settings.smtp.from || "";
      if (adminTo) {
        const products = await getProducts();
        const priceMap = Object.fromEntries((products as any[]).map((p: any) => [p.slug, p.price]));
        const nameMap = Object.fromEntries((products as any[]).map((p: any) => [p.slug, p.name]));
        const templOrder = {
          id: created.id,
          createdAt: new Date().toISOString(),
          customer: { ad: data.name || "", email: data.email, adres: data.address || "", sehir: data.city || "", telefon: data.phone || "" },
          items: items.map((i: any) => ({ slug: i.slug, qty: i.qty, name: nameMap[i.slug], price: priceMap[i.slug] })),
        } as any;
        const adminHtml = renderAdminOrderEmail(templOrder, settings);
        await sendMail(adminTo, "Yeni siparişiniz var", adminHtml);
      }
    } catch (_) { }

    return NextResponse.json({ ok: true, orderId: created.id, trackingToken: token });
  } catch (e: any) {
    console.error("/api/orders/guest failed:", e);
    return NextResponse.json({ ok: false, error: e?.message || "Hata" }, { status: 500 });
  }
}


