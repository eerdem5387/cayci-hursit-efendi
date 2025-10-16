import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
    const { pathname, origin, search } = req.nextUrl;

    if (pathname === "/admin/setup") {
        return NextResponse.next();
    }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const role = (req.auth?.user as any)?.role;
    const hasUser = !!(req.auth && (req.auth.user as any)?.email);
    if (!hasUser) {
            const url = new URL(`/auth/signin?callbackUrl=${encodeURIComponent(pathname + (search || ""))}`, origin);
            return NextResponse.redirect(url);
        }
    if (role !== "admin") {
            return NextResponse.redirect(new URL("/", origin));
        }
    }

    if (
        pathname === "/profil" ||
        pathname.startsWith("/profil/") ||
        pathname === "/siparislerim" ||
        pathname.startsWith("/siparislerim/")
  ) {
    const hasUser = !!(req.auth && (req.auth.user as any)?.email);
    if (!hasUser) {
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


