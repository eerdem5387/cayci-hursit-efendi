import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

type HomeContent = {
    popularIds: string[];
    pillars: { title: string; subtitle: string; text: string }[];
    video: { src: string; overlayTitle: string; overlaySubtitle: string; overlayText: string };
};

const DEFAULTS: HomeContent = {
    popularIds: [],
    pillars: [
        { title: "1983'den beri", subtitle: "Miras & Gelenek", text: "..." },
        { title: "Saf & Doğal", subtitle: "Gerçek Çay Tadı", text: "..." },
        { title: "Kalite", subtitle: "Tarladan Bardağınıza El Değmeden", text: "..." },
    ],
    video: {
        src: "/hero.mp4",
        overlayTitle: "Tarladan Fincanınıza",
        overlaySubtitle: "Çaycı Hurşit Efendi Yolculuğu",
        overlayText: "Bağımsız olarak sahip olunan, organik çaylar ...",
    },
};

export async function GET() {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
        return NextResponse.json({ ok: false, error: "Yetkisiz" }, { status: 401 });
    }
    const row = await prisma.homeContentKV.findUnique({ where: { id: 1 } });
    const home = (row?.value as any) || DEFAULTS;
    return NextResponse.json(home);
}

export async function PUT(req: NextRequest) {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
        return NextResponse.json({ ok: false, error: "Yetkisiz" }, { status: 401 });
    }
    const body = (await req.json().catch(() => null)) as Partial<HomeContent> | null;
    if (!body) return NextResponse.json({ ok: false }, { status: 400 });
    const currentRow = await prisma.homeContentKV.findUnique({ where: { id: 1 } });
    const current = ((currentRow?.value as any) || DEFAULTS) as HomeContent;
    const merged: HomeContent = {
        popularIds: body.popularIds ?? current.popularIds,
        pillars: body.pillars ?? current.pillars,
        video: body.video ? { ...current.video, ...body.video } : current.video,
    };
    await prisma.homeContentKV.upsert({
        where: { id: 1 },
        update: { value: merged as any },
        create: { id: 1, value: merged as any },
    });
    return NextResponse.json({ ok: true });
}


