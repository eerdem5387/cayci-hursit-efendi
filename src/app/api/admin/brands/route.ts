import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson, generateId } from "@/lib/store";
import { auth } from "@/lib/auth";

type Brand = { id: string; name: string; slug: string };

export async function GET() {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
        return NextResponse.json({ ok: false, error: "Yetkisiz" }, { status: 401 });
    }
    const brands = readJson<Brand[]>("brands.json", []);
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
    const brands = readJson<Brand[]>("brands.json", []);
    if (brands.some((b) => b.slug === slug)) return NextResponse.json({ ok: false, error: "Slug zaten kullanılıyor" }, { status: 409 });
    const brand: Brand = { id: generateId("brand"), name, slug };
    brands.push(brand);
    writeJson("brands.json", brands);
    return NextResponse.json({ ok: true, brand });
}

export async function PUT(req: NextRequest) {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
        return NextResponse.json({ ok: false, error: "Yetkisiz" }, { status: 401 });
    }
    const body = (await req.json().catch(() => null)) as Brand | null;
    if (!body) return NextResponse.json({ ok: false, error: "Geçersiz gövde" }, { status: 400 });
    const brands = readJson<Brand[]>("brands.json", []);
    const idx = brands.findIndex((b) => b.id === body.id);
    if (idx === -1) return NextResponse.json({ ok: false }, { status: 404 });
    const name = String(body.name || "").trim();
    const slug = String(body.slug || "").trim();
    if (!name || !slug) return NextResponse.json({ ok: false, error: "Ad ve slug zorunlu" }, { status: 400 });
    if (!/^[a-z0-9-]+$/.test(slug)) return NextResponse.json({ ok: false, error: "Slug yalnızca kucuk harf, rakam ve tire içerebilir" }, { status: 400 });
    if (brands.some((b, i) => i !== idx && b.slug === slug)) return NextResponse.json({ ok: false, error: "Slug zaten kullanılıyor" }, { status: 409 });
    brands[idx] = { ...brands[idx], name, slug };
    writeJson("brands.json", brands);
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
    const brands = readJson<Brand[]>("brands.json", []);
    const next = brands.filter((b) => b.id !== id);
    writeJson("brands.json", next);
    return NextResponse.json({ ok: true });
}


