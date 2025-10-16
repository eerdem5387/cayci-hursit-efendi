import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { readJson, writeJson, generateId } from "@/lib/store";
import { User } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Tüm alanlar zorunlu" }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: "Şifre en az 6 karakter olmalı" }, { status: 400 });
        }

        const users = readJson<User[]>("users.json", []);

        // E-posta kontrolü
        if (users.some(u => u.email === email)) {
            return NextResponse.json({ error: "Bu e-posta adresi zaten kullanılıyor" }, { status: 400 });
        }

        // Şifreyi hash'le
        const hashedPassword = await bcrypt.hash(password, 12);

        // Yeni kullanıcı oluştur
        const newUser: User & { password: string } = {
            id: generateId("user"),
            email,
            name,
            role: "customer",
            createdAt: new Date().toISOString(),
            password: hashedPassword,
        };

        users.push(newUser);
        writeJson("users.json", users);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Kayıt sırasında hata oluştu" }, { status: 500 });
    }
}
