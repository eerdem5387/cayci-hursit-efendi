import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

const ORDER_KEY = "productOrderMap"; // { [productId]: number }

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Yetkisiz" }, { status: 401 });
  }
  const row = await prisma.settingKV.findUnique({ where: { key: ORDER_KEY } });
  const map = ((row?.value as any) || {}) as Record<string, number>;
  return NextResponse.json({ ok: true, map });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Yetkisiz" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as { id: string; order: number } | null;
  if (!body || !body.id || typeof body.order !== "number") {
    return NextResponse.json({ ok: false, error: "Geçersiz gövde" }, { status: 400 });
  }
  const currentRow = await prisma.settingKV.findUnique({ where: { key: ORDER_KEY } });
  const current = ((currentRow?.value as any) || {}) as Record<string, number>;
  const next = { ...current, [body.id]: body.order } as any;
  await prisma.settingKV.upsert({ where: { key: ORDER_KEY }, update: { value: next }, create: { key: ORDER_KEY, value: next } });
  return NextResponse.json({ ok: true });
}


