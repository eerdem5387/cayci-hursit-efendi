import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export default async function middleware(req: NextRequest) {
    const { pathname, origin, search } = req.nextUrl;
    const session = await auth();

    // Admin setup: herkes erişebilir (ilk kurulum için)
    if (pathname === "/admin/setup") {
        return NextResponse.next();
    }

    // Admin alanı: sadece admin rolü
    if (pathname.startsWith("/admin")) {
        if (!session) {
            const url = new URL(`/auth/signin?callbackUrl=${encodeURIComponent(pathname + (search || ""))}`, origin);
            return NextResponse.redirect(url);
        }
        const role = (session.user as any)?.role;
        if (role !== "admin") {
            return NextResponse.redirect(new URL("/", origin));
        }
        return NextResponse.next();
    }

    // Üye alanları: giriş gerekli
    if (pathname.startsWith("/profil") || pathname.startsWith("/siparislerim")) {
        if (!session) {
            const url = new URL(`/auth/signin?callbackUrl=${encodeURIComponent(pathname + (search || ""))}`, origin);
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/profil/:path*", "/siparislerim/:path*"],
};