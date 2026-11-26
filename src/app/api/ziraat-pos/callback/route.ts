import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { appendLog, describeFailure, getZiraatConfig, siteUrl, verifyCallbackHash } from "@/lib/ziraat";
import { notifyAdminReview, onOrderPaid } from "@/lib/orders";

// Bankanın 3D Pay Hosting dönüşü (okUrl ve failUrl aynı adres).
// Kurallar:
//  - Sipariş durumu yalnızca imzası doğrulanmış cevapla "paid" olur.
//  - Bankadan dönen tutar siparişin tutarıyla eşleşmelidir.
//  - Aynı cevap tekrar gelirse (yenileme, tekrar gönderim) hiçbir şey yeniden yapılmaz.
//  - Müşteri her durumda gerçek sipariş durumunu gösteren sonuç sayfasına yönlendirilir.

export const dynamic = "force-dynamic";

const LOG_KEY = "ziraatPosDebugLogs";

function pick(data: Record<string, string>, ...keys: string[]) {
  for (const k of keys) if (data[k]) return data[k];
  return "";
}

function resultRedirect(order: { id: string; trackingToken: string | null } | null) {
  const url = new URL(`${siteUrl()}/odeme/sonuc`);
  if (order) {
    url.searchParams.set("siparis", order.id);
    if (order.trackingToken) url.searchParams.set("t", order.trackingToken);
  } else {
    url.searchParams.set("durum", "bilinmiyor");
  }
  return NextResponse.redirect(url.toString(), 303);
}

async function handle(data: Record<string, string>, method: string) {
  const cfg = await getZiraatConfig();
  const verified = verifyCallbackHash(data, cfg.storeKey);

  const oid = pick(data, "oid", "OID", "OrderId", "ReturnOid");
  const mdStatus = pick(data, "mdStatus", "MdStatus");
  const response = pick(data, "Response", "response");
  const prc = pick(data, "ProcReturnCode", "procReturnCode");
  const approved = response.toLowerCase() === "approved" && (prc === "" || prc === "00");
  const amountRaw = pick(data, "amount", "Amount");
  const amount = amountRaw ? Number(amountRaw.replace(",", ".")) : NaN;
  const ref = [pick(data, "TransId"), pick(data, "AuthCode"), pick(data, "HostRefNum")].filter(Boolean).join(" / ");

  const order = oid
    ? await prisma.order.findUnique({ where: { id: oid }, select: { id: true, status: true, total: true, trackingToken: true } })
    : null;

  let outcome = "";

  if (!order) {
    outcome = "siparis_bulunamadi";
  } else if (approved && verified) {
    const amountOk = !Number.isFinite(amount) || Math.abs(amount - order.total) < 0.01;
    if (amountOk) {
      // Yalnızca ödenmemiş bir siparişten "paid"e geçiş yapılır (idempotent)
      const res = await prisma.order.updateMany({
        where: { id: order.id, status: { in: ["pending", "odeme_basarisiz"] } },
        data: {
          status: "paid",
          paidAt: new Date(),
          paidAmount: Number.isFinite(amount) ? amount : order.total,
          paymentRef: ref || null,
          paymentError: null,
        },
      });
      outcome = res.count ? "odendi" : "zaten_islenmis";
      if (res.count) await onOrderPaid(order.id);
    } else {
      const note = `Banka ${amount} TL onayladı, sipariş tutarı ${order.total} TL. Siparişi göndermeden önce banka panelinden kontrol edin.`;
      const res = await prisma.order.updateMany({
        where: { id: order.id, status: { in: ["pending", "odeme_basarisiz"] } },
        data: { status: "odeme_incelemede", paidAmount: amount, paymentRef: ref || null, paymentError: note },
      });
      outcome = "tutar_uyusmazligi";
      if (res.count) await notifyAdminReview(order.id, note);
    }
  } else if (approved && !verified) {
    // Banka onay vermiş görünüyor ama imza doğrulanamadı: ya sahte istek ya da anahtar ayarı hatalı.
    // Müşteriyi "başarısız" diye yanıltmamak ve parayı kaçırmamak için incelemeye al.
    const note = "Banka onayı geldi ancak güvenlik imzası doğrulanamadı (storeKey ayarını kontrol edin). Banka panelinden ödemeyi doğrulayın.";
    const res = await prisma.order.updateMany({
      where: { id: order.id, status: "pending" },
      data: { status: "odeme_incelemede", paymentRef: ref || null, paymentError: note },
    });
    outcome = "imza_hatali";
    if (res.count) await notifyAdminReview(order.id, note);
  } else {
    const reason = describeFailure(data);
    await prisma.order.updateMany({
      where: { id: order.id, status: "pending" },
      data: { status: "odeme_basarisiz", paymentError: reason },
    });
    outcome = "basarisiz";
  }

  // Teşhis kaydı (kart numarası banka tarafından maskelenmiş olarak gelir)
  const { HASH: _h1, hash: _h2, ...safeData } = data;
  await appendLog(LOG_KEY, { ts: Date.now(), method, oid, mdStatus, response, prc, verified, outcome, data: safeData });

  return resultRedirect(order);
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const data: Record<string, string> = {};
    for (const [k, v] of form.entries()) data[String(k)] = String(v);
    return await handle(data, "POST");
  } catch (e) {
    console.error("ziraat callback failed:", e);
    return NextResponse.redirect(`${siteUrl()}/odeme/sonuc?durum=bilinmiyor`, 303);
  }
}

export async function GET(req: NextRequest) {
  try {
    const data: Record<string, string> = {};
    new URL(req.url).searchParams.forEach((v, k) => (data[k] = v));
    // Parametresiz GET (ör. kullanıcı adresi yeniledi) → sonuç sayfası
    if (!Object.keys(data).length) return NextResponse.redirect(`${siteUrl()}/odeme/sonuc?durum=bilinmiyor`, 303);
    return await handle(data, "GET");
  } catch (e) {
    console.error("ziraat callback failed:", e);
    return NextResponse.redirect(`${siteUrl()}/odeme/sonuc?durum=bilinmiyor`, 303);
  }
}
