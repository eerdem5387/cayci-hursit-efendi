import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/store";

type Settings = {
    site: { title: string; description: string };
    smtp: { host: string; port: number; user: string; pass: string; from: string };
    notifications?: { adminEmail?: string };
    payments: { ziraatPos: { merchantId?: string; terminalId?: string; posUrl?: string } };
};

const DEFAULTS: Settings = {
    site: { title: "Çaycı Hurşit Efendi", description: "Gerçek çay tadı" },
    smtp: { host: "", port: 587, user: "", pass: "", from: "" },
    notifications: { adminEmail: "" },
    payments: { ziraatPos: { merchantId: "", terminalId: "", posUrl: "" } },
};

export async function GET() {
    const settings = readJson<Settings>("settings.json", DEFAULTS);
    return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
    const incoming = (await req.json().catch(() => null)) as Partial<Settings> | null;
    if (!incoming) return NextResponse.json({ ok: false }, { status: 400 });
    const current = readJson<Settings>("settings.json", DEFAULTS);
    const merged: Settings = {
        site: { ...current.site, ...(incoming.site || {}) },
        smtp: { ...current.smtp, ...(incoming.smtp || {}) },
        notifications: { ...current.notifications, ...(incoming.notifications || {}) },
        payments: {
            ziraatPos: { ...current.payments.ziraatPos, ...(incoming.payments?.ziraatPos || {}) },
        },
    };
    writeJson("settings.json", merged);
    return NextResponse.json({ ok: true });
}


