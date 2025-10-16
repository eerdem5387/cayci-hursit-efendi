import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const form = await req.formData();
    const slug = String(form.get("slug") || "");
    const qty = Number(form.get("qty") || 1);
    if (!slug || !qty) return NextResponse.redirect(new URL("/sepet", req.url));
    await fetch(new URL("/api/cart", req.url), { method: "POST", body: JSON.stringify({ slug, qty }) });
    return NextResponse.redirect(new URL("/sepet", req.url));
}


