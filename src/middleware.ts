import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
    // Admin setup sayfası için koruma yok
    if (req.nextUrl.pathname === "/admin/setup") {
        return NextResponse.next();
    }

    // Şimdilik diğer korumaları devre dışı bırakıyoruz
    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/profil/:path*", "/siparislerim/:path*"],
};