import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { getProducts, getSettings } from "@/lib/data";
import { renderAdminOrderEmail, renderCustomerOrderEmail, renderCustomerOrderStatusEmail, renderOrderConfirmation } from "@/lib/emails";
import { auth } from "@/lib/auth";

type CartItem = { slug: string; qty: number };

export async function POST(req: NextRequest) {
    try {
        const form = await req.formData();
        let ad = String(form.get("ad") || "");
        let email = String(form.get("email") || "");
        const adres = String(form.get("adres") || "");
        const sehir = String(form.get("sehir") || "");
        const telefon = String(form.get("telefon") || "");
        const kartAd = String(form.get("kartAd") || "");
        const kartNo = String(form.get("kartNo") || "");
        const sonKullanim = String(form.get("sonKullanim") || "");
        const cvv = String(form.get("cvv") || "");

        // Oturum açmış kullanıcı varsa formdaki ad/e‑posta yerine hesabını kullan
        const session = await auth();
        if (session?.user) {
            ad = String(session.user.name || ad);
            email = String(session.user.email || email);
        }

        const cart = await prisma.cartItem.findMany();
        if (!cart.length) {
            return NextResponse.json({ ok: false, error: "Sepet boş" }, { status: 400 });
        }

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
            // Select only base columns that exist in both legacy and new schemas
            select: {
                id: true,
                createdAt: true,
                status: true,
                total: true,
                customerName: true,
                customerAd: true,
                customerEmail: true,
                customerAdres: true,
                customerSehir: true,
                customerTelefon: true,
                items: { select: { id: true, slug: true, qty: true } },
            },
        });
        await prisma.cartItem.deleteMany();

        // E-posta bildirimleri
        const settings = await getSettings();
        const adminTo = settings.notifications?.adminEmail || settings.smtp.from || "";
        const nameMap = Object.fromEntries((products as any[]).map((p: any) => [p.slug, p.name]));
        const templOrder = {
            id: created.id,
            createdAt: (created as any).createdAt.toISOString(),
            customer: { ad, email, adres, sehir, telefon },
            items: created.items.map((i) => ({ slug: i.slug, qty: i.qty, name: nameMap[i.slug], price: priceMap[i.slug] })),
            status: created.status as any,
            total: created.total,
            customerName: created.customerName,
        };
        const adminHtml = renderAdminOrderEmail(templOrder as any, settings);
        try {
            // Sadece admin'e bilgilendirme gönder (ödeme bekleniyor)
            if (adminTo) await sendMail(adminTo, "Yeni sipariş talebi (ödeme bekleniyor)", adminHtml);
        } catch (e) {
            // e-posta hatası siparişi engellemesin
        }

        return NextResponse.json({ ok: true, orderId: created.id });
    } catch (e: any) {
        console.error("/api/orders failed:", e);
        return NextResponse.json({ ok: false, error: e?.message || "Hata" }, { status: 500 });
    }
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
    const { id, status, reason } = await req.json();
    const exists = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!exists) return NextResponse.json({ ok: false, error: "Sipariş bulunamadı" }, { status: 404 });

    // Başarısız durumunda açıklama zorunlu
    if (status === "basarisiz" && !reason) {
        return NextResponse.json({ ok: false, error: "Başarısız durum için neden girilmelidir" }, { status: 400 });
    }

    await prisma.order.update({ where: { id }, data: { status } });

    // Müşteriye durum e-postası gönder
    try {
        const settings = await getSettings();
        const products = await getProducts();
        const priceMap = Object.fromEntries((products as any[]).map((p: any) => [p.slug, p.price]));
        const nameMap = Object.fromEntries((products as any[]).map((p: any) => [p.slug, p.name]));
        const templOrder = {
            id: exists.id,
            createdAt: exists.createdAt.toISOString(),
            customer: { ad: exists.customerAd, email: exists.customerEmail, adres: exists.customerAdres, sehir: exists.customerSehir, telefon: exists.customerTelefon },
            items: exists.items.map((i) => ({ slug: i.slug, qty: i.qty, name: nameMap[i.slug], price: priceMap[i.slug] })),
        } as any;
        const html = renderCustomerOrderStatusEmail(templOrder, settings, { status, reason });
        if (exists.customerEmail) await sendMail(exists.customerEmail, "Sipariş Durumu Güncellendi", html);
    } catch (e) {
        // e-posta hatası yönetimi: sipariş güncellemeyi engellemesin
    }

    return NextResponse.json({ ok: true });
}


