import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import path from "path";
import fs from "fs";
import { put } from "@vercel/blob";

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

    let finalUrl = "";

    // Vercel Blob varsa onu kullan
    if (process.env.BLOB_READ_WRITE_TOKEN) {
        try {
            const useOverwrite = kind === "brand"; // Marka logoları aynı isimle güncellenir
            const blob = await put(rel, bytes, {
                access: "public",
                contentType: file.type || `image/${ext}`,
                token: process.env.BLOB_READ_WRITE_TOKEN,
                allowOverwrite: useOverwrite,
                addRandomSuffix: !useOverwrite,
            });
            finalUrl = blob.url;
        } catch (e: any) {
            return NextResponse.json({ ok: false, error: e?.message || "Blob yükleme hatası" }, { status: 500 });
        }
    } else {
        // Local/dev fallback
        const relLocal = `/${rel}`;
        const outPath = path.join(process.cwd(), "public", subdir);
        if (!fs.existsSync(outPath)) fs.mkdirSync(outPath, { recursive: true });
        try {
            fs.writeFileSync(path.join(process.cwd(), "public", relLocal), bytes);
            finalUrl = relLocal;
        } catch (e: any) {
            return NextResponse.json({ ok: false, error: e?.message || "Dosya yazma hatası" }, { status: 500 });
        }
    }

    // Marka logosu ise veritabanına kaydet
    if (kind === "brand") {
        try {
            await prisma.brand.update({
                where: { slug },
                data: { logoUrl: finalUrl }
            });
        } catch (e: any) {
            console.error("Brand logo URL update failed:", e);
            // Logo yüklendi ama veritabanı güncellenemedi, yine de başarılı say
        }
    }

    // Ürün görseli ise ürüne ekle (varsa)
    if (kind === "product") {
        try {
            const prod = await prisma.product.findUnique({ where: { slug } });
            if (prod) {
                const currentImages = Array.isArray((prod as any).images) ? ((prod as any).images as string[]) : [];
                const nextImages = [...currentImages, finalUrl];
                await prisma.product.update({ where: { slug }, data: { images: nextImages as any } });
            }
        } catch (e: any) {
            console.error("Product image append failed:", e);
        }
    }

    return NextResponse.json({ ok: true, path: finalUrl });
}


