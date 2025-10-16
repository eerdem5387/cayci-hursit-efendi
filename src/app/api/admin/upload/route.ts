import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    const form = await req.formData();
    const kind = String(form.get("kind") || ""); // product | brand
    const slug = String(form.get("slug") || "");
    const file = form.get("file") as unknown as File | null;

    if (!file || !kind || !slug) return NextResponse.json({ ok: false, error: "Eksik alan" }, { status: 400 });

    const bytes = Buffer.from(await file.arrayBuffer());
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const subdir = kind === "brand" ? "brands" : "images";
    const rel = `/${subdir}/${slug}.${ext}`;
    const outPath = path.join(process.cwd(), "public", subdir);
    if (!fs.existsSync(outPath)) fs.mkdirSync(outPath, { recursive: true });
    fs.writeFileSync(path.join(process.cwd(), "public", rel), bytes);

    return NextResponse.json({ ok: true, path: rel });
}


