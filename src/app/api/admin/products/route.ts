import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson, generateId } from "@/lib/store";
import { auth } from "@/lib/auth";

type Product = { id: string; name: string; slug: string; brandId?: string; price: number; popular?: boolean; description?: string; weightKg?: number | null; stock?: number; images?: string[] };

export async function GET() {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
        return NextResponse.json({ ok: false, error: "Yetkisiz" }, { status: 401 });
    }
    const products = readJson<Product[]>("products.json", []);
    return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
        return NextResponse.json({ ok: false, error: "Yetkisiz" }, { status: 401 });
    }
    const body = (await req.json().catch(() => null)) as Partial<Product> | null;
    if (!body) return NextResponse.json({ ok: false, error: "Geçersiz gövde" }, { status: 400 });
    const name = String(body.name || "").trim();
    const slug = String(body.slug || "").trim();
    const price = Number(body.price);
    if (!name || !slug || !Number.isFinite(price)) return NextResponse.json({ ok: false, error: "Ad, slug ve fiyat zorunlu" }, { status: 400 });
    if (!/^[a-z0-9-]+$/.test(slug)) return NextResponse.json({ ok: false, error: "Slug yalnızca kucuk harf, rakam ve tire içerebilir" }, { status: 400 });
    const products = readJson<Product[]>("products.json", []);
    if (products.some((p) => p.slug === slug)) return NextResponse.json({ ok: false, error: "Slug zaten kullanılıyor" }, { status: 409 });
    const product: Product = { id: generateId("prod"), name, slug, brandId: body.brandId, price, popular: !!body.popular, description: body.description || "", weightKg: typeof body.weightKg === "number" ? body.weightKg : body.weightKg == null ? null : Number(body.weightKg), stock: typeof body.stock === "number" ? body.stock : 0, images: Array.isArray(body.images) ? body.images : [] };
    products.push(product);
    writeJson("products.json", products);
    return NextResponse.json({ ok: true, product });
}

export async function PUT(req: NextRequest) {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
        return NextResponse.json({ ok: false, error: "Yetkisiz" }, { status: 401 });
    }
    const body = (await req.json().catch(() => null)) as Product | null;
    if (!body) return NextResponse.json({ ok: false, error: "Geçersiz gövde" }, { status: 400 });
    const products = readJson<Product[]>("products.json", []);
    const idx = products.findIndex((p) => p.id === body.id);
    if (idx === -1) return NextResponse.json({ ok: false }, { status: 404 });
    const name = String(body.name || "").trim();
    const slug = String(body.slug || "").trim();
    const price = Number(body.price);
    if (!name || !slug || !Number.isFinite(price)) return NextResponse.json({ ok: false, error: "Ad, slug ve fiyat zorunlu" }, { status: 400 });
    if (!/^[a-z0-9-]+$/.test(slug)) return NextResponse.json({ ok: false, error: "Slug yalnızca kucuk harf, rakam ve tire içerebilir" }, { status: 400 });
    if (products.some((p, i) => i !== idx && p.slug === slug)) return NextResponse.json({ ok: false, error: "Slug zaten kullanılıyor" }, { status: 409 });
    products[idx] = { ...products[idx], ...body, name, slug, price };
    writeJson("products.json", products);
    return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
        return NextResponse.json({ ok: false, error: "Yetkisiz" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false }, { status: 400 });
    const products = readJson<Product[]>("products.json", []);
    const next = products.filter((p) => p.id !== id);
    writeJson("products.json", next);
    return NextResponse.json({ ok: true });
}


