import { NextRequest, NextResponse } from "next/server";
import { addToCart, CartError, ensureCartId } from "@/lib/cart";

// JavaScript olmadan da çalışan "Sepete Ekle" formu.
export async function POST(req: NextRequest) {
    const form = await req.formData();
    const slug = String(form.get("slug") || "");
    const qty = form.get("qty") ?? form.get("adet") ?? 1;
    const target = new URL("/sepet", req.url);
    if (!slug) return NextResponse.redirect(target, 303);
    try {
        const cartId = await ensureCartId();
        await addToCart(cartId, slug, qty);
        target.searchParams.set("eklendi", slug);
    } catch (e: any) {
        target.searchParams.set("hata", e instanceof CartError ? e.message : "Ürün sepete eklenemedi");
    }
    return NextResponse.redirect(target, 303);
}
