import { getBrands, getProducts } from "@/lib/data";
import ProductsPageContent from "@/components/ProductsPageContent";

export const metadata = { title: "Ürünlerimiz" };

export default async function ProductsPage({ searchParams }: { searchParams?: Promise<{ marka?: string }> }) {
  const products = await getProducts();
  const brands = await getBrands();
  const sp = searchParams ? await searchParams : undefined;
  const brandParam = (sp?.marka as string) || null;
  const brand = (brands as any[]).find((b: any) => b.slug === brandParam) || null;
  const filtered = (brand ? (products as any[]).filter((p: any) => p.brandId === (brand as any).id) : (products as any[])) as any[];

  return (
    <ProductsPageContent 
      products={products}
      brands={brands}
      brandParam={brandParam}
      brand={brand}
      filtered={filtered}
    />
  );
}


