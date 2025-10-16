import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson, generateId } from "@/lib/store";
import { sendMail } from "@/lib/mailer";
import { getProducts, getSettings } from "@/lib/data";
import { renderAdminOrderEmail, renderCustomerOrderEmail } from "@/lib/emails";

type CartItem = { slug: string; qty: number };
type Order = {
    id: string;
    createdAt: string;
    customer: { ad: string; email: string; adres: string; sehir: string; telefon: string };
    items: CartItem[];
    status: "pending" | "paid" | "failed";
    total: number;
    customerName: string;
};

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

    const cart = readJson<CartItem[]>("cart.json", []);
    const orders = readJson<Order[]>("orders.json", []);
    const id = generateId("order");

    // Toplam tutarı hesapla
    const products = getProducts();
    const priceMap = Object.fromEntries(products.map((p) => [p.slug, p.price]));
    const total = cart.reduce((sum, item) => {
        const price = priceMap[item.slug] || 0;
        return sum + (price * item.qty);
    }, 0);

    const order: Order = {
        id,
        createdAt: new Date().toISOString(),
        customer: { ad, email, adres, sehir, telefon },
        items: cart,
        status: "pending",
        total,
        customerName: ad,
    };
    orders.push(order);
    writeJson("orders.json", orders);
    writeJson("cart.json", []);

    // E-posta bildirimleri
    const settings = getSettings();
    const adminTo = settings.notifications?.adminEmail || settings.smtp.from || "";
    const customerTo = email;
    const nameMap = Object.fromEntries(products.map((p) => [p.slug, p.name]));
    const templOrder = {
        ...order,
        items: order.items.map((i) => ({ ...i, name: nameMap[i.slug], price: priceMap[i.slug] })),
    };
    const adminHtml = renderAdminOrderEmail(templOrder as any, settings);
    const customerHtml = renderCustomerOrderEmail(templOrder as any, settings);
    try {
        if (adminTo) await sendMail(adminTo, "Yeni siparişiniz var", adminHtml);
        if (customerTo) await sendMail(customerTo, "Siparişiniz oluşturuldu", customerHtml);
    } catch (e) {
        // e-posta hatası siparişi engellemesin
    }

    return NextResponse.json({ ok: true, orderId: id });
}

export async function GET() {
    const orders = readJson<Order[]>("orders.json", []);
    return NextResponse.json(orders);
}

export async function PUT(req: NextRequest) {
    const { id, status } = await req.json();
    const orders = readJson<Order[]>("orders.json", []);
    const idx = orders.findIndex((o) => o.id === id);
    if (idx === -1) return NextResponse.json({ ok: false }, { status: 404 });
    orders[idx].status = status;
    writeJson("orders.json", orders);
    return NextResponse.json({ ok: true });
}


