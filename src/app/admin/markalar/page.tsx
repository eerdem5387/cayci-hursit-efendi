"use client";
import { useEffect, useState } from "react";

type Brand = { id: string; name: string; slug: string };

export default function BrandsAdmin() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [form, setForm] = useState<Partial<Brand>>({ name: "", slug: "" });
  const [query, setQuery] = useState("");

  const load = () => fetch("/api/admin/brands").then((r) => r.json()).then(setBrands);
  useEffect(() => { load(); }, []);

  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

  const create = async () => {
    const name = String(form.name || "").trim();
    const slug = slugify(String(form.slug || form.name || ""));
    if (!name || !slug) { alert("Ad ve slug zorunludur"); return; }
    const res = await fetch("/api/admin/brands", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, slug }) });
    if (!res.ok) {
      const data = await res.json().catch(() => ({} as any));
      alert(data?.error || "Marka eklenemedi");
      return;
    }
    setForm({ name: "", slug: "" });
    load();
  };
  const update = async (b: Brand) => {
    const name = String(b.name || "").trim();
    const slug = slugify(String(b.slug || ""));
    if (!name || !slug) { alert("Ad ve slug zorunludur"); return; }
    const res = await fetch("/api/admin/brands", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...b, name, slug }) });
    if (!res.ok) {
      const data = await res.json().catch(() => ({} as any));
      alert(data?.error || "Güncellenemedi");
    }
    load();
  };
  const remove = async (id: string) => {
    const res = await fetch(`/api/admin/brands?id=${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({} as any));
      alert(data?.error || "Silinemedi");
      return;
    }
    load();
  };

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Markalar</h1>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <input className="w-full rounded border border-gray-300 px-3 py-2" placeholder="Ara (ad veya slug)" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-2 font-semibold">Yeni Marka</h2>
        <div className="flex gap-2">
          <input className="flex-1 rounded border border-gray-300 px-3 py-2" placeholder="Ad" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="flex-1 rounded border border-gray-300 px-3 py-2" placeholder="Slug" value={form.slug || ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <button className="rounded bg-emerald-700 px-4 py-2 text-white" onClick={create}>Ekle</button>
        </div>
        <form className="mt-3 flex items-center gap-2" onSubmit={async (e) => {
          e.preventDefault();
          const formEl = e.currentTarget as HTMLFormElement;
          const f = new FormData(formEl);
          await fetch("/api/admin/upload", { method: "POST", body: f });
          formEl.reset();
        }}>
          <input type="hidden" name="kind" value="brand" />
          <input type="hidden" name="slug" value={form.slug || ""} />
          <input name="file" type="file" accept="image/*" className="text-sm" required />
          <button className="rounded border border-gray-300 px-3 py-1 text-sm">Logo Yükle</button>
          <span className="text-xs text-gray-500">/brands/{form.slug || "slug"}.(jpg|png)</span>
        </form>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-2 font-semibold">Liste</h2>
        <div className="grid gap-2">
          {brands.filter((b) => !query.trim() || b.name.toLowerCase().includes(query.trim().toLowerCase()) || b.slug.toLowerCase().includes(query.trim().toLowerCase())).map((b) => (
            <div key={b.id} className="flex items-center gap-2">
              <input className="w-48 rounded border border-gray-300 px-2 py-1" value={b.name} onChange={(e) => update({ ...b, name: e.target.value })} />
              <input className="w-48 rounded border border-gray-300 px-2 py-1" value={b.slug} onChange={(e) => update({ ...b, slug: e.target.value })} />
              <button className="rounded border border-red-300 px-3 py-1 text-red-700" onClick={() => remove(b.id)}>Sil</button>
              <form className="ml-auto flex items-center gap-2" onSubmit={async (e) => {
                e.preventDefault();
                const formEl = e.currentTarget as HTMLFormElement;
                const f = new FormData(formEl);
                await fetch("/api/admin/upload", { method: "POST", body: f });
                formEl.reset();
              }}>
                <input type="hidden" name="kind" value="brand" />
                <input type="hidden" name="slug" value={b.slug} />
                <input name="file" type="file" accept="image/*" className="text-sm" required />
                <button className="rounded border border-gray-300 px-3 py-1 text-sm">Logo Güncelle</button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


