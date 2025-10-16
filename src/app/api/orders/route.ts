import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { getProducts, getSettings } from "@/lib/data";
import { renderAdminOrderEmail, renderCustomerOrderEmail } from "@/lib/emails";

type CartItem = { slug: string; qty: number };

export async function POST(req: NextRequest) {
    const form = await req.formData();
    const ad = String(form.get("ad") || "");
    const email = String(form.get("email") || "");
    const adres = String(form.get("adres") || "");
    const sehir = String(form.get("sehir") || "");
    const telefon = String(form.get("telefon") || "");
    const kartAd = String(form.get("kartAd") || "");
    const kartNo = String(form.get("kartNo") || "");
    const sonKullanim = String(form.get("sonKullanim") || "");
    const cvv = String(form.get("cvv") || "");

    const cart = await prisma.cartItem.findMany();

    // Toplam tutarı hesapla
    const products = await getProducts();
    const priceMap = Object.fromEntries((products as any[]).map((p: any) => [p.slug, p.price]));
    const total = cart.reduce((sum, item) => {
        const price = priceMap[item.slug] || 0;
        return sum + (price * item.qty);
    }, 0);

    const created = await prisma.order.create({
        data: {
            customerAd: ad,
            customerEmail: email,
            customerAdres: adres,
            customerSehir: sehir,
            customerTelefon: telefon,
            status: "pending",
            total,
            customerName: ad,
            items: {
                create: cart.map((c) => ({ slug: c.slug, qty: c.qty })),
            },
        },
        include: { items: true },
    });
    await prisma.cartItem.deleteMany();

    // E-posta bildirimleri
    const settings = await getSettings();
    const adminTo = settings.notifications?.adminEmail || settings.smtp.from || "";
    const customerTo = email;
    const nameMap = Object.fromEntries((products as any[]).map((p: any) => [p.slug, p.name]));
    const templOrder = {
        id: created.id,
        createdAt: created.createdAt.toISOString(),
        customer: { ad, email, adres, sehir, telefon },
        items: created.items.map((i) => ({ slug: i.slug, qty: i.qty, name: nameMap[i.slug], price: priceMap[i.slug] })),
        status: created.status as any,
        total: created.total,
        customerName: created.customerName,
    };
    const adminHtml = renderAdminOrderEmail(templOrder as any, settings);
    const customerHtml = renderCustomerOrderEmail(templOrder as any, settings);
    try {
        if (adminTo) await sendMail(adminTo, "Yeni siparişiniz var", adminHtml);
        if (customerTo) await sendMail(customerTo, "Siparişiniz oluşturuldu", customerHtml);
    } catch (e) {
        // e-posta hatası siparişi engellemesin
    }

    return NextResponse.json({ ok: true, orderId: created.id });
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").toLowerCase();
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10)));

    const where: any = {};
    if (status) where.status = status;
    if (q) {
        where.OR = [
            { id: { contains: q } },
            { customerName: { contains: q } },
            { customerEmail: { contains: q } },
            { customerTelefon: { contains: q } },
        ];
    }

    const [total, orders] = await Promise.all([
        prisma.order.count({ where }),
        prisma.order.findMany({ where, include: { items: true }, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    ]);

    const normalized = orders.map((o) => ({
        id: o.id,
        createdAt: o.createdAt,
        customer: { ad: o.customerAd, email: o.customerEmail, adres: o.customerAdres, sehir: o.customerSehir, telefon: o.customerTelefon },
        items: o.items.map((i) => ({ slug: i.slug, qty: i.qty })),
        status: o.status as any,
        total: o.total,
        customerName: o.customerName,
    }));
    return NextResponse.json({ items: normalized, total, page, pageSize });
}

export async function PUT(req: NextRequest) {
    const { id, status } = await req.json();
    const exists = await prisma.order.findUnique({ where: { id } });
    if (!exists) return NextResponse.json({ ok: false }, { status: 404 });
    await prisma.order.update({ where: { id }, data: { status } });
    return NextResponse.json({ ok: true });
}


