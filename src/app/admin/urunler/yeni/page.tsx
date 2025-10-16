"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Brand = { id: string; name: string; slug: string };

export default function ProductCreatePage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [form, setForm] = useState({ name: "", slug: "", brandId: "", price: "", weightKg: "", stock: "", description: "", popular: false });
  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

  useEffect(() => {
    fetch("/api/admin/brands").then((r) => r.json()).then(setBrands);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const name = String(form.name || "").trim();
    const slug = slugify(String(form.name || ""));
    const payload = {
      name,
      slug,
      brandId: form.brandId || undefined,
      price: Number(form.price || 0),
      weightKg: form.weightKg ? Number(form.weightKg) : null,
      stock: form.stock ? Number(form.stock) : null,
      description: form.description,
      popular: form.popular,
    };
    const res = await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) {
      const data = await res.json().catch(() => ({} as any));
      alert(data?.error || "Ürün eklenemedi");
      return;
    }
    window.location.href = "/admin/urunler";
  };

  const upload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget as HTMLFormElement;
    const f = new FormData(formEl);
    const res = await fetch("/api/admin/upload", { method: "POST", body: f });
    if (!res.ok) {
      const data = await res.json().catch(() => ({} as any));
      alert(data?.error || "Görsel yüklenemedi");
      return;
    }
    const data = await res.json().catch(() => ({} as any));
    if (data?.path) alert(`Yüklendi: ${data.path}`);
    formEl.reset();
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Ürün Ekle</h1>
        <Link href="/admin/urunler" className="text-sm text-emerald-700">Geri dön</Link>
      </div>

      <form onSubmit={submit} className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <label className="grid gap-1 text-sm">
          <span className="font-medium">Ürün Adı</span>
          <input className="rounded border border-gray-300 px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">Slug (Otomatik)</span>
          <input className="rounded border border-gray-300 px-3 py-2 bg-gray-50" value={slugify(form.name)} readOnly />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">Marka</span>
          <select className="rounded border border-gray-300 px-3 py-2" value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })}>
            <option value="">Seçiniz</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </label>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Fiyat (₺)</span>
            <input type="number" step="0.01" className="rounded border border-gray-300 px-3 py-2" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Ağırlık (kg)</span>
            <input type="number" step="0.01" className="rounded border border-gray-300 px-3 py-2" value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: e.target.value })} />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Stok (Boş bırakılırsa sınırsız)</span>
            <input type="number" className="rounded border border-gray-300 px-3 py-2" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Sınırsız için boş bırakın" />
          </label>
        </div>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">Açıklama</span>
          <textarea rows={5} className="rounded border border-gray-300 px-3 py-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.popular} onChange={(e) => setForm({ ...form, popular: e.target.checked })} />
          Popüler ürün
        </label>
        <button className="mt-2 w-fit rounded bg-emerald-700 px-4 py-2 text-white">Kaydet</button>
      </form>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-2 font-semibold">Görsel Yükle</h2>
        <form onSubmit={upload} className="space-y-3">
          <input type="hidden" name="kind" value="product" />
          <input type="hidden" name="slug" value={slugify(form.name)} />
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
          <div className="text-xs text-gray-500">
            Dosya yolu: <code>/images/{slugify(form.name) || "slug"}.(jpg|png)</code>
          </div>
        </form>
      </div>
    </div>
  );
}


