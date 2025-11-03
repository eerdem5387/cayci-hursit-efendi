import { NextRequest, NextResponse } from "next/server";
import { getSettings } from "@/lib/data";
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

    // Bazı Ziraat kurulumlarında SHA256 ve/veya currency dahil edilmesi istenir.
    // Önce standart sırayı SHA256 ile deneyelim ve hashAlgorithm parametresini belirtelim.
    // Bazı kurulumlarda currency de HASH dizisine dahil edilir
    const plain = `${merchantId}${oid}${amount}${okUrl}${failUrl}${type}${installment}${rnd}${currency}${storeKey}`;
    const hash = crypto.createHash("sha256").update(plain, "utf8").digest("base64");

    const action = posUrl.startsWith("http") ? posUrl : `https://${posUrl}`;
    const params: Record<string, string> = {
        clientid: merchantId,
        oid,
        amount,
        okUrl,
        failUrl,
        callbackurl: callbackUrl,
        rnd,
        hash,
        hashAlgorithm: "SHA256",
        storetype: storeTypeResolved,
        trantype: type,
        lang,
        currency,
    };

    return NextResponse.json({ ok: true, action, params });
}


