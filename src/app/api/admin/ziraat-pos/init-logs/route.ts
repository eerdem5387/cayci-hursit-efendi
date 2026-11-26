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
    const raw = Array.isArray((row as any)?.value) ? ((row as any).value as any[]) : [];
    // Eski kayıtlarda mağaza anahtarını içeren "plain" metni ve hash vardı: temizle ve kalıcı olarak sil
    const dirty = raw.some((l) => l && (l.plain || l.params));
    const logs = raw.map(({ plain: _p, params: _q, ...rest }: any) => rest);
    if (dirty) {
        await prisma.settingKV.update({ where: { key: KEY }, data: { value: logs as any } }).catch(() => {});
    }
    return NextResponse.json({ ok: true, logs });
}

export async function DELETE() {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
        return NextResponse.json({ ok: false, error: "Yetkisiz" }, { status: 401 });
    }
    await prisma.settingKV.upsert({ where: { key: KEY }, update: { value: [] as any }, create: { key: KEY, value: [] as any } });
    return NextResponse.json({ ok: true });
}


