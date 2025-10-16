import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import path from "path";
import fs from "fs";
import { uploadBufferToS3 } from "@/lib/s3";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
        return NextResponse.json({ ok: false, error: "Yetkisiz" }, { status: 401 });
    }
    const form = await req.formData();
    const kind = String(form.get("kind") || ""); // product | brand
    const slug = String(form.get("slug") || "");
    const file = form.get("file") as unknown as File | null;

    if (!file || !kind || !slug) return NextResponse.json({ ok: false, error: "Eksik alan" }, { status: 400 });

    const bytes = Buffer.from(await file.arrayBuffer());
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const subdir = kind === "brand" ? "brands" : "images";
    const rel = `${subdir}/${slug}.${ext}`;

    // Eğer S3 env'leri tanımlıysa S3'e yükle, değilse local FS (dev) kullan
    if (process.env.S3_BUCKET && process.env.S3_REGION && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY) {
        const url = await uploadBufferToS3({
            bucket: process.env.S3_BUCKET!,
            key: rel,
            contentType: file.type || `image/${ext}`,
            bytes,
            acl: process.env.S3_ACL || "public-read",
        });
        return NextResponse.json({ ok: true, path: url });
    }

    // Local/dev fallback
    const relLocal = `/${rel}`;
    const outPath = path.join(process.cwd(), "public", subdir);
    if (!fs.existsSync(outPath)) fs.mkdirSync(outPath, { recursive: true });
    fs.writeFileSync(path.join(process.cwd(), "public", relLocal), bytes);

    return NextResponse.json({ ok: true, path: relLocal });
}


