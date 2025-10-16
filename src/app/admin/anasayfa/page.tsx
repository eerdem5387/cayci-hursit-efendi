"use client";
import { useEffect, useState } from "react";

type Pillar = { title: string; subtitle: string; text: string };
type HomeContent = { popularIds: string[]; pillars: Pillar[]; video: { src: string; overlayTitle: string; overlaySubtitle: string; overlayText: string } };
type Product = { id: string; name: string };

export default function HomeAdmin() {
  const [home, setHome] = useState<HomeContent | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const load = () => Promise.all([
    fetch("/api/admin/home").then((r) => r.json()).then(setHome),
    fetch("/api/admin/products").then((r) => r.json()).then(setProducts),
  ]);
  useEffect(() => { load(); }, []);

  const save = async () => {
    await fetch("/api/admin/home", { method: "PUT", body: JSON.stringify(home) });
  };

  if (!home) return <div>Yükleniyor...</div>;

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Anasayfa İçerikleri</h1>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-2 font-semibold">Popüler Ürünler</h2>
        <div className="grid gap-2 md:grid-cols-3">
          {products.map((p) => {
            const active = home.popularIds.includes(p.id);
            return (
              <label key={p.id} className={`flex items-center gap-2 rounded border px-3 py-2 ${active ? "border-emerald-600" : "border-gray-300"}`}>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => {
                    setHome({
                      ...home,
                      popularIds: e.target.checked ? [...home.popularIds, p.id] : home.popularIds.filter((id) => id !== p.id),
                    });
                  }}
                />
                {p.name}
              </label>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-2 font-semibold">3 Sütun (Vizyon/Misyon)</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {home.pillars.map((pl, idx) => (
            <div key={idx} className="grid gap-2">
              <input className="rounded border border-gray-300 px-3 py-2" value={pl.title} onChange={(e) => {
                const next = [...home.pillars]; next[idx] = { ...next[idx], title: e.target.value }; setHome({ ...home, pillars: next });
              }} placeholder="Başlık" />
              <input className="rounded border border-gray-300 px-3 py-2" value={pl.subtitle} onChange={(e) => {
                const next = [...home.pillars]; next[idx] = { ...next[idx], subtitle: e.target.value }; setHome({ ...home, pillars: next });
              }} placeholder="Alt başlık" />
              <textarea className="rounded border border-gray-300 px-3 py-2" value={pl.text} rows={5} onChange={(e) => {
                const next = [...home.pillars]; next[idx] = { ...next[idx], text: e.target.value }; setHome({ ...home, pillars: next });
              }} placeholder="Metin" />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-2 font-semibold">Video Banner</h2>
        <div className="grid gap-3">
          <input className="rounded border border-gray-300 px-3 py-2" value={home.video.src} onChange={(e) => setHome({ ...home, video: { ...home.video, src: e.target.value } })} placeholder="Video URL" />
          <input className="rounded border border-gray-300 px-3 py-2" value={home.video.overlayTitle} onChange={(e) => setHome({ ...home, video: { ...home.video, overlayTitle: e.target.value } })} placeholder="Başlık" />
          <input className="rounded border border-gray-300 px-3 py-2" value={home.video.overlaySubtitle} onChange={(e) => setHome({ ...home, video: { ...home.video, overlaySubtitle: e.target.value } })} placeholder="Alt başlık" />
          <textarea className="rounded border border-gray-300 px-3 py-2" rows={4} value={home.video.overlayText} onChange={(e) => setHome({ ...home, video: { ...home.video, overlayText: e.target.value } })} placeholder="Açıklama" />
        </div>
      </section>

      <div>
        <button className="rounded bg-emerald-700 px-4 py-2 text-white" onClick={save}>Kaydet</button>
      </div>
    </div>
  );
}


