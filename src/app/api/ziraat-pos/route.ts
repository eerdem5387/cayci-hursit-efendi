import { NextRequest, NextResponse } from "next/server";
import { getSettings } from "@/lib/data";

// NOT: Gerçek Ziraat POS entegrasyonu için banka tarafından sağlanan
// dokümantasyondaki imzalama, 3D Secure, hash ve endpoint akışlarını
// uygulamak gerekir. Bu sadece iskelet/stub bir uç nokta.

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => null);
    if (!body || !body.amount || !body.orderId) {
        return NextResponse.json({ ok: false, error: "Eksik alanlar" }, { status: 400 });
    }

    // Ayarlardan Ziraat POS bilgilerini al
    const settings = await getSettings();
    const { merchantId, terminalId, posUrl } = settings.payments.ziraatPos;

    // Ayarlar yapılandırılmamışsa hata döndür
    if (!merchantId || !terminalId || !posUrl) {
        return NextResponse.json({
            ok: false,
            error: "Ziraat POS ayarları yapılandırılmamış. Lütfen admin panelinden ayarları yapın."
        }, { status: 400 });
    }

    // Gerçek entegrasyon için burada Ziraat POS API'sine istek gönderilir
    // Şimdilik stub response döndürüyoruz
    return NextResponse.json({
        ok: true,
        message: "Stub: ödeme başlatıldı",
        config: {
            merchantId,
            terminalId,
            posUrl
        }
    });
}


