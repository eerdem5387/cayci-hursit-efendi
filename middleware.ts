import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req: NextRequest) {
  const { pathname, origin, search } = req.nextUrl;

  // Allow initial admin setup
  if (pathname === "/admin/setup") {
    return NextResponse.next();
  }

  // Basic cookie-based check first (robust in dev even without NEXTAUTH_SECRET)
  const sessionCookie =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value ||
    null;

  let token: any = null;
  try {
    token = await getToken({ req });
  } catch {
    // ignore; we'll fall back to cookie presence
  }
  const isAuthenticated = !!(token || sessionCookie);
  const role = (token as any)?.role as string | undefined;

  // Protect admin
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(
        new URL(`/auth/signin?callbackUrl=${encodeURIComponent(pathname + (search || ""))}`, origin)
      );
    }
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", origin));
    }
    return NextResponse.next();
  }

  // Require login for member areas
  if (
    pathname === "/profil" ||
    pathname.startsWith("/profil/") ||
    pathname === "/siparislerim" ||
    pathname.startsWith("/siparislerim/")
  ) {
    if (!isAuthenticated) {
      return NextResponse.redirect(
        new URL(`/auth/signin?callbackUrl=${encodeURIComponent(pathname + (search || ""))}`, origin)
      );
    }
  }

  return NextResponse.next();
}

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


