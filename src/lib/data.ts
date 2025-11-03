import { prisma } from "@/lib/db";
import { unstable_noStore as noStore } from "next/cache";

export type Brand = { id: string; name: string; slug: string; logoUrl?: string | null };
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
    payments: {
        ziraatPos: {
            merchantId?: string;
            terminalId?: string;
            posUrl?: string; // 3D URL
            apiUrl?: string; // API URL
            storeKey?: string;
            username?: string; // Prov user
            password?: string; // Prov password
            storeType?: string; // e.g. 3d_pay_hosting
        }
    };
};
export type HomeContent = {
    popularIds: string[];
    pillars: { title: string; subtitle: string; text: string }[];
    video: { src: string; overlayTitle: string; overlaySubtitle: string; overlayText: string };
};

export async function getBrands(): Promise<Brand[]> {
    noStore();
    const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });
    // Apply custom order if exists
    const orderRow = await prisma.settingKV.findUnique({ where: { key: "brandOrder" } });
    const order = (Array.isArray((orderRow as any)?.value) ? (orderRow as any).value : []) as string[];
    if (!order.length) return brands as any;
    const idToBrand = new Map((brands as any[]).map((b: any) => [b.id, b]));
    const ordered = order.map((id) => idToBrand.get(id)).filter(Boolean) as any[];
    const remaining = (brands as any[]).filter((b: any) => !order.includes(b.id));
    return [...ordered, ...remaining] as any;
}

export async function getProducts(): Promise<Product[]> {
    noStore();
    const rows = await prisma.product.findMany({ orderBy: { name: "asc" } });
    const orderRow = await prisma.settingKV.findUnique({ where: { key: "productOrderMap" } });
    const orderMap = ((orderRow?.value as any) || {}) as Record<string, number>;
    const mapped = rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        brandId: r.brandId ?? undefined,
        price: r.price,
        popular: !!r.popular,
        description: r.description ?? "",
        weightKg: r.weightKg ?? null,
        stock: r.stock ?? null,
        order: typeof orderMap[r.id] === "number" ? orderMap[r.id] : undefined,
        images: Array.isArray(r.images) ? (r.images as string[]) : undefined,
    })) as Product[];
    return mapped.sort((a: any, b: any) => {
        const ao = typeof a.order === "number" ? a.order : Number.MAX_SAFE_INTEGER;
        const bo = typeof b.order === "number" ? b.order : Number.MAX_SAFE_INTEGER;
        if (ao !== bo) return ao - bo;
        return String(a.name).localeCompare(String(b.name), "tr-TR");
    });
}

export async function getHome(): Promise<HomeContent> {
    noStore();
    const row = await prisma.homeContentKV.findUnique({ where: { id: 1 } });
    return (row?.value as any) || { popularIds: [], pillars: [], video: { src: "/hero.mp4", overlayTitle: "", overlaySubtitle: "", overlayText: "" } };
}

export async function getSettings(): Promise<Settings> {
    noStore();
    const row = await prisma.settingKV.findUnique({ where: { key: "settings" } });
    return (row?.value as any) || {
        site: { title: "Çaycı Hurşit Efendi", description: "Gerçek çay tadı" },
        smtp: { host: "", port: 587, user: "", pass: "", from: "" },
        notifications: { adminEmail: "" },
        payments: {
            ziraatPos: {
                merchantId: "",
                terminalId: "",
                posUrl: "https://sanalpos2.ziraatbank.com.tr/fim/est3Dgate",
                apiUrl: "https://sanalpos2.ziraatbank.com.tr/fim/api",
                storeKey: "",
                username: "",
                password: "",
                storeType: "3d_pay_hosting",
            }
        }
    } as any;
}


