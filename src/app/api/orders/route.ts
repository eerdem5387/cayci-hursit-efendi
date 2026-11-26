import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { getSettings } from "@/lib/data";
import { renderCustomerOrderStatusEmail, type CustomerNotifiableStatus } from "@/lib/emails";
import { requireAdmin } from "@/lib/requireAdmin";
import { ADMIN_TABS, ORDER_STATUSES } from "@/lib/orderStatus";
import { loadOrder, serializeOrder, toEmailOrder } from "@/lib/orders";

// Yönetim paneli sipariş API'si (yalnızca admin).
// Sipariş oluşturma /api/checkout üzerinden yapılır.

export const dynamic = "force-dynamic";

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
    const tab = searchParams.get("tab");
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const pageSize = Math.min(1000, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10) || 20));

    const where: any = {};
    const tabDef = ADMIN_TABS.find((t) => t.key === tab);
    if (tabDef && tabDef.statuses.length) where.status = { in: tabDef.statuses };
    else if (status === "_attempts") where.status = { in: ["pending", "odeme_basarisiz"] };
    else if (status === "_active") where.status = { notIn: ["pending", "odeme_basarisiz"] };
    else if (status) where.status = status;
    if (q) {
        const digits = q.replace(/\D/g, "");
        where.OR = [
            { id: { contains: q, mode: "insensitive" } },
            { id: { endsWith: q.replace(/^#/, "").toLowerCase() } },
            { customerName: { contains: q, mode: "insensitive" } },
            { customerEmail: { contains: q, mode: "insensitive" } },
            { customerSehir: { contains: q, mode: "insensitive" } },
            { cargoTrackingNo: { contains: q } },
            { customerTelefon: { contains: q } },
            ...(digits.length >= 4 && digits !== q ? [{ customerTelefon: { contains: digits } }] : []),
        ];
    }

    // Yeni/hazırlanıyor gibi iş kuyruklarında en eski sipariş önce gelsin
    const oldestFirst = tab === "yeni" || tab === "hazirlaniyor" || tab === "inceleme";

    const [total, orders, grouped] = await Promise.all([
        prisma.order.count({ where }),
        prisma.order.findMany({ where, include: { items: true }, orderBy: { createdAt: oldestFirst ? "asc" : "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
        prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    ]);
    const byStatus = Object.fromEntries(grouped.map((g) => [g.status, g._count._all]));
    const counts = Object.fromEntries(
        ADMIN_TABS.map((t) => [t.key, t.statuses.length ? t.statuses.reduce((s, st) => s + (byStatus[st] || 0), 0) : Object.values(byStatus).reduce((a, b) => a + b, 0)])
    );
    const items = await Promise.all(orders.map((o) => serializeOrder(o)));
    return NextResponse.json({ items, total, page, pageSize, counts });
}

const NOTIFY: CustomerNotifiableStatus[] = ["onaylandi", "kargoda", "teslim_edildi", "basarisiz"];
const UNPAID = ["pending", "odeme_basarisiz"];
const FULFILMENT = ["onaylandi", "kargoda", "teslim_edildi"];

type UpdateBody = {
    id?: string;
    ids?: string[];
    status?: string;
    reason?: string;
    cargoCompany?: string;
    cargoTrackingNo?: string;
    adminNote?: string;
    notify?: boolean;
};

/**
 * Tek veya toplu güncelleme.
 *  - status verilirse durum değişir, geçmişe yazılır, (notify !== false ise) müşteriye e-posta gider
 *  - cargoCompany / cargoTrackingNo / adminNote alanları durumdan bağımsız güncellenebilir
 */
export async function PUT(req: NextRequest) {
    const denied = await requireAdmin();
    if (denied) return denied;

    const body = (await req.json().catch(() => ({}))) as UpdateBody;
    const ids = Array.from(new Set((body.ids?.length ? body.ids : [body.id]).filter(Boolean).map(String))).slice(0, 200);
    if (!ids.length) return NextResponse.json({ ok: false, error: "Sipariş seçilmedi" }, { status: 400 });

    const status = body.status ? String(body.status) : null;
    const reason = String(body.reason || "").trim().slice(0, 500);
    const notify = body.notify !== false;

    if (status && !(ORDER_STATUSES as readonly string[]).includes(status)) {
        return NextResponse.json({ ok: false, error: "Geçersiz durum" }, { status: 400 });
    }
    if (status === "basarisiz" && !reason) {
        return NextResponse.json({ ok: false, error: "İptal için bir açıklama girin" }, { status: 400 });
    }

    const settings = status && notify ? await getSettings() : null;
    const results: { id: string; ok: boolean; error?: string }[] = [];

    for (const id of ids) {
        const order = await loadOrder(id);
        if (!order) { results.push({ id, ok: false, error: "Sipariş bulunamadı" }); continue; }

        if (status && UNPAID.includes(order.status) && FULFILMENT.includes(status)) {
            results.push({ id, ok: false, error: "Ödemesi alınmamış sipariş hazırlanamaz/kargolanamaz" });
            continue;
        }

        const data: any = {};
        if (body.cargoCompany !== undefined) data.cargoCompany = String(body.cargoCompany).trim().slice(0, 80) || null;
        if (body.cargoTrackingNo !== undefined) data.cargoTrackingNo = String(body.cargoTrackingNo).trim().slice(0, 80) || null;
        if (body.adminNote !== undefined) data.adminNote = String(body.adminNote).slice(0, 4000) || null;

        const changing = !!status && status !== order.status;
        if (changing) {
            data.status = status;
            if (status === "basarisiz") data.statusReason = reason;
            if (status === "paid" && !order.paidAt) data.paidAt = new Date();
            const history = Array.isArray(order.history) ? (order.history as any[]) : [];
            const note =
                status === "kargoda" && (data.cargoCompany ?? order.cargoCompany)
                    ? `${data.cargoCompany ?? order.cargoCompany}${(data.cargoTrackingNo ?? order.cargoTrackingNo) ? ` · ${data.cargoTrackingNo ?? order.cargoTrackingNo}` : ""}`
                    : status === "basarisiz" ? reason : undefined;
            data.history = [...history, { at: new Date().toISOString(), from: order.status, status, note, notified: false }];
        }

        if (!Object.keys(data).length) { results.push({ id, ok: true }); continue; }
        const updated = await prisma.order.update({ where: { id }, data, include: { items: true } });

        if (changing && notify && settings && NOTIFY.includes(status as CustomerNotifiableStatus) && updated.customerEmail) {
            try {
                const html = renderCustomerOrderStatusEmail(await toEmailOrder(updated), settings, { status: status as CustomerNotifiableStatus, reason });
                const subject = status === "kargoda" ? "Siparişiniz kargoya verildi" : status === "teslim_edildi" ? "Siparişiniz teslim edildi" : status === "basarisiz" ? "Siparişiniz iptal edildi" : "Siparişiniz hazırlanıyor";
                await sendMail(updated.customerEmail, subject, html);
                // Geçmişe yalnızca gerçekten gönderildiyse "bildirildi" yaz
                const h = Array.isArray(updated.history) ? [...(updated.history as any[])] : [];
                if (h.length) {
                    h[h.length - 1] = { ...h[h.length - 1], notified: true };
                    await prisma.order.update({ where: { id }, data: { history: h as any } });
                }
            } catch {
                // e-posta hatası güncellemeyi engellemesin
            }
        }
        results.push({ id, ok: true });
    }

    const failed = results.filter((r) => !r.ok);
    return NextResponse.json({
        ok: failed.length === 0,
        updated: results.length - failed.length,
        results,
        error: failed.length ? `${failed.length} sipariş güncellenemedi: ${failed[0].error}` : undefined,
    }, { status: failed.length && failed.length === results.length ? 400 : 200 });
}
