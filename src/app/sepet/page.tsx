"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Item = { slug: string; qty: number };
type Product = { id: string; name: string; slug: string; price: number; weightKg?: number | null; images?: string[] };

export default function CartPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const load = () => {
    fetch("/api/cart").then((r) => r.json()).then(setItems);
    fetch("/api/products").then((r) => r.json()).then(setProducts);
  };
  useEffect(() => { load(); }, []);

  const updateQty = async (slug: string, qty: number) => {
    await fetch("/api/cart", { method: "PUT", body: JSON.stringify({ slug, qty }) });
    load();
  };
  const remove = async (slug: string) => {
    await fetch(`/api/cart?slug=${slug}`, { method: "DELETE" });
    load();
  };

  const getProduct = (slug: string) => products.find(p => p.slug === slug);
  const total = items.reduce((sum, item) => {
    const product = getProduct(item.slug);
    return sum + (product?.price || 0) * item.qty;
  }, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8 md:px-6 md:py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 sm:mb-8 sm:text-3xl">Sepetim</h1>
      
      {items.length === 0 ? (
        <div className="text-center py-12 sm:py-16">
          <div className="text-gray-500 text-base sm:text-lg mb-4">Sepetiniz boş</div>
          <Link href="/urunlerimiz" className="inline-block rounded-lg bg-emerald-700 px-6 py-3 text-base font-medium text-white hover:bg-emerald-800 transition-colors touch-manipulation">
            Alışverişe Devam Et
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="space-y-3 sm:space-y-4">
              {items.map((item) => {
                const product = getProduct(item.slug);
                if (!product) return null;
                
                const imageSrc = product.images?.[0] || `/images/${product.slug}.jpg`;
                const itemTotal = (product.price || 0) * item.qty;
                
                return (
                  <div key={item.slug} className="flex flex-col sm:flex-row gap-3 sm:gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
                    <div className="flex gap-3 sm:gap-4 flex-1">
                      <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        <Image 
                          src={imageSrc} 
                          alt={product.name}
                          fill
                          className="object-contain"
                          sizes="80px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                        {product.weightKg && (
                          <div className="text-xs sm:text-sm text-gray-600 mt-1">{product.weightKg} kg</div>
                        )}
                        <div className="mt-2 text-lg sm:text-xl font-bold text-emerald-700">
                          {product.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          Toplam: {itemTotal.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end sm:gap-2 border-t sm:border-t-0 sm:border-l border-gray-200 sm:pl-4 pt-3 sm:pt-0">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => updateQty(item.slug, Math.max(1, item.qty - 1))}
                          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
                          aria-label="Azalt"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <input 
                          type="number" 
                          min={1} 
                          value={item.qty} 
                          onChange={(e) => updateQty(item.slug, Number(e.target.value))} 
                          className="w-14 sm:w-16 rounded-lg border border-gray-300 px-2 py-2 text-center text-sm font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                        />
                        <button 
                          onClick={() => updateQty(item.slug, item.qty + 1)}
                          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
                          aria-label="Artır"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                      <button 
                        onClick={() => remove(item.slug)}
                        className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 active:bg-red-200 transition-colors touch-manipulation"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span className="hidden sm:inline">Kaldır</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="sticky top-4 rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Özeti</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ara Toplam</span>
                  <span className="font-medium">{total.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Kargo</span>
                  <span className="font-medium text-emerald-700">Ücretsiz</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Toplam</span>
                    <span className="text-emerald-700">{total.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</span>
                  </div>
                </div>
              </div>
              <Link 
                href="/odeme" 
                className="mt-6 block w-full rounded-lg bg-emerald-700 px-4 py-3.5 text-center text-base font-semibold text-white hover:bg-emerald-800 active:bg-emerald-900 transition-colors touch-manipulation"
              >
                Ödeme Adımına Geç
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


