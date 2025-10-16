"use client";
import { useEffect, useState } from "react";

type Brand = { id: string; name: string; slug: string };

export default function BrandsAdmin() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [form, setForm] = useState<Partial<Brand>>({ name: "", slug: "" });
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<{[k:string]: boolean}>({});
  const [message, setMessage] = useState<string>("");
  const [newFileName, setNewFileName] = useState<string>("");
  const [fileNames, setFileNames] = useState<Record<string,string>>({});

  const load = () => fetch("/api/admin/brands").then((r) => r.json()).then(setBrands);
  useEffect(() => { load(); }, []);

  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

  const create = async () => {
    setBusy((b) => ({ ...b, create: true }));
    const name = String(form.name || "").trim();
    const slug = slugify(String(form.slug || form.name || ""));
    if (!name || !slug) { alert("Ad ve slug zorunludur"); return; }
    const res = await fetch("/api/admin/brands", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, slug }) });
    setBusy((b) => ({ ...b, create: false }));
    if (!res.ok) {
      const data = await res.json().catch(() => ({} as any));
      alert(data?.error || "Marka eklenemedi");
      return;
    }
    setForm({ name: "", slug: "" });
    load();
    setMessage("Marka eklendi");
    setTimeout(() => setMessage(""), 2000);
  };
  const update = async (b: Brand) => {
    setBusy((s) => ({ ...s, ["u:"+b.id]: true }));
    const name = String(b.name || "").trim();
    const slug = slugify(String(b.slug || ""));
    if (!name || !slug) { alert("Ad ve slug zorunludur"); return; }
    const res = await fetch("/api/admin/brands", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...b, name, slug }) });
    setBusy((s) => ({ ...s, ["u:"+b.id]: false }));
    if (!res.ok) {
      const data = await res.json().catch(() => ({} as any));
      alert(data?.error || "Güncellenemedi");
    }
    load();
    setMessage("Güncellendi");
    setTimeout(() => setMessage(""), 2000);
  };
  const remove = async (id: string) => {
    setBusy((s) => ({ ...s, ["d:"+id]: true }));
    const res = await fetch(`/api/admin/brands?id=${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({} as any));
      alert(data?.error || "Silinemedi");
      setBusy((s) => ({ ...s, ["d:"+id]: false }));
      return;
    }
    load();
    setMessage("Silindi");
    setTimeout(() => setMessage(""), 2000);
  };

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Markalar</h1>
      {message && (<div className={`rounded border px-3 py-2 text-sm ${message.includes('eklendi') || message.includes('Güncellendi') ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-gray-50 text-gray-700'}`}>{message}</div>)}

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <input className="w-full rounded border border-gray-300 px-3 py-2" placeholder="Ara (ad veya slug)" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-2 font-semibold">Yeni Marka</h2>
        <div className="flex gap-2">
          <input className={`flex-1 rounded border ${busy.create ? 'border-emerald-400 ring-2 ring-emerald-200' : 'border-gray-300'} px-3 py-2 transition-all`} placeholder="Ad" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className={`flex-1 rounded border ${busy.create ? 'border-emerald-400 ring-2 ring-emerald-200' : 'border-gray-300'} px-3 py-2 transition-all`} placeholder="Slug" value={form.slug || ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <button className="rounded bg-emerald-700 px-4 py-2 text-white disabled:opacity-60 transition-transform active:scale-95" onClick={create} disabled={!!busy.create}>{busy.create ? 'Ekleniyor…' : 'Ekle'}</button>
        </div>
        <form className="mt-3 flex items-center gap-2" onSubmit={async (e) => {
          e.preventDefault();
          const formEl = e.currentTarget as HTMLFormElement;
          const f = new FormData(formEl);
          const res = await fetch("/api/admin/upload", { method: "POST", body: f });
          if (!res.ok) {
            const data = await res.json().catch(() => ({} as any));
            alert(data?.error || "Logo yüklenemedi");
            return;
          }
          formEl.reset();
          setNewFileName("");
          setMessage("Logo yüklendi");
          setTimeout(() => setMessage(""), 2000);
        }}>
          <input type="hidden" name="kind" value="brand" />
          <input type="hidden" name="slug" value={form.slug || ""} />
          <input name="file" id="brand-new-file" type="file" accept="image/*" className="hidden" required onChange={(e) => {
            const target = e.target as HTMLInputElement;
            setNewFileName(target?.files?.[0]?.name || "");
          }} />
          <label htmlFor="brand-new-file" className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 cursor-pointer">{newFileName || "Dosya Seç"}</label>
          <button className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 cursor-pointer">Logo Yükle</button>
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
          <button className="rounded border border-red-300 px-3 py-1 text-red-700 disabled:opacity-60 transition-transform active:scale-95" onClick={() => remove(b.id)} disabled={!!busy["d:"+b.id]}>{busy["d:"+b.id] ? 'Siliniyor…' : 'Sil'}</button>
              <form className="ml-auto flex items-center gap-2" onSubmit={async (e) => {
                e.preventDefault();
                const formEl = e.currentTarget as HTMLFormElement;
                const f = new FormData(formEl);
                const res = await fetch("/api/admin/upload", { method: "POST", body: f });
                if (!res.ok) {
                  const data = await res.json().catch(() => ({} as any));
                  alert(data?.error || "Logo güncellenemedi");
                  return;
                }
                formEl.reset();
                setFileNames((m) => ({ ...m, [b.id]: "" }));
                setMessage("Logo güncellendi");
                setTimeout(() => setMessage(""), 2000);
              }}>
                <input type="hidden" name="kind" value="brand" />
                <input type="hidden" name="slug" value={b.slug} />
                <input name="file" id={`brand-file-${b.id}`} type="file" accept="image/*" className="hidden" required onChange={(e) => {
                  const target = e.target as HTMLInputElement;
                  setFileNames((m) => ({ ...m, [b.id]: target?.files?.[0]?.name || "" }));
                }} />
                <label htmlFor={`brand-file-${b.id}`} className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 cursor-pointer">{fileNames[b.id] || "Dosya Seç"}</label>
                <button className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 cursor-pointer">Logo Güncelle</button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


