import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getProducts, getSettings } from "@/lib/data";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { renderCustomerOrderEmail, renderOrderConfirmation } from "@/lib/emails";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const data: Record<string, string> = {};
    for (const [k, v] of form.entries()) data[String(k)] = String(v);

    const settings = await getSettings();
    const storeKey = settings.payments.ziraatPos.storeKey || "";

    // Ver3 dönüş doğrulama (SHA512, alfabetik, kaçış)
    const mdStatus = data["mdStatus"] || data["MdStatus"] || "";
    const response = data["Response"] || data["response"] || "";
    const prc = data["ProcReturnCode"] || data["procReturnCode"] || "";
    const incomingHash = (data["HASH"] || data["hash"] || "").toString();
    const keysPost = Object.keys(data).filter((k) => {
      const lk = k.toLowerCase();
      return lk !== "hash" && lk !== "encoding" && lk !== "countdown";
    }).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase(), undefined, { numeric: true, sensitivity: "base" }));
    const escapedJoinPost = keysPost.map((k) => String(data[k] ?? "").replace(/\\/g, "\\\\").replace(/\|/g, "\\|"))
      .join("|") + "|" + storeKey.replace(/\\/g, "\\\\").replace(/\|/g, "\\|");
    let verified = false;
    try {
      const sha512hex = crypto.createHash("sha512").update(escapedJoinPost, "utf8").digest("hex");
      const calc = Buffer.from(sha512hex, "hex").toString("base64");
      verified = !!incomingHash && (incomingHash === calc);
    } catch { }

    const oid = data["oid"] || data["OID"] || data["OrderId"] || "";

    // Debug log: persist last 50 callback payloads
    try {
      const key = "ziraatPosDebugLogs";
      const row = await prisma.settingKV.findUnique({ where: { key } });
      const arr = Array.isArray((row as any)?.value) ? ((row as any).value as any[]) : [];
      arr.unshift({ ts: Date.now(), method: "POST", oid, mdStatus, response, data });
      const trimmed = arr.slice(0, 50);
      await prisma.settingKV.upsert({ where: { key }, update: { value: trimmed as any }, create: { key, value: trimmed as any } });
    } catch { }

    if (verified && (mdStatus === "1") && (response.toLowerCase() === "approved")) {
      if (oid) {
        await prisma.order.updateMany({ where: { id: oid }, data: { status: "paid" } });
        // Müşteriye ödeme onay e-postası gönder
        try {
          const order = await prisma.order.findUnique({ where: { id: oid }, include: { items: true } });
          if (order && order.customerEmail) {
            const settingsFull = await getSettings();
            const products = await getProducts();
            const priceMap = Object.fromEntries((products as any[]).map((p: any) => [p.slug, p.price]));
            const nameMap = Object.fromEntries((products as any[]).map((p: any) => [p.slug, p.name]));
            const templOrder: any = {
              id: order.id,
              createdAt: order.createdAt.toISOString(),
              customer: { ad: order.customerAd, email: order.customerEmail, adres: order.customerAdres, sehir: order.customerSehir, telefon: order.customerTelefon },
              items: order.items.map((i: any) => ({ slug: i.slug, qty: i.qty, name: nameMap[i.slug], price: priceMap[i.slug] })),
              status: "paid",
              total: order.total,
              customerName: order.customerName,
            };
            const html = renderCustomerOrderEmail(templOrder, settingsFull);
            await sendMail(order.customerEmail, "Ödemeniz alındı – Siparişiniz oluşturuldu", html);
            // Minimal takip linkli teyit
            await sendMail(order.customerEmail, "Siparişiniz Alındı", renderOrderConfirmation({ orderId: order.id }));
          }
        } catch { }
      }
      return NextResponse.redirect((process.env.NEXT_PUBLIC_SITE_URL || "https://www.caycihursitefendi.com") + `/tesekkurler?oid=${encodeURIComponent(oid)}&paid=1&mdStatus=${encodeURIComponent(mdStatus)}&resp=${encodeURIComponent(response)}&prc=${encodeURIComponent(prc)}`, 303);
    }

    // Başarısız ise beklenen redirect
    const msg = data["ErrMsg"] || data["errmsg"] || "Ödeme doğrulanamadı";
    return NextResponse.redirect((process.env.NEXT_PUBLIC_SITE_URL || "https://www.caycihursitefendi.com") + `/tesekkurler?oid=${encodeURIComponent(oid)}&paid=0&msg=${encodeURIComponent(msg)}&mdStatus=${encodeURIComponent(mdStatus)}&resp=${encodeURIComponent(response)}&prc=${encodeURIComponent(prc)}`, 303);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Callback error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const data: Record<string, string> = {};
    url.searchParams.forEach((v, k) => (data[k] = v));

    const settings = await getSettings();
    const storeKey = settings.payments.ziraatPos.storeKey || "";

    const mdStatus = data["mdStatus"] || data["MdStatus"] || "";
    const response = data["Response"] || data["response"] || "";
    const prc = data["ProcReturnCode"] || data["procReturnCode"] || "";
    const incomingHash = (data["HASH"] || data["hash"] || "").toString();
    const keysGet = Object.keys(data).filter((k) => {
      const lk = k.toLowerCase();
      return lk !== "hash" && lk !== "encoding" && lk !== "countdown";
    }).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase(), undefined, { numeric: true, sensitivity: "base" }));
    const escapedJoinGet = keysGet.map((k) => String(data[k] ?? "").replace(/\\/g, "\\\\").replace(/\|/g, "\\|"))
      .join("|") + "|" + storeKey.replace(/\\/g, "\\\\").replace(/\|/g, "\\|");
    let verified = false;
    try {
      const sha512hex = crypto.createHash("sha512").update(escapedJoinGet, "utf8").digest("hex");
      const calc = Buffer.from(sha512hex, "hex").toString("base64");
      verified = !!incomingHash && (incomingHash === calc);
    } catch { }
    const oid = data["oid"] || data["OID"] || data["OrderId"] || "";

    // Debug log: persist last 50 callback payloads
    try {
      const key = "ziraatPosDebugLogs";
      const row = await prisma.settingKV.findUnique({ where: { key } });
      const arr = Array.isArray((row as any)?.value) ? ((row as any).value as any[]) : [];
      arr.unshift({ ts: Date.now(), method: "GET", oid, mdStatus, response, data });
      const trimmed = arr.slice(0, 50);
      await prisma.settingKV.upsert({ where: { key }, update: { value: trimmed as any }, create: { key, value: trimmed as any } });
    } catch { }

    if (verified && (mdStatus === "1") && (response.toLowerCase() === "approved")) {
      if (oid) {
        await prisma.order.updateMany({ where: { id: oid }, data: { status: "paid" } });
      }
      return NextResponse.redirect((process.env.NEXT_PUBLIC_SITE_URL || "https://www.caycihursitefendi.com") + `/tesekkurler?oid=${encodeURIComponent(oid)}&paid=1&mdStatus=${encodeURIComponent(mdStatus)}&resp=${encodeURIComponent(response)}&prc=${encodeURIComponent(prc)}`, 303);
    }

    const msg = data["ErrMsg"] || data["errmsg"] || "Ödeme doğrulanamadı";
    return NextResponse.redirect((process.env.NEXT_PUBLIC_SITE_URL || "https://www.caycihursitefendi.com") + `/tesekkurler?oid=${encodeURIComponent(oid)}&paid=0&msg=${encodeURIComponent(msg)}&mdStatus=${encodeURIComponent(mdStatus)}&resp=${encodeURIComponent(response)}&prc=${encodeURIComponent(prc)}`, 303);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Callback error" }, { status: 500 });
  }
}


