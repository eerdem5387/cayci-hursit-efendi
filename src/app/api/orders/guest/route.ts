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

    let created;
    try {
      created = await prisma.order.create({
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
        clientIp: req.headers.get("x-forwarded-for") || undefined,
                userAgent: req.headers.get("user-agent") || undefined,
        },
      });
    } catch (err: any) {
      // Fallback: production DB henüz migrate edilmemiş olabilir
      created = await prisma.order.create({
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
      });
    }

    // E-posta bildirimi (errors swallowed to not block checkout)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
      const trackingUrl = (created as any)?.trackingToken ? `${baseUrl}/siparis-takip/${(created as any).trackingToken}` : undefined;
      await sendMail(data.email, "Siparişiniz Alındı", renderOrderConfirmation({ orderId: created.id, trackingUrl }));
    } catch (_) {}

        return NextResponse.json({ ok: true, orderId: created.id, trackingToken: (created as any)?.trackingToken || null });
    } catch (e: any) {
        console.error("/api/orders/guest failed:", e);
        return NextResponse.json({ ok: false, error: e?.message || "Hata" }, { status: 500 });
    }
}


