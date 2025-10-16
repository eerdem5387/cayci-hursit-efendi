import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

type Brand = { id: string; name: string; slug: string };

export async function GET() {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
        return NextResponse.json({ ok: false, error: "Yetkisiz" }, { status: 401 });
    }
    const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(brands);
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
        return NextResponse.json({ ok: false, error: "Yetkisiz" }, { status: 401 });
    }
    const body = (await req.json().catch(() => null)) as Partial<Brand> | null;
    if (!body) return NextResponse.json({ ok: false, error: "Geçersiz gövde" }, { status: 400 });
    const name = String(body.name || "").trim();
    const slug = String(body.slug || "").trim();
    if (!name || !slug) return NextResponse.json({ ok: false, error: "Ad ve slug zorunlu" }, { status: 400 });
    if (!/^[a-z0-9-]+$/.test(slug)) return NextResponse.json({ ok: false, error: "Slug yalnızca kucuk harf, rakam ve tire içerebilir" }, { status: 400 });
    const existing = await prisma.brand.findUnique({ where: { slug } });
    if (existing) return NextResponse.json({ ok: false, error: "Slug zaten kullanılıyor" }, { status: 409 });
    const brand = await prisma.brand.create({ data: { name, slug } });
    return NextResponse.json({ ok: true, brand });
}

export async function PUT(req: NextRequest) {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
        return NextResponse.json({ ok: false, error: "Yetkisiz" }, { status: 401 });
    }
    const body = (await req.json().catch(() => null)) as Brand | null;
    if (!body) return NextResponse.json({ ok: false, error: "Geçersiz gövde" }, { status: 400 });
    const existing = await prisma.brand.findUnique({ where: { id: body.id } });
    if (!existing) return NextResponse.json({ ok: false }, { status: 404 });
    const name = String(body.name || "").trim();
    const slug = String(body.slug || "").trim();
    if (!name || !slug) return NextResponse.json({ ok: false, error: "Ad ve slug zorunlu" }, { status: 400 });
    if (!/^[a-z0-9-]+$/.test(slug)) return NextResponse.json({ ok: false, error: "Slug yalnızca kucuk harf, rakam ve tire içerebilir" }, { status: 400 });
    const conflict = await prisma.brand.findUnique({ where: { slug } });
    if (conflict && conflict.id !== body.id) return NextResponse.json({ ok: false, error: "Slug zaten kullanılıyor" }, { status: 409 });
    await prisma.brand.update({ where: { id: body.id }, data: { name, slug } });
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
    await prisma.brand.delete({ where: { id } });
    return NextResponse.json({ ok: true });
}


