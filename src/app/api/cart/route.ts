import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/store";

type CartItem = { slug: string; qty: number };

function getCart(): CartItem[] { return readJson<CartItem[]>("cart.json", []); }
function saveCart(items: CartItem[]) { writeJson("cart.json", items); }

export async function GET() {
    return NextResponse.json(getCart());
}

export async function POST(req: NextRequest) {
    const { slug, qty } = await req.json();
    if (!slug || !qty) return NextResponse.json({ ok: false }, { status: 400 });
    const cart = getCart();
    const idx = cart.findIndex((c) => c.slug === slug);
    if (idx === -1) cart.push({ slug, qty }); else cart[idx].qty += qty;
    saveCart(cart);
    return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest) {
    const { slug, qty } = await req.json();
    const cart = getCart();
    const idx = cart.findIndex((c) => c.slug === slug);
    if (idx !== -1) cart[idx].qty = qty;
    saveCart(cart);
    return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const next = getCart().filter((c) => c.slug !== slug);
    saveCart(next);
    return NextResponse.json({ ok: true });
}


