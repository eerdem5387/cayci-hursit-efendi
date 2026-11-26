import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/** Admin değilse 401 yanıtı döner, adminse null. */
export async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Yetkisiz" }, { status: 401 });
  }
  return null;
}
