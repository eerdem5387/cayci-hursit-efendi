import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { readJson, writeJson, generateId } from "@/lib/store";
import { User } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const { email, password, name } = await req.json();

        if (!email || !password || !name) {
            return NextResponse.json({ error: "Tüm alanlar zorunlu" }, { status: 400 });
        }

        const users = readJson<User[]>("users.json", []);

        // E-posta kontrolü
        if (users.some(u => u.email === email)) {
            return NextResponse.json({ error: "Bu e-posta adresi zaten kullanılıyor" }, { status: 400 });
        }

        // Şifreyi hash'le
        const hashedPassword = await bcrypt.hash(password, 12);

        // Admin kullanıcısı oluştur
        const adminUser: User & { password: string } = {
            id: generateId("user"),
            email,
            name,
            role: "admin",
            createdAt: new Date().toISOString(),
            password: hashedPassword,
        };

        users.push(adminUser);
        writeJson("users.json", users);

        return NextResponse.json({ success: true, message: "Admin kullanıcısı oluşturuldu" });
    } catch (error) {
        return NextResponse.json({ error: "Admin oluşturma sırasında hata oluştu" }, { status: 500 });
    }
}
