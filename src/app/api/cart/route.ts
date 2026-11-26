import { NextRequest, NextResponse } from "next/server";
import { addToCart, CartError, clearCart, ensureCartId, getCartId, readCart, removeFromCart, setCartQty } from "@/lib/cart";

// Ziyaretçiye özel sepet. Kimlik httpOnly çerezdedir; başka birinin sepetine erişilemez.

export const dynamic = "force-dynamic";

export async function GET() {
    const cart = await readCart(await getCartId());
    return NextResponse.json(cart, { headers: { "Cache-Control": "no-store" } });
}

async function respond(fn: (cartId: string) => Promise<void>) {
    try {
        const cartId = await ensureCartId();
        await fn(cartId);
        return NextResponse.json({ ok: true, cart: await readCart(cartId) });
    } catch (e: any) {
        const msg = e instanceof CartError ? e.message : "Sepet güncellenemedi";
        return NextResponse.json({ ok: false, error: msg, cart: await readCart(await getCartId()) }, { status: 400 });
    }
}

export async function POST(req: NextRequest) {
    const { slug, qty } = await req.json().catch(() => ({} as any));
    if (!slug) return NextResponse.json({ ok: false, error: "Ürün belirtilmedi" }, { status: 400 });
    return respond((id) => addToCart(id, String(slug), qty ?? 1));
}

export async function PUT(req: NextRequest) {
    const { slug, qty } = await req.json().catch(() => ({} as any));
    if (!slug) return NextResponse.json({ ok: false, error: "Ürün belirtilmedi" }, { status: 400 });
    return respond((id) => setCartQty(id, String(slug), qty));
}

export async function DELETE(req: NextRequest) {
    const slug = new URL(req.url).searchParams.get("slug");
    return respond((id) => (slug ? removeFromCart(id, slug) : clearCart(id)));
}
