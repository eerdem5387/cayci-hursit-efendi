import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

const ORDER_KEY = "brandOrder";

export async function GET() {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
        return NextResponse.json({ ok: false, error: "Yetkisiz" }, { status: 401 });
    }
    const row = await prisma.settingKV.findUnique({ where: { key: ORDER_KEY } });
    const order = (Array.isArray((row as any)?.value) ? (row as any).value : []) as string[];
    return NextResponse.json({ ok: true, order });
}

export async function PUT(req: NextRequest) {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
        return NextResponse.json({ ok: false, error: "Yetkisiz" }, { status: 401 });
    }
    const body = (await req.json().catch(() => null)) as { order: string[] } | null;
    if (!body || !Array.isArray(body.order)) {
        return NextResponse.json({ ok: false, error: "Geçersiz gövde" }, { status: 400 });
    }
    const order = body.order.filter((id) => typeof id === "string");
    await prisma.settingKV.upsert({
        where: { key: ORDER_KEY },
        update: { value: order as any },
        create: { key: ORDER_KEY, value: order as any },
    });
    return NextResponse.json({ ok: true });
}


