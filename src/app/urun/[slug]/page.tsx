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
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <div className="relative h-[520px] md:h-[560px] w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
            {images[0] ? (
              <Image src={images[0]} alt={(product as any).name} fill className="object-contain" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-500">Görsel yok</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {images.slice(1).map((src: string) => (
                <div key={src} className="relative h-24 w-full overflow-hidden rounded border border-gray-200 bg-gray-100">
                  <Image src={src} alt={(product as any).name} fill className="object-contain" />
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{(product as any).name}</h1>
            {inStock ? (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {product.stock === null || product.stock === undefined ? "Stokta (Sınırsız)" : "Stokta"}
              </span>
            ) : (
              <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">Stokta yok</span>
            )}
          </div>
          {brand && <div className="mt-1 text-sm text-gray-600">Marka: {(brand as any).name}</div>}
          <div className="mt-4 text-2xl font-semibold text-emerald-700">{(product as any).price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</div>
          <ul className="mt-3 text-sm text-gray-700">
            {(product as any).weightKg ? <li>Ağırlık: {(product as any).weightKg} kg</li> : null}
          </ul>
          {(product as any).description && (
            <p className="mt-4 whitespace-pre-line text-gray-800">{(product as any).description}</p>
          )}
          <form action="/sepet/ekle" method="post" className="mt-6 flex items-center gap-3">
            <input type="hidden" name="slug" value={(product as any).slug} />
            <input type="number" name="adet" min={1} defaultValue={1} className="w-20 rounded border border-gray-300 px-3 py-2" />
            <button disabled={!inStock} className="rounded bg-emerald-700 px-4 py-2 text-white disabled:opacity-60">Sepete Ekle</button>
          </form>
          <div className="mt-6">
            <Link href="/urunlerimiz" className="text-sm text-emerald-700">Tüm ürünlere dön</Link>
          </div>
        </div>
      </div>
    </div>
  );
}


