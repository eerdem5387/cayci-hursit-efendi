"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Brand = { id: string; name: string; slug: string };
type Product = { id: string; name: string; slug: string; brandId?: string; price: number; popular?: boolean; description?: string; weightKg?: number | null; stock?: number; images?: string[]; order?: number };

export default function ProductsAdmin() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [message, setMessage] = useState("");
  const flash = (m: string) => { setMessage(m); setTimeout(() => setMessage(""), 2000); };
  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  const [form, setForm] = useState<Partial<Product>>({ name: "", slug: "", price: 0, brandId: "", popular: false, description: "", weightKg: null, stock: 0 });

  const load = () => Promise.all([
    fetch("/api/admin/brands").then((r) => r.json()).then(setBrands),
    fetch("/api/admin/products").then((r) => r.json()).then(setProducts),
  ]);
  useEffect(() => { load(); }, []);

  const create = async () => {
    const name = String(form.name || "").trim();
    const slug = slugify(String(form.slug || form.name || ""));
    const price = Number(form.price || 0);
    if (!name || !slug || !Number.isFinite(price)) { alert("Ad, slug ve fiyat zorunlu"); return; }
    const res = await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      name,
      slug,
      price,
      brandId: form.brandId || undefined,
      popular: !!form.popular,
    }) });
    if (!res.ok) {
      const data = await res.json().catch(() => ({} as any));
      alert(data?.error || "Ürün eklenemedi");
      return;
    }
    setForm({ name: "", slug: "", price: 0, brandId: "", popular: false });
    load();
    flash("Ürün eklendi");
  };
  const update = async (p: Product) => {
    const name = String(p.name || "").trim();
    const slug = slugify(String(p.slug || ""));
    const price = Number(p.price);
    if (!name || !slug || !Number.isFinite(price)) { alert("Ad, slug ve fiyat zorunlu"); return; }
    const res = await fetch("/api/admin/products", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...p, name, slug, price }) });
    if (!res.ok) {
      const data = await res.json().catch(() => ({} as any));
      alert(data?.error || "Güncellenemedi");
    }
    load();
    flash("Güncellendi");
  };
  const remove = async (id: string) => {
    await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    load();
    flash("Silindi");
  };

  const brandMap = useMemo(() => Object.fromEntries(brands.map((b) => [b.id, b.name])), [brands]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
      const matchesBrand = !filterBrand || (p.brandId || "") === filterBrand;
      return matchesQuery && matchesBrand;
    }).sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [products, query, filterBrand]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page]);

  return (
    <div className="grid gap-6">
      {message && <div className="fixed bottom-4 right-4 rounded bg-emerald-700 px-3 py-2 text-sm text-white shadow">{message}</div>}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Ürünler</h1>
        <Link href="/admin/urunler/yeni" className="rounded bg-emerald-700 px-4 py-2 text-white">Ürün Ekle</Link>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <input className="rounded border border-gray-300 px-3 py-2" placeholder="Ara (ad veya slug)" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
          <select className="rounded border border-gray-300 px-3 py-2" value={filterBrand} onChange={(e) => { setFilterBrand(e.target.value); setPage(1); }}>
            <option value="">Tüm Markalar</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <div className="self-center text-sm text-gray-600">Toplam: {filtered.length}</div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-2 font-semibold">Liste</h2>
        <div className="grid gap-2">
          {pageItems.map((p, index) => (
            <div key={p.id} className="flex items-center justify-between rounded border border-gray-200 px-3 py-2">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-emerald-50 text-emerald-700">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7H4"/><path d="M20 12H4"/><path d="M20 17H4"/></svg>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">#{((page - 1) * pageSize) + index + 1}</span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-gray-900">{p.name}</div>
                    <div className="truncate text-xs text-gray-600">{p.slug} • {brandMap[p.brandId || ""] || "—"}</div>
                  </div>
                </div>
              </div>
              <div className="hidden items-center gap-3 md:flex">
                <div className="text-sm text-gray-700">₺{p.price}</div>
                <div className="text-xs text-gray-500">
                  Stok: {p.stock === null || p.stock === undefined ? "Sınırsız" : p.stock}
                </div>
                {p.popular && <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg> Popüler</span>}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  className="inline-flex items-center gap-1 rounded border border-gray-300 px-2 py-1 text-sm"
                  onClick={() => {
                    const newOrder = prompt(`Sıralama numarası (${p.order || 0}):`, String(p.order || 0));
                    if (newOrder !== null) {
                      const order = Number(newOrder);
                      if (!isNaN(order)) {
                        update({ ...p, order });
                      }
                    }
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></svg>
                  Sıra
                </button>
                <Link href={`/admin/urunler/${p.id}`} className="inline-flex items-center gap-1 rounded border border-gray-300 px-2 py-1 text-sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                  Düzenle
                </Link>
                <button className="inline-flex items-center gap-1 rounded border border-red-200 px-2 py-1 text-sm text-red-700" onClick={() => remove(p.id)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          <button className="rounded border px-3 py-1 disabled:opacity-50" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Önceki</button>
          <span>Sayfa {page} / {totalPages}</span>
          <button className="rounded border px-3 py-1 disabled:opacity-50" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Sonraki</button>
        </div>
      </div>
    </div>
  );
}


