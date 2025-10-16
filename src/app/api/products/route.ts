import { NextResponse } from "next/server";
import { readJson } from "@/lib/store";

type Product = { id: string; name: string; slug: string; brandId?: string; price: number };

export async function GET() {
    const products = readJson<Product[]>("products.json", []);
    return NextResponse.json(products);
}


