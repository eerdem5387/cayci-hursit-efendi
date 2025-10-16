import Link from "next/link";
import { getBrands, getProducts } from "@/lib/data";

export const metadata = { title: "Ürünlerimiz" };

export default async function ProductsPage({ searchParams }: { searchParams?: Promise<{ marka?: string }> }) {
  const products = await getProducts();
  const brands = await getBrands();
  const sp = searchParams ? await searchParams : undefined;
  const brandParam = (sp?.marka as string) || null;
  const brand = (brands as any[]).find((b: any) => b.slug === brandParam) || null;
  const filtered = (brand ? (products as any[]).filter((p: any) => p.brandId === (brand as any).id) : (products as any[])) as any[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Ürünlerimiz</h1>
      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
        <span>Markaya göre filtrele:</span>
        <Link href="/urunlerimiz" className="rounded border border-gray-300 px-2 py-1 hover:border-emerald-600">Tümü</Link>
        {brands.map((b) => (
          <Link key={b.id} href={`/urunlerimiz?marka=${b.slug}`} className="rounded border border-gray-300 px-2 py-1 hover:border-emerald-600">{b.name}</Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => {
          const imageSrc = (p as any)?.images?.[0] || `/images/${p.slug}.jpg`;
          return (
          <div key={p.id} className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 aspect-square overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
              <img 
                src={imageSrc} 
                alt={p.name}
                className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105"
                style={{ maxHeight: '100%', maxWidth: '100%' }}
              />
            </div>
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{p.name}</h3>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-emerald-700">
                  {p.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                </div>
                {p.weightKg && (
                  <div className="text-sm text-gray-600">{p.weightKg} kg</div>
                )}
              </div>
              <form action="/sepet/ekle" method="post" className="flex items-center gap-2">
                <input type="hidden" name="slug" value={p.slug} />
                <input name="qty" type="number" min={1} defaultValue={1} className="w-16 rounded border border-gray-300 px-2 py-1 text-sm" />
                <button 
                  type="submit"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-white transition-colors hover:bg-emerald-800"
                  title="Sepete Ekle"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 7H6L5 9z" />
                  </svg>
                </button>
              </form>
            </div>
            <Link 
              href={`/urun/${p.slug}`} 
              className="block w-full rounded-lg border border-emerald-700 bg-transparent px-4 py-2 text-center text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-700 hover:text-white"
            >
              Detayları Gör
            </Link>
          </div>
        );})}
      </div>
    </div>
  );
}


