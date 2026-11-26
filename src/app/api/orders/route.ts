import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { getSettings } from "@/lib/data";
import { renderCustomerOrderStatusEmail, type CustomerNotifiableStatus } from "@/lib/emails";
import { requireAdmin } from "@/lib/requireAdmin";
import { ORDER_STATUSES } from "@/lib/orderStatus";
import { loadOrder, serializeOrder, toEmailOrder } from "@/lib/orders";

// Sipariş oluşturma artık /api/checkout üzerinden yapılır.
// Bu uç nokta yalnızca yönetim paneli içindir.

export async function GET(req: NextRequest) {
    const denied = await requireAdmin();
    if (denied) return denied;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
        const order = await loadOrder(id);
        if (!order) return NextResponse.json({ ok: false, error: "Sipariş bulunamadı" }, { status: 404 });
        return NextResponse.json({ ok: true, order: await serializeOrder(order) });
    }

    const q = (searchParams.get("q") || "").trim();
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const pageSize = Math.min(1000, Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10) || 10));

    const where: any = {};
    if (status === "_attempts") where.status = { in: ["pending", "odeme_basarisiz"] };
    else if (status === "_active") where.status = { notIn: ["pending", "odeme_basarisiz"] };
    else if (status) where.status = status;
    if (q) {
        where.OR = [
            { id: { contains: q, mode: "insensitive" } },
            { customerName: { contains: q, mode: "insensitive" } },
            { customerEmail: { contains: q, mode: "insensitive" } },
            { customerTelefon: { contains: q } },
        ];
    }

    const [total, orders] = await Promise.all([
        prisma.order.count({ where }),
        prisma.order.findMany({ where, include: { items: true }, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    ]);
    const items = await Promise.all(orders.map((o) => serializeOrder(o)));
    return NextResponse.json({ items, total, page, pageSize });
}

const NOTIFY: CustomerNotifiableStatus[] = ["onaylandi", "kargoda", "teslim_edildi", "basarisiz"];

export async function PUT(req: NextRequest) {
    const denied = await requireAdmin();
    if (denied) return denied;

    const body = await req.json().catch(() => ({} as any));
    const id = String(body?.id || "");
    const status = String(body?.status || "");
    const reason = String(body?.reason || "").trim();

    if (!(ORDER_STATUSES as readonly string[]).includes(status)) {
        return NextResponse.json({ ok: false, error: "Geçersiz durum" }, { status: 400 });
    }
    const exists = await loadOrder(id);
    if (!exists) return NextResponse.json({ ok: false, error: "Sipariş bulunamadı" }, { status: 404 });
    if (status === "basarisiz" && !reason) {
        return NextResponse.json({ ok: false, error: "İptal/başarısız durumu için açıklama girilmelidir" }, { status: 400 });
    }
    if (exists.status === status) return NextResponse.json({ ok: true });

    await prisma.order.update({
        where: { id },
        data: { status, statusReason: status === "basarisiz" ? reason : exists.statusReason },
    });

    // Müşteriye yalnızca anlamlı durum değişikliklerinde e-posta gönder
    if ((NOTIFY as string[]).includes(status) && exists.customerEmail) {
        try {
            const settings = await getSettings();
            const html = renderCustomerOrderStatusEmail(await toEmailOrder(exists), settings, { status: status as CustomerNotifiableStatus, reason });
            await sendMail(exists.customerEmail, "Sipariş durumunuz güncellendi", html);
        } catch {
            // e-posta hatası güncellemeyi engellemesin
        }
    }
    return NextResponse.json({ ok: true });
}
