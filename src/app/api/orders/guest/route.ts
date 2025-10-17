import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { sendMail } from "@/lib/mailer";
import { renderOrderConfirmation } from "@/lib/emails";

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
                isGuest: true,
                contactEmail: data.email,
                trackingToken: token,
                shippingJson: data.shipping || undefined,
                billingJson: data.billing || undefined,
                clientIp: req.headers.get("x-forwarded-for") || req.ip || undefined,
                userAgent: req.headers.get("user-agent") || undefined,
            },
        });

    // E-posta bildirimi (errors swallowed to not block checkout)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
      const trackingUrl = created.trackingToken ? `${baseUrl}/siparis-takip/${created.trackingToken}` : undefined;
      await sendMail(data.email, "Siparişiniz Alındı", renderOrderConfirmation({ orderId: created.id, trackingUrl }));
    } catch (_) {}

        return NextResponse.json({ ok: true, orderId: created.id, trackingToken: token });
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: e?.message || "Hata" }, { status: 500 });
    }
}


