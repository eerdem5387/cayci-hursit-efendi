import { readJson } from "@/lib/store";

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
    stock?: number;
    images?: string[];
};
export type Settings = {
    site: { title: string; description: string };
    smtp: { host: string; port: number; user: string; pass: string; from: string };
    payments: { ziraatPos: { merchantId?: string; terminalId?: string; posUrl?: string } };
};
export type HomeContent = {
    popularIds: string[];
    pillars: { title: string; subtitle: string; text: string }[];
    video: { src: string; overlayTitle: string; overlaySubtitle: string; overlayText: string };
};

export function getBrands(): Brand[] {
    return readJson<Brand[]>("brands.json", []);
}

export function getProducts(): Product[] {
    return readJson<Product[]>("products.json", []);
}

export function getHome(): HomeContent {
    return readJson<HomeContent>("home.json", {
        popularIds: [],
        pillars: [],
        video: { src: "/hero.mp4", overlayTitle: "", overlaySubtitle: "", overlayText: "" },
    });
}

export function getSettings(): Settings {
    return readJson<Settings>("settings.json", {
        site: { title: "Çaycı Hurşit Efendi", description: "Gerçek çay tadı" },
        smtp: { host: "", port: 587, user: "", pass: "", from: "" },
        payments: { ziraatPos: {} },
    });
}


