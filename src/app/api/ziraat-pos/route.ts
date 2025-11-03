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

    // Ziraat 3D Pay Hosting (Ver3) hash yöntemi:
    // 1) Tüm gönderilecek alanları topla (hash/HASH ve encoding hariç)
    // 2) Anahtarların NATURAL case-insensitive sıralaması
    // 3) Değerleri '|' ile birleştir (önce value içindeki '|' ve '\\' kaçırılır)
    // 4) Sona kaçırılmış storeKey eklenir
    // 5) SHA512 -> hex -> base64

    const action = posUrl.startsWith("http") ? posUrl : `https://${posUrl}`;
    // Parametre isimlerini dokümandaki orijinal casing ile kullan
    const baseParams: Record<string, string> = {
        amount: amount,
        callbackUrl: callbackUrl,
        clientid: merchantId,
        currency: currency,
        failUrl: failUrl,
        hashAlgorithm: "ver3",
        Instalment: "", // taksit boş da olsa parametre gönderilir
        lang: lang,
        okurl: okUrl,
        oid: oid,
        rnd: rnd,
        storetype: storeTypeResolved,
        TranType: type,
        encoding: "utf-8",
    };

    // Compute HASH per doc - case-insensitive natural sort (PHP natcasesort equivalent)
    const keys = Object.keys(baseParams).filter(k => {
        const lk = k.toLowerCase();
        return lk !== "hash" && lk !== "encoding";
    }).sort((a, b) => {
        // Case-insensitive natural sort
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        if (aLower !== bLower) return aLower.localeCompare(bLower, undefined, { numeric: true, sensitivity: "base" });
        // If case-insensitive equal, maintain original order
        return 0;
    });
    const escapedJoin = keys.map(k => {
        const v = String(baseParams[k] ?? "");
        return v.replace(/\\/g, "\\\\").replace(/\|/g, "\\|");
    }).join("|") + "|" + storeKey.replace(/\\/g, "\\\\").replace(/\|/g, "\\|");
    const sha512hex = crypto.createHash("sha512").update(escapedJoin, "utf8").digest("hex");
    const hash = Buffer.from(sha512hex, "hex").toString("base64");
    const params: Record<string, string> = { ...baseParams, hash, HASH: hash };

    // Debug: init log (last 50)
    try {
        const key = "ziraatPosInitLogs";
        const row = await prisma.settingKV.findUnique({ where: { key } });
        const arr = Array.isArray((row as any)?.value) ? ((row as any).value as any[]) : [];
        arr.unshift({ ts: Date.now(), oid, amount, siteUrl, action, algo: "ver3|sha512|sorted|escaped", plain: escapedJoin, params });
        const trimmed = arr.slice(0, 50);
        await prisma.settingKV.upsert({ where: { key }, update: { value: trimmed as any }, create: { key, value: trimmed as any } });
    } catch { }

    return NextResponse.json({ ok: true, action, params });
}


