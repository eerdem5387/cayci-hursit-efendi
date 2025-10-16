import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Use NextAuth's middleware helper so req.auth is populated on Edge
export default auth((req) => {
    const { pathname, origin, search } = req.nextUrl;

    // Allow initial admin setup to everyone
    if (pathname === "/admin/setup") {
        return NextResponse.next();
    }

    // Protect admin area
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
        const role = (req.auth?.user as any)?.role;
        if (!req.auth) {
            const url = new URL(`/auth/signin?callbackUrl=${encodeURIComponent(pathname + (search || ""))}`, origin);
            return NextResponse.redirect(url);
        }
        if (role !== "admin") {
            return NextResponse.redirect(new URL("/", origin));
        }
        return NextResponse.next();
    }

    // Require login for member areas
    if (pathname === "/profil" || pathname.startsWith("/profil/") || pathname === "/siparislerim" || pathname.startsWith("/siparislerim/")) {
        if (!req.auth) {
            const url = new URL(`/auth/signin?callbackUrl=${encodeURIComponent(pathname + (search || ""))}`, origin);
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        "/admin",
        "/admin/:path*",
        "/profil",
        "/profil/:path*",
        "/siparislerim",
        "/siparislerim/:path*",
    ],
};