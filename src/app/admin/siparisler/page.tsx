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
  total?: number;
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

  const calculateOrderTotal = (order: Order) => {
    // Eğer API'den total geliyorsa onu kullan
    if (order.total !== undefined && order.total !== null) {
      return order.total;
    }
    // Yoksa ürün fiyatlarından hesapla
    return order.items.reduce((sum, item) => {
      const product = getProduct(item.slug);
      if (product?.price) {
        return sum + (product.price * item.qty);
      }
      return sum;
    }, 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
      case "onaylandi":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "kargoda":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "teslim_edildi":
        return "bg-green-100 text-green-800 border-green-200";
      case "basarisiz":
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
      default:
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Beklemede",
      onaylandi: "Onaylandı",
      kargoda: "Kargoda",
      teslim_edildi: "Teslim Edildi",
      basarisiz: "Başarısız",
      paid: "Ödendi",
      failed: "Başarısız",
    };
    return labels[status] || status;
  };

  const filteredOrders = orders.filter((o) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || o.id.toLowerCase().includes(q) || o.customer.ad.toLowerCase().includes(q) || o.customer.email.toLowerCase().includes(q) || o.customer.telefon.toLowerCase().includes(q);
    const matchesStatus = !statusFilter || o.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Siparişler</h1>
        <div className="text-sm text-gray-600">
          Toplam {filteredOrders.length} sipariş
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3">
          <input 
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-colors" 
            placeholder="🔍 Ara (ad, email, telefon, ID)" 
            value={query} 
            onChange={(e) => { setQuery(e.target.value); setPage(1); }} 
          />
          <select 
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-colors" 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
          >
            <option value="">📋 Tüm Durumlar</option>
            <option value="pending">⏳ Beklemede</option>
            <option value="onaylandi">✅ Onaylandı</option>
            <option value="kargoda">🚚 Kargoda</option>
            <option value="teslim_edildi">📦 Teslim Edildi</option>
            <option value="basarisiz">❌ Başarısız</option>
            <option value="paid">💳 (Eski) Ödendi</option>
            <option value="failed">⚠️ (Eski) Başarısız</option>
          </select>
          <div className="self-center text-sm font-medium text-gray-700">
            Gösterilen: {filteredOrders.length} sipariş
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {orders.map((o) => {
          const orderTotal = calculateOrderTotal(o);
          return (
            <div key={o.id} className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="p-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-gray-500">#{o.id.slice(0, 8)}...</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-600">{new Date(o.createdAt).toLocaleString("tr-TR", { 
                        day: "2-digit", 
                        month: "2-digit", 
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}</span>
                      {o.isGuest && (
                        <>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">Misafir</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(o.status)}`}>
                      {getStatusLabel(o.status)}
                    </span>
                    <select 
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-colors" 
                      value={o.status} 
                      onChange={(e) => setStatus(o.id, e.target.value as Order["status"])}
                    >
                      <option value="pending">Beklemede</option>
                      <option value="onaylandi">Onaylandı</option>
                      <option value="kargoda">Kargoda</option>
                      <option value="teslim_edildi">Teslim Edildi</option>
                      <option value="basarisiz">Başarısız</option>
                      <option value="paid">(Eski) Ödendi</option>
                      <option value="failed">(Eski) Başarısız</option>
                    </select>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="mb-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div>
                      <div className="font-medium text-gray-900">{o.customer.ad}</div>
                      <div className="text-sm text-gray-600">{o.customer.email}</div>
                      <div className="text-sm text-gray-600">{o.customer.telefon}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div className="text-sm text-gray-600">
                      {o.customer.adres}, {o.customer.sehir}
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div className="mb-4 space-y-2">
                  {o.items.map((item) => {
                    const product = getProduct(item.slug);
                    const itemTotal = product?.price ? product.price * item.qty : 0;
                    return (
                      <div key={item.slug} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{product?.name || item.slug}</div>
                          <div className="flex items-center gap-3 mt-1">
                            {product?.weightKg && (
                              <span className="text-xs text-gray-500">⚖️ {product.weightKg} kg</span>
                            )}
                            <span className="text-xs text-gray-500">📦 Adet: {item.qty}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          {product?.price && (
                            <div className="font-semibold text-gray-900">
                              {product.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                            </div>
                          )}
                          {itemTotal > 0 && (
                            <div className="text-xs text-gray-500">
                              Toplam: {itemTotal.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer with Total and Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-gray-200">
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-1">Sipariş Tutarı</div>
                    <div className="text-2xl font-bold text-emerald-700">
                      {orderTotal.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                    </div>
                  </div>
                  <Link 
                    href={`/admin/siparisler/${o.id}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Detayları Gör
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-2 text-sm">
        <button className="rounded border px-3 py-1 disabled:opacity-50" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Önceki</button>
        <span>Sayfa {page}</span>
        <button className="rounded border px-3 py-1 disabled:opacity-50" onClick={() => setPage((p) => p + 1)}>Sonraki</button>
      </div>
    </div>
  );
}


