import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

/**
 * Admin şifre sıfırlama endpoint'i
 * Bu endpoint, admin kullanıcısının şifresini bcrypt ile hash'leyerek günceller
 * 
 * Kullanım:
 * POST /api/admin/reset-password
 * Body: { email: "admin@example.com", newPassword: "yeniSifre123" }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Yetkisiz" }, { status: 401 });
    }

    const { email, newPassword } = await req.json();
    
    if (!email || !newPassword) {
      return NextResponse.json({ ok: false, error: "E-posta ve şifre gerekli" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ ok: false, error: "Şifre en az 6 karakter olmalı" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ ok: false, error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    // Şifreyi bcrypt ile hash'le
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Şifreyi güncelle
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ ok: true, message: "Şifre başarıyla güncellendi" });
  } catch (e: any) {
    console.error("/api/admin/reset-password failed:", e);
    return NextResponse.json({ ok: false, error: e?.message || "Hata" }, { status: 500 });
  }
}

