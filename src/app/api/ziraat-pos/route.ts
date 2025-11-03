import { NextRequest, NextResponse } from "next/server";
import { getSettings } from "@/lib/data";
import { prisma } from "@/lib/db";
import crypto from "crypto";

// NOT: Gerçek Ziraat POS entegrasyonu için banka tarafından sağlanan
// dokümantasyondaki imzalama, 3D Secure, hash ve endpoint akışlarını
// uygulamak gerekir. Bu sadece iskelet/stub bir uç nokta.

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => null) as any;
    if (!body || !body.amount || !body.orderId) {
        return NextResponse.json({ ok: false, error: "Eksik alanlar" }, { status: 400 });
    }

    const amountNum = Number(body.amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
        return NextResponse.json({ ok: false, error: "Geçersiz tutar" }, { status: 400 });
    }

    // Ayarlardan Ziraat POS bilgilerini al
    const settings = await getSettings();
    const { merchantId, posUrl, storeKey, storeType, apiUrl } = settings.payments.ziraatPos as any;

    if (!merchantId || !posUrl || !storeKey) {
        return NextResponse.json({ ok: false, error: "Ziraat POS ayarları eksik (merchantId/posUrl/storeKey)" }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.caycihursitefendi.com";
    const okUrl = `${siteUrl}/api/ziraat-pos/callback`;
    const failUrl = `${siteUrl}/api/ziraat-pos/callback`;

    const rnd = String(Date.now());
    const oid = String(body.orderId);
    const amount = amountNum.toFixed(2);
    const callbackUrl = okUrl; // tek callback kullanalım
    const lang = "tr";
    const currency = "949"; // TRY
    const installment = ""; // tek çekim
    const type = "Auth";
    const storeTypeResolved = storeType || "3d_pay_hosting";

    // Klasik: storetype/currency hariç
    // clientid + oid + amount + okUrl + failUrl + trantype + installment + rnd + storeKey
    const plain = `${merchantId}${oid}${amount}${okUrl}${failUrl}${type}${installment}${rnd}${storeKey}`;
    const hash = crypto.createHash("sha1").update(plain, "utf8").digest("base64");

    const action = posUrl.startsWith("http") ? posUrl : `https://${posUrl}`;
    const params: Record<string, string> = {
        clientid: merchantId,
        oid,
        amount,
        okUrl,
        failUrl,
        callbackurl: callbackUrl,
        CallbackURL: callbackUrl,
        rnd,
        hash,
        HASH: hash, // bazı kurulumlar büyük harf ister
        storetype: storeTypeResolved,
        trantype: type,
        lang,
        currency,
    };

    // Debug: init log (last 50)
    try {
        const key = "ziraatPosInitLogs";
        const row = await prisma.settingKV.findUnique({ where: { key } });
        const arr = Array.isArray((row as any)?.value) ? ((row as any).value as any[]) : [];
        arr.unshift({ ts: Date.now(), oid, amount, siteUrl, action, hashAlgo: "SHA1 classic (no currency,no storetype)", plain, params });
        const trimmed = arr.slice(0, 50);
        await prisma.settingKV.upsert({ where: { key }, update: { value: trimmed as any }, create: { key, value: trimmed as any } });
    } catch { }

    return NextResponse.json({ ok: true, action, params });
}


