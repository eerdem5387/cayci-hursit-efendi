import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

const KEY = "ziraatPosInitLogs";

export async function GET() {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
        return NextResponse.json({ ok: false, error: "Yetkisiz" }, { status: 401 });
    }
    const row = await prisma.settingKV.findUnique({ where: { key: KEY } });
    return NextResponse.json({ ok: true, logs: (row as any)?.value || [] });
}

export async function DELETE() {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
        return NextResponse.json({ ok: false, error: "Yetkisiz" }, { status: 401 });
    }
    await prisma.settingKV.upsert({ where: { key: KEY }, update: { value: [] as any }, create: { key: KEY, value: [] as any } });
    return NextResponse.json({ ok: true });
}


