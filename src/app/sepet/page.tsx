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
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Sepetim</h1>
      
      {items.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">Sepetiniz boş</div>
          <Link href="/urunlerimiz" className="inline-block rounded bg-emerald-700 px-6 py-3 text-white hover:bg-emerald-800">
            Alışverişe Devam Et
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => {
                const product = getProduct(item.slug);
                if (!product) return null;
                
                const imageSrc = product.images?.[0] || `/images/${product.slug}.jpg`;
                
                return (
                  <div key={item.slug} className="flex gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <Image 
                        src={imageSrc} 
                        alt={product.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{product.name}</h3>
                      {product.weightKg && (
                        <div className="text-sm text-gray-600">{product.weightKg} kg</div>
                      )}
                      <div className="mt-2 text-xl font-bold text-emerald-700">
                        {product.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => updateQty(item.slug, Math.max(1, item.qty - 1))}
                          className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 hover:bg-gray-50"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <input 
                          type="number" 
                          min={1} 
                          value={item.qty} 
                          onChange={(e) => updateQty(item.slug, Number(e.target.value))} 
                          className="w-16 rounded border border-gray-300 px-2 py-1 text-center"
                        />
                        <button 
                          onClick={() => updateQty(item.slug, item.qty + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 hover:bg-gray-50"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                      <button 
                        onClick={() => remove(item.slug)}
                        className="flex items-center gap-1 rounded border border-red-200 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Kaldır
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Özeti</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Ara Toplam</span>
                  <span>{total.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Kargo</span>
                  <span className="text-emerald-700">Ücretsiz</span>
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
                className="mt-6 block w-full rounded-lg bg-emerald-700 px-4 py-3 text-center font-semibold text-white hover:bg-emerald-800"
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


