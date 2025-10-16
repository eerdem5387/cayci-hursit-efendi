import { prisma } from "@/lib/db";

export type Brand = { id: string; name: string; slug: string };
export type Product = {
    id: string;
    name: string;
    slug: string;
    brandId?: string;
    price: number;
    popular?: boolean;
    description?: string;
    weightKg?: number | null;
    stock?: number | null;
    order?: number;
    images?: string[];
};
export type Settings = {
    site: { title: string; description: string };
    smtp: { host: string; port: number; user: string; pass: string; from: string };
    notifications?: { adminEmail?: string };
    payments: { ziraatPos: { merchantId?: string; terminalId?: string; posUrl?: string } };
};
export type HomeContent = {
    popularIds: string[];
    pillars: { title: string; subtitle: string; text: string }[];
    video: { src: string; overlayTitle: string; overlaySubtitle: string; overlayText: string };
};

export async function getBrands(): Promise<Brand[]> {
    return prisma.brand.findMany({ orderBy: { name: "asc" } });
}

export async function getProducts(): Promise<Product[]> {
    const rows = await prisma.product.findMany({ orderBy: { name: "asc" } });
    return rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        brandId: r.brandId ?? undefined,
        price: r.price,
        popular: !!r.popular,
        description: r.description ?? "",
        weightKg: r.weightKg ?? null,
        stock: r.stock ?? null,
        order: r.order ?? undefined,
        images: Array.isArray(r.images) ? (r.images as string[]) : undefined,
    })) as Product[];
}

export async function getHome(): Promise<HomeContent> {
    const row = await prisma.homeContentKV.findUnique({ where: { id: 1 } });
    return (row?.value as any) || { popularIds: [], pillars: [], video: { src: "/hero.mp4", overlayTitle: "", overlaySubtitle: "", overlayText: "" } };
}

export async function getSettings(): Promise<Settings> {
    const row = await prisma.settingKV.findUnique({ where: { key: "settings" } });
    return (row?.value as any) || { site: { title: "Çaycı Hurşit Efendi", description: "Gerçek çay tadı" }, smtp: { host: "", port: 587, user: "", pass: "", from: "" }, notifications: { adminEmail: "" }, payments: { ziraatPos: {} } };
}


