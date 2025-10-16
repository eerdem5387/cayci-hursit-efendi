import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

type Product = { id: string; name: string; slug: string; brandId?: string; price: number; popular?: boolean; description?: string; weightKg?: number | null; stock?: number; images?: string[] };

export async function GET() {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
        return NextResponse.json({ ok: false, error: "Yetkisiz" }, { status: 401 });
    }
    const products = await prisma.product.findMany({ orderBy: { name: "asc" } });
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
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) return NextResponse.json({ ok: false, error: "Slug zaten kullanılıyor" }, { status: 409 });
    const created = await prisma.product.create({
        data: {
            name,
            slug,
            price,
            brandId: body.brandId || null,
            popular: !!body.popular,
            description: body.description || "",
            weightKg: typeof body.weightKg === "number" ? body.weightKg : body.weightKg == null ? null : Number(body.weightKg),
            stock: typeof body.stock === "number" ? body.stock : null,
            images: Array.isArray(body.images) ? (body.images as any) : [],
        },
    });
    return NextResponse.json({ ok: true, product: created });
}

export async function PUT(req: NextRequest) {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
        return NextResponse.json({ ok: false, error: "Yetkisiz" }, { status: 401 });
    }
    const body = (await req.json().catch(() => null)) as Product | null;
    if (!body) return NextResponse.json({ ok: false, error: "Geçersiz gövde" }, { status: 400 });
    const found = await prisma.product.findUnique({ where: { id: body.id } });
    if (!found) return NextResponse.json({ ok: false }, { status: 404 });
    const name = String(body.name || "").trim();
    const slug = String(body.slug || "").trim();
    const price = Number(body.price);
    if (!name || !slug || !Number.isFinite(price)) return NextResponse.json({ ok: false, error: "Ad, slug ve fiyat zorunlu" }, { status: 400 });
    if (!/^[a-z0-9-]+$/.test(slug)) return NextResponse.json({ ok: false, error: "Slug yalnızca kucuk harf, rakam ve tire içerebilir" }, { status: 400 });
    const conflict = await prisma.product.findUnique({ where: { slug } });
    if (conflict && conflict.id !== body.id) {
        return NextResponse.json({ ok: false, error: "Slug zaten kullanılıyor" }, { status: 409 });
    }
    await prisma.product.update({
        where: { id: body.id },
        data: {
            name,
            slug,
            price,
            brandId: body.brandId ?? found.brandId,
            popular: body.popular ?? found.popular,
            description: body.description ?? found.description,
            weightKg: body.weightKg ?? found.weightKg,
            stock: typeof body.stock === "number" ? body.stock : body.stock === null ? null : found.stock,
            images: Array.isArray(body.images) ? (body.images as any) : found.images,
        },
    });
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
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
}


