import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

type Settings = {
    site: { title: string; description: string };
    smtp: { host: string; port: number; user: string; pass: string; from: string };
    notifications?: { adminEmail?: string };
    payments: { ziraatPos: { merchantId?: string; terminalId?: string; posUrl?: string; apiUrl?: string; storeKey?: string; username?: string; password?: string; storeType?: string } };
};

const DEFAULTS: Settings = {
    site: { title: "Çaycı Hurşit Efendi", description: "Gerçek çay tadı" },
    smtp: { host: "", port: 587, user: "", pass: "", from: "" },
    notifications: { adminEmail: "" },
    payments: { ziraatPos: { merchantId: "", terminalId: "", posUrl: "https://sanalpos2.ziraatbank.com.tr/fim/est3Dgate", apiUrl: "https://sanalpos2.ziraatbank.com.tr/fim/api", storeKey: "", username: "", password: "", storeType: "3d_pay_hosting" } },
};

export async function GET() {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
        return NextResponse.json({ ok: false, error: "Yetkisiz" }, { status: 401 });
    }
    const row = await prisma.settingKV.findUnique({ where: { key: "settings" } });
    const settings = (row?.value as any) || DEFAULTS;
    return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
        return NextResponse.json({ ok: false, error: "Yetkisiz" }, { status: 401 });
    }
    const incoming = (await req.json().catch(() => null)) as Partial<Settings> | null;
    if (!incoming) return NextResponse.json({ ok: false }, { status: 400 });
    const currentRow = await prisma.settingKV.findUnique({ where: { key: "settings" } });
    const current = ((currentRow?.value as any) || DEFAULTS) as Settings;
    const merged: Settings = {
        site: { ...current.site, ...(incoming.site || {}) },
        smtp: { ...current.smtp, ...(incoming.smtp || {}) },
        notifications: { ...current.notifications, ...(incoming.notifications || {}) },
        payments: {
            ziraatPos: { ...current.payments.ziraatPos, ...(incoming.payments?.ziraatPos || {}) },
        },
    };
    await prisma.settingKV.upsert({ where: { key: "settings" }, update: { value: merged as any }, create: { key: "settings", value: merged as any } });
    return NextResponse.json({ ok: true });
}


