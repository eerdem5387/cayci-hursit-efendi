"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Order = {
  id: string;
  createdAt: string;
  customer: { ad: string; email: string; adres: string; sehir: string; telefon: string };
  items: { slug: string; qty: number }[];
  // status alanı geçmişte paid/failed iken yeni akışta onaylandi/kargoda/teslim_edildi/basarisiz olabilir
  status: string;
  isGuest?: boolean;
};

type Product = { id: string; name: string; slug: string; price: number; weightKg?: number | null };

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | Order["status"]>("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const load = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    fetch(`/api/orders?${params.toString()}`).then((r) => r.json()).then((res) => setOrders(res.items));
    fetch("/api/products").then((r) => r.json()).then(setProducts);
  };
  useEffect(() => { load(); }, [query, statusFilter, page]);

  const setStatus = async (id: string, status: Order["status"]) => {
    let body: any = { id, status };
    if (status === "basarisiz") {
      const reason = window.prompt("Başarısız nedeni (zorunlu):");
      if (!reason || !reason.trim()) return;
      body.reason = reason.trim();
    }
    await fetch("/api/orders", { method: "PUT", body: JSON.stringify(body) });
    load();
  };

  const getProduct = (slug: string) => products.find(p => p.slug === slug);

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Siparişler</h1>
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <input className="rounded border border-gray-300 px-3 py-2" placeholder="Ara (ad, email, telefon, ID)" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
          <select className="rounded border border-gray-300 px-3 py-2" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}>
            <option value="">Tüm Durumlar</option>
            <option value="pending">Beklemede</option>
            <option value="onaylandi">Onaylandı</option>
            <option value="kargoda">Kargoda</option>
            <option value="teslim_edildi">Teslim Edildi</option>
            <option value="basarisiz">Başarısız</option>
            <option value="paid">(Eski) Ödendi</option>
            <option value="failed">(Eski) Başarısız</option>
          </select>
          <div className="self-center text-sm text-gray-600">Toplam: {orders.filter((o) => {
            const q = query.trim().toLowerCase();
            const matchesQuery = !q || o.id.toLowerCase().includes(q) || o.customer.ad.toLowerCase().includes(q) || o.customer.email.toLowerCase().includes(q) || o.customer.telefon.toLowerCase().includes(q);
            const matchesStatus = !statusFilter || o.status === statusFilter;
            return matchesQuery && matchesStatus;
          }).length}</div>
        </div>
      </div>
      <div className="grid gap-3">
        {orders.map((o) => (
          <div key={o.id} className="rounded border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">#{o.id} – {new Date(o.createdAt).toLocaleString("tr-TR")} – <Link className="text-emerald-700" href={`/admin/siparisler/${o.id}`}>Detay</Link></div>
              <select className="rounded border border-gray-300 px-2 py-1 text-sm" value={o.status} onChange={(e) => setStatus(o.id, e.target.value as Order["status"]) }>
                <option value="pending">Beklemede</option>
                <option value="onaylandi">Onaylandı</option>
                <option value="kargoda">Kargoda</option>
                <option value="teslim_edildi">Teslim Edildi</option>
                <option value="basarisiz">Başarısız</option>
                <option value="paid">(Eski) Ödendi</option>
                <option value="failed">(Eski) Başarısız</option>
              </select>
            </div>
            <div className="mt-2 text-sm">
              <div>
                Müşteri: {o.customer.ad} – {o.customer.email} – {o.customer.telefon}
                {o.isGuest && <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">Guest</span>}
              </div>
              <div>Adres: {o.customer.adres}, {o.customer.sehir}</div>
            </div>
            <div className="mt-3 space-y-2">
              {o.items.map((item) => {
                const product = getProduct(item.slug);
                return (
                  <div key={item.slug} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{product?.name || item.slug}</div>
                      {product?.weightKg && (
                        <div className="text-sm text-gray-600">{product.weightKg} kg</div>
                      )}
                    </div>
                    <div className="text-sm text-gray-700">
                      {product?.price && (
                        <div className="font-medium">{product.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</div>
                      )}
                      <div className="text-gray-600">Adet: {item.qty}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 text-sm">
        <button className="rounded border px-3 py-1 disabled:opacity-50" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Önceki</button>
        <span>Sayfa {page}</span>
        <button className="rounded border px-3 py-1 disabled:opacity-50" onClick={() => setPage((p) => p + 1)}>Sonraki</button>
      </div>
    </div>
  );
}


