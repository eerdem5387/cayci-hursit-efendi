"use client";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import CheckoutSteps from "@/components/CheckoutSteps";
import { emitCartChanged } from "@/lib/cartClient";
import { formatTRY } from "@/lib/orderStatus";

type Line = { slug: string; qty: number; name: string; price: number; lineTotal: number; image: string; weightKg: number | null; stock: number | null };
type Cart = { items: Line[]; count: number; total: number; removed: string[] };

function CartPageInner() {
  const router = useRouter();
  const search = useSearchParams();
  const [cart, setCart] = useState<Cart | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const noticeShown = useRef(false);

  const apply = useCallback((c: Cart) => {
    setCart(c);
    emitCartChanged(c.count);
  }, []);

  useEffect(() => {
    fetch("/api/cart", { cache: "no-store" }).then((r) => r.json()).then(apply).catch(() => setCart({ items: [], count: 0, total: 0, removed: [] }));
  }, [apply]);

  // Ürün sayfasından "Sepete Ekle" ile gelindiyse bilgi göster, adres çubuğunu temizle
  useEffect(() => {
    if (noticeShown.current) return;
    const added = search.get("eklendi");
    const err = search.get("hata");
    if (added || err) {
      noticeShown.current = true;
      setNotice(err ? { tone: "err", text: err } : { tone: "ok", text: "Ürün sepetinize eklendi." });
      router.replace("/sepet", { scroll: false });
    }
  }, [search, router]);

  const mutate = async (slug: string, init: RequestInit, url = "/api/cart") => {
    setBusy(slug);
    try {
      const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json" } });
      const data = await res.json();
      if (data?.cart) apply(data.cart);
      if (!data?.ok) setNotice({ tone: "err", text: data?.error || "Sepet güncellenemedi" });
    } catch {
      setNotice({ tone: "err", text: "Bağlantı hatası. Lütfen tekrar deneyin." });
    } finally {
      setBusy(null);
    }
  };

  const updateQty = (slug: string, qty: number) => mutate(slug, { method: "PUT", body: JSON.stringify({ slug, qty }) });
  const remove = (slug: string) => mutate(slug, { method: "DELETE" }, `/api/cart?slug=${encodeURIComponent(slug)}`);

  if (!cart) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
        <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
        <div className="mt-8 grid gap-4">
          {[0, 1].map((i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-100" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-10 md:px-6">
      <CheckoutSteps current={0} />
      <h1 className="mb-6 text-2xl font-bold text-gray-900 sm:text-3xl">Sepetim {cart.count > 0 && <span className="text-base font-medium text-gray-500">({cart.count} ürün)</span>}</h1>

      {notice && (
        <div role="status" className={`mb-5 flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${notice.tone === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>
          <span>{notice.text}</span>
          <button onClick={() => setNotice(null)} className="font-semibold opacity-70 hover:opacity-100" aria-label="Kapat">✕</button>
        </div>
      )}
      {cart.removed.length > 0 && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Şu ürünler artık satışta olmadığı için sepetinizden çıkarıldı: {cart.removed.join(", ")}
        </div>
      )}

      {cart.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 12.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
          </div>
          <div className="mb-1 text-lg font-semibold text-gray-900">Sepetiniz boş</div>
          <p className="mb-6 text-sm text-gray-600">Taze çaylarımıza göz atın, beğendiklerinizi sepete ekleyin.</p>
          <Link href="/urunlerimiz" className="inline-block rounded-lg bg-emerald-700 px-6 py-3 text-base font-medium text-white hover:bg-emerald-800">
            Ürünlere Göz At
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <ul className="space-y-3 lg:col-span-2">
            {cart.items.map((item) => {
              const max = item.stock === null ? 99 : Math.min(99, item.stock);
              const isBusy = busy === item.slug;
              return (
                <li key={item.slug} className={`flex gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-opacity ${isBusy ? "opacity-60" : ""}`}>
                  <Link href={`/urun/${item.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-50 sm:h-24 sm:w-24">
                    <Image src={item.image} alt={item.name} fill className="object-contain" sizes="96px" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link href={`/urun/${item.slug}`} className="line-clamp-2 font-semibold text-gray-900 hover:text-emerald-800">{item.name}</Link>
                        <div className="mt-0.5 text-sm text-gray-500">
                          {item.weightKg ? `${item.weightKg} kg · ` : ""}{formatTRY(item.price)}
                        </div>
                      </div>
                      <button
                        onClick={() => remove(item.slug)}
                        disabled={isBusy}
                        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        aria-label={`${item.name} ürününü sepetten çıkar`}
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                    <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                      <div className="inline-flex items-center rounded-lg border border-gray-300">
                        <button
                          onClick={() => (item.qty <= 1 ? remove(item.slug) : updateQty(item.slug, item.qty - 1))}
                          disabled={isBusy}
                          className="flex h-10 w-10 items-center justify-center text-lg text-gray-700 hover:bg-gray-50"
                          aria-label="Azalt"
                        >−</button>
                        <span className="w-10 text-center text-sm font-semibold" aria-live="polite">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.slug, item.qty + 1)}
                          disabled={isBusy || item.qty >= max}
                          className="flex h-10 w-10 items-center justify-center text-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                          aria-label="Artır"
                        >+</button>
                      </div>
                      <div className="text-right text-base font-bold text-gray-900 sm:text-lg">{formatTRY(item.lineTotal)}</div>
                    </div>
                    {item.qty >= max && item.stock !== null && <div className="mt-1 text-xs text-amber-700">Stokta bu üründen en fazla {max} adet var.</div>}
                  </div>
                </li>
              );
            })}
            <li>
              <Link href="/urunlerimiz" className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800">← Alışverişe devam et</Link>
            </li>
          </ul>

          <aside className="lg:col-span-1">
            <div className="sticky top-28 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Sipariş Özeti</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-gray-600">Ara toplam</dt><dd className="font-medium">{formatTRY(cart.total)}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-600">Kargo</dt><dd className="font-medium text-emerald-700">Ücretsiz</dd></div>
                <div className="flex justify-between border-t border-gray-200 pt-3 text-lg font-bold"><dt>Toplam</dt><dd className="text-emerald-700">{formatTRY(cart.total)}</dd></div>
              </dl>
              <Link
                href="/odeme"
                aria-disabled={!!busy}
                className={`mt-6 block w-full rounded-lg bg-emerald-700 px-4 py-3.5 text-center text-base font-semibold text-white hover:bg-emerald-800 ${busy ? "pointer-events-none opacity-60" : ""}`}
              >
                Siparişi Tamamla
              </Link>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-500">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Ziraat Bankası 3D Secure ile güvenli ödeme
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={null}>
      <CartPageInner />
    </Suspense>
  );
}
