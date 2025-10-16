import { NextResponse } from "next/server";

export async function POST() {
    const res = NextResponse.redirect(new URL("/admin/login", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"));
    res.cookies.set("admin_token", "", { path: "/", maxAge: 0 });
    return res;
}


