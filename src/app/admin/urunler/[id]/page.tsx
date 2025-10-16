"use client";
import { useEffect, useMemo, useState, use } from "react";
import Link from "next/link";

type Brand = { id: string; name: string; slug: string };
type Product = { id: string; name: string; slug: string; brandId?: string; price: number; popular?: boolean; description?: string; weightKg?: number | null; stock?: number | null; images?: string[] };

export default function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/brands").then(r => r.json()).then(setBrands),
      fetch("/api/admin/products").then(r => r.json()).then((list: Product[]) => setProduct(list.find(p => p.id === id) || null)),
    ]);
  }, [id]);

  const save = async () => {
    if (!product) return;
    setSaving(true);
    const name = String(product.name || "").trim();
    const slug = slugify(String(product.slug || ""));
    const price = Number(product.price);
    const res = await fetch("/api/admin/products", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...product, name, slug, price }) });
    setSaving(false);
    if (!res.ok) {
      alert("Kaydedilemedi");
      return;
    }
    alert("Kaydedildi");
  };

  const removeImage = async (idx: number) => {
    if (!product) return;
    const images = (product.images || []).filter((_, i) => i !== idx);
    setProduct({ ...product, images });
    await save();
  };

  if (!product) return <div className="px-4">Yükleniyor...</div>;

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Ürün Düzenle</h1>
        <Link href="/admin/urunler" className="text-sm text-emerald-700">Geri dön</Link>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Ad</span>
            <input className="rounded border border-gray-300 px-3 py-2" value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Slug (Otomatik)</span>
            <input className="rounded border border-gray-300 px-3 py-2 bg-gray-50" value={slugify(product.name)} readOnly />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Marka</span>
            <select className="rounded border border-gray-300 px-3 py-2" value={product.brandId || ""} onChange={(e) => setProduct({ ...product, brandId: e.target.value || undefined })}>
              <option value="">Yok</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Fiyat (₺)</span>
            <input type="number" step="0.01" className="rounded border border-gray-300 px-3 py-2" value={String(product.price)} onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })} />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Ağırlık (kg)</span>
            <input type="number" step="0.01" className="rounded border border-gray-300 px-3 py-2" value={String(product.weightKg || "")} onChange={(e) => setProduct({ ...product, weightKg: Number(e.target.value) })} />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Stok (Boş bırakılırsa sınırsız)</span>
            <input type="number" className="rounded border border-gray-300 px-3 py-2" value={String(product.stock || "")} onChange={(e) => setProduct({ ...product, stock: e.target.value ? Number(e.target.value) : null })} placeholder="Sınırsız için boş bırakın" />
          </label>
          <label className="col-span-full flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!product.popular} onChange={(e) => setProduct({ ...product, popular: e.target.checked })} /> Popüler
          </label>
          <label className="col-span-full grid gap-1 text-sm">
            <span className="font-medium">Açıklama</span>
            <textarea rows={4} className="rounded border border-gray-300 px-3 py-2" value={product.description || ""} onChange={(e) => setProduct({ ...product, description: e.target.value })} />
          </label>
        </div>
        <div className="mt-3">
          <form className="space-y-3" onSubmit={async (e) => {
            e.preventDefault();
            const formEl = e.currentTarget as HTMLFormElement;
            const f = new FormData(formEl);
            const resp = await fetch("/api/admin/upload", { method: "POST", body: f });
            const data = await resp.json().catch(() => ({} as any));
            if (data?.path) {
              setProduct((prev) => prev ? { ...prev, images: Array.isArray(prev.images) ? [...prev.images, data.path] : [data.path] } : prev);
            }
            formEl.reset();
          }}>
            <input type="hidden" name="kind" value="product" />
            <input type="hidden" name="slug" value={product.slug} />
            <div className="relative">
              <input 
                name="file" 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 w-full cursor-pointer opacity-0" 
                required 
              />
              <div className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm text-gray-600 transition-colors hover:border-emerald-400 hover:bg-emerald-50">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Görsel seçmek için tıklayın</span>
              </div>
            </div>
            <button type="submit" className="w-full rounded bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800">
              Görseli Yükle
            </button>
          </form>
          {Array.isArray(product.images) && product.images.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {product.images.map((img, idx) => (
                <div key={img} className="rounded border border-gray-200 p-2 text-xs">
                  <div className="truncate">{img}</div>
                  <div className="mt-1 flex gap-2">
                    <button className="rounded border px-2 py-0.5" onClick={() => removeImage(idx)}>Sil</button>
                    {idx !== 0 && <button className="rounded border px-2 py-0.5" onClick={() => {
                      if (!product) return;
                      const next = [...(product.images || [])];
                      const [it] = next.splice(idx, 1);
                      next.unshift(it);
                      setProduct({ ...product, images: next });
                    }}>Kapak Yap</button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-4">
          <button disabled={saving} onClick={save} className="rounded bg-emerald-700 px-4 py-2 text-white disabled:opacity-60">{saving ? "Kaydediliyor..." : "Kaydet"}</button>
        </div>
      </div>
    </div>
  );
}


