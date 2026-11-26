"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ADMIN_STATUS_LABELS, displayOrderNo, formatTRY, statusClass } from "@/lib/orderStatus";

type Order = {
  id: string;
  createdAt: string;
  customer: { ad: string; email: string; adres: string; sehir: string; telefon: string };
  items: { slug: string; qty: number; name: string; price: number | null }[];
  status: string;
  total: number;
  isGuest?: boolean;
  paymentError?: string | null;
  paidAt?: string | null;
};

const FILTERS: { value: string; label: string }[] = [
  { value: "_active", label: "Gerçek siparişler (ödemesi alınmış)" },
  { value: "paid", label: "Ödendi – hazırlanacak" },
  { value: "odeme_incelemede", label: "Ödeme incelemede" },
  { value: "onaylandi", label: "Onaylandı / Hazırlanıyor" },
  { value: "kargoda", label: "Kargoda" },
  { value: "teslim_edildi", label: "Teslim edildi" },
  { value: "basarisiz", label: "İptal / Başarısız" },
  { value: "_attempts", label: "Tamamlanmamış ödeme denemeleri" },
  { value: "", label: "Tümü" },
];

// Panelden seçilebilecek durumlar (ödeme durumları banka dönüşüyle otomatik belirlenir)
const SELECTABLE = ["paid", "onaylandi", "kargoda", "teslim_edildi", "basarisiz"];

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("_active");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 20;

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    setLoading(true);
    fetch(`/api/orders?${params.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => { setOrders(res.items || []); setTotal(res.total || 0); })
      .finally(() => setLoading(false));
  }, [query, statusFilter, page]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const setStatus = async (id: string, status: string) => {
    const body: any = { id, status };
    if (status === "basarisiz") {
      const reason = window.prompt("İptal / başarısız nedeni (müşteriye e-postayla iletilir):");
      if (!reason || !reason.trim()) return;
      body.reason = reason.trim();
    }
    const res = await fetch("/api/orders", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) {
      const d = await res.json().catch(() => ({} as any));
      alert(d?.error || "Durum güncellenemedi");
    }
    load();
  };

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Siparişler</h1>
        <div className="text-sm text-gray-600">{total} sipariş</div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <input
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            placeholder="Ara (ad, e-posta, telefon, sipariş no)"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          />
          <select
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            {FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
        {statusFilter === "_attempts" && (
          <p className="mt-3 text-sm text-gray-600">
            Bunlar ödemesi tamamlanmamış denemelerdir; kargolanmamalıdır. Müşteri çoğu zaman kısa süre sonra tekrar deneyip ödemeyi tamamlar.
          </p>
        )}
      </div>

      {loading && orders.length === 0 ? (
        <div className="py-10 text-center text-gray-500">Yükleniyor…</div>
      ) : orders.length === 0 ? (
        <div className="py-10 text-center text-gray-500">Bu filtrede sipariş yok.</div>
      ) : (
        <div className="grid gap-4">
          {orders.map((o) => {
            const isAttempt = o.status === "pending" || o.status === "odeme_basarisiz";
            return (
              <div key={o.id} className={`rounded-xl border bg-white shadow-sm ${o.status === "odeme_incelemede" ? "border-violet-300" : "border-gray-200"} ${isAttempt ? "opacity-80" : ""}`}>
                <div className="p-5">
                  <div className="mb-4 flex flex-col justify-between gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-mono font-semibold text-gray-900">#{displayOrderNo(o.id)}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">{new Date(o.createdAt).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      {o.isGuest && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">Misafir</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(o.status)}`}>
                        {ADMIN_STATUS_LABELS[o.status] || o.status}
                      </span>
                      {!isAttempt && (
                        <select
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
                          value={SELECTABLE.includes(o.status) ? o.status : ""}
                          onChange={(e) => e.target.value && setStatus(o.id, e.target.value)}
                        >
                          {!SELECTABLE.includes(o.status) && <option value="">Durum değiştir…</option>}
                          {SELECTABLE.map((s) => <option key={s} value={s}>{ADMIN_STATUS_LABELS[s]}</option>)}
                        </select>
                      )}
                    </div>
                  </div>

                  {o.paymentError && (
                    <div className={`mb-4 rounded-lg border px-3 py-2 text-sm ${o.status === "odeme_incelemede" ? "border-violet-200 bg-violet-50 text-violet-900" : "border-gray-200 bg-gray-50 text-gray-700"}`}>
                      <span className="font-medium">Ödeme notu:</span> {o.paymentError}
                    </div>
                  )}

                  <div className="mb-4 grid gap-1 text-sm">
                    <div className="font-medium text-gray-900">{o.customer.ad}</div>
                    <div className="text-gray-600">{o.customer.email} · {o.customer.telefon}</div>
                    <div className="text-gray-600">{o.customer.adres}, {o.customer.sehir}</div>
                  </div>

                  <div className="mb-4 space-y-2">
                    {o.items.map((item) => (
                      <div key={item.slug} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm">
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-500">Adet: {item.qty}</div>
                        </div>
                        {item.price != null && <div className="font-semibold text-gray-900">{formatTRY(item.price * item.qty)}</div>}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col items-start justify-between gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center">
                    <div>
                      <div className="text-sm text-gray-600">Sipariş Tutarı</div>
                      <div className="text-2xl font-bold text-emerald-700">{formatTRY(o.total)}</div>
                    </div>
                    <Link href={`/admin/siparisler/${o.id}`} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800">
                      Detayları Gör
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-sm">
        <button className="rounded border px-3 py-1 disabled:opacity-50" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Önceki</button>
        <span>Sayfa {page} / {pages}</span>
        <button className="rounded border px-3 py-1 disabled:opacity-50" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages}>Sonraki</button>
      </div>
    </div>
  );
}
