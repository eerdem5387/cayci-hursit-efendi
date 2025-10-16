import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
    const items = await prisma.cartItem.findMany();
    return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
    const { slug, qty } = await req.json();
    if (!slug || !qty) return NextResponse.json({ ok: false }, { status: 400 });
    const existing = await prisma.cartItem.findFirst({ where: { slug } });
    if (!existing) {
        await prisma.cartItem.create({ data: { slug, qty } });
    } else {
        await prisma.cartItem.update({ where: { id: existing.id }, data: { qty: existing.qty + Number(qty) } });
    }
    return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest) {
    const { slug, qty } = await req.json();
    const existing = await prisma.cartItem.findFirst({ where: { slug } });
    if (existing) {
        await prisma.cartItem.update({ where: { id: existing.id }, data: { qty: Number(qty) } });
    }
    return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    if (slug) {
        const existing = await prisma.cartItem.findFirst({ where: { slug } });
        if (existing) await prisma.cartItem.delete({ where: { id: existing.id } });
    } else {
        // slug verilmezse tüm sepeti temizle
        await prisma.cartItem.deleteMany();
    }
    return NextResponse.json({ ok: true });
}


