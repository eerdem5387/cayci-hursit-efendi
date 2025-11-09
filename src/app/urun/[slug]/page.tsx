import Image from "next/image";
import { getBrands, getProducts } from "@/lib/data";
import Link from "next/link";

export async function generateStaticParams() {
  const products = await getProducts();
  return (products as any[]).map((p: any) => ({ slug: p.slug }));
}

export default async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const products = await getProducts();
  const brands = await getBrands();
  const product = (products as any[]).find((p: any) => p.slug === slug);
  if (!product) return <div className="mx-auto max-w-7xl px-4 py-10">Ürün bulunamadı.</div>;
  const brand = (product as any).brandId ? (brands as any[]).find((b: any) => b.id === (product as any).brandId) : null;
  const images: string[] = (product as any).images && (product as any).images.length > 0 ? ((product as any).images as string[]) : [];
  const inStock = (product as any).stock === null || (product as any).stock === undefined || ((product as any).stock ?? 0) > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 md:px-6 md:py-10">
      <div className="grid gap-6 sm:gap-8 md:grid-cols-2 md:gap-10">
        <div>
          <div className="relative h-[300px] sm:h-[400px] md:h-[560px] w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
            {images[0] ? (
              <Image 
                src={images[0]} 
                alt={(product as any).name} 
                fill 
                className="object-contain" 
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-500">Görsel yok</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {images.slice(1).map((src: string) => (
                <div key={src} className="relative h-16 sm:h-20 md:h-24 w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                  <Image 
                    src={src} 
                    alt={(product as any).name} 
                    fill 
                    className="object-contain" 
                    sizes="(max-width: 768px) 25vw, 12.5vw"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{(product as any).name}</h1>
            {inStock ? (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 whitespace-nowrap">
                {product.stock === null || product.stock === undefined ? "Stokta (Sınırsız)" : "Stokta"}
              </span>
            ) : (
              <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 whitespace-nowrap">Stokta yok</span>
            )}
          </div>
          {brand && <div className="mt-2 text-sm text-gray-600">Marka: {(brand as any).name}</div>}
          <div className="mt-4 text-2xl sm:text-3xl font-semibold text-emerald-700">{(product as any).price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</div>
          <ul className="mt-3 text-sm text-gray-700">
            {(product as any).weightKg ? <li>Ağırlık: {(product as any).weightKg} kg</li> : null}
          </ul>
          {(product as any).description && (
            <p className="mt-4 whitespace-pre-line text-sm sm:text-base leading-relaxed text-gray-800">{(product as any).description}</p>
          )}
          <form action="/sepet/ekle" method="post" className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input 
              type="hidden" 
              name="slug" 
              value={(product as any).slug} 
            />
            <input 
              type="number" 
              name="adet" 
              min={1} 
              defaultValue={1} 
              className="w-full sm:w-24 rounded-lg border border-gray-300 px-4 py-3 text-base text-center focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 touch-manipulation" 
            />
            <button 
              type="submit"
              disabled={!inStock} 
              className="w-full sm:w-auto rounded-lg bg-emerald-700 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-800 active:bg-emerald-900 disabled:opacity-60 disabled:cursor-not-allowed transition-colors touch-manipulation"
            >
              Sepete Ekle
            </button>
          </form>
          <div className="mt-6">
            <Link 
              href="/urunlerimiz" 
              className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors touch-manipulation"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Tüm ürünlere dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


