"use client";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import StatusDialog, { type StatusPayload } from "@/components/admin/StatusDialog";
import { useOrderUpdate } from "@/components/admin/useOrderUpdate";
import { ADMIN_STATUS_LABELS, ADMIN_TABS, NEXT_ACTION, displayOrderNo, formatTRY, statusClass, timeAgo } from "@/lib/orderStatus";

type Order = {
  id: string;
  createdAt: string;
  customer: { ad: string; email: string; adres: string; sehir: string; telefon: string };
  items: { slug: string; qty: number; name: string; price: number | null }[];
  status: string;
  total: number;
  isGuest?: boolean;
  paymentError?: string | null;
  cargoCompany?: string | null;
  cargoTrackingNo?: string | null;
  adminNote?: string | null;
};

const PAGE_SIZE = 25;

// Seçili siparişlere toplu uygulanabilecek işlemler (sekmeye göre)
const BULK: Record<string, { status: string; label: string }[]> = {
  yeni: [{ status: "onaylandi", label: "Hazırlanıyor yap" }, { status: "kargoda", label: "Kargoya verildi" }, { status: "teslim_edildi", label: "Teslim edildi" }],
  hazirlaniyor: [{ status: "kargoda", label: "Kargoya verildi" }, { status: "teslim_edildi", label: "Teslim edildi" }],
  kargoda: [{ status: "teslim_edildi", label: "Teslim edildi" }],
};

function OrdersAdminInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const tab = sp.get("sekme") || "yeni";
  const [query, setQuery] = useState(sp.get("q") || "");
  const [debounced, setDebounced] = useState(query);
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState<{ ids: string[]; status: string; cargo?: { company?: string | null; no?: string | null } } | null>(null);
  const reqId = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const load = useCallback((silent = false) => {
    const id = ++reqId.current;
    const params = new URLSearchParams({ tab: debounced ? "tumu" : tab, page: String(page), pageSize: String(PAGE_SIZE) });
    if (debounced) params.set("q", debounced);
    if (!silent) setLoading(true);
    fetch(`/api/orders?${params}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => {
        if (id !== reqId.current) return;
        setOrders(res.items || []);
        setTotal(res.total || 0);
        setCounts(res.counts || {});
        setUpdatedAt(new Date());
      })
      .finally(() => { if (id === reqId.current) setLoading(false); });
  }, [tab, page, debounced]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setSelected(new Set()); }, [tab, page, debounced]);

  // Sekme açıkken her dakika sessizce yenile (seçim veya pencere açıkken bekle)
  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === "visible" && !dialog && selected.size === 0) load(true);
    }, 60_000);
    return () => clearInterval(t);
  }, [load, dialog, selected.size]);

  const { busy, toast, update } = useOrderUpdate(useCallback(() => load(true), [load]));

  const setTab = (key: string) => {
    setPage(1);
    setQuery("");
    setDebounced("");
    router.replace(`/admin/siparisler?sekme=${key}`, { scroll: false });
  };

  const tabDef = ADMIN_TABS.find((t) => t.key === tab) || ADMIN_TABS[0];
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const allSelected = orders.length > 0 && orders.every((o) => selected.has(o.id));
  const bulkActions = !debounced ? BULK[tab] || [] : [];

  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(orders.map((o) => o.id)));

  const confirm = async (p: StatusPayload) => {
    if (!dialog) return;
    const ok = await update(dialog.ids, p, dialog.ids.length > 1 ? undefined : `#${displayOrderNo(dialog.ids[0])} → ${ADMIN_STATUS_LABELS[p.status]}`);
    if (ok) { setDialog(null); setSelected(new Set()); }
  };

  const summary = useMemo(() => (o: Order) => {
    const first = o.items[0];
    if (!first) return "—";
    const rest = o.items.length - 1;
    return `${first.qty}× ${first.name}${rest > 0 ? ` +${rest} ürün` : ""}`;
  }, []);

  return (
    <div className="grid gap-4 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Siparişler</h1>
          <p className="text-xs text-gray-500">
            {updatedAt ? `Güncellendi: ${updatedAt.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })} · her dakika otomatik yenilenir` : "Yükleniyor…"}
          </p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" /></svg>
            <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Ad, telefon, e-posta, sipariş no…"
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-8 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100" />
            {query && <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 px-1 text-gray-400 hover:text-gray-700" aria-label="Aramayı temizle">✕</button>}
          </div>
          <button onClick={() => load()} className="rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 hover:bg-gray-50" title="Yenile" aria-label="Yenile">
            <svg className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
        </div>
      </div>

      {/* İş akışı sekmeleri */}
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <nav className="flex min-w-max gap-1 rounded-xl border border-gray-200 bg-white p-1" aria-label="Sipariş durumları">
          {ADMIN_TABS.map((t) => {
            const active = !debounced && t.key === tab;
            const n = counts[t.key] ?? 0;
            const attention = t.alert && n > 0;
            return (
              <button key={t.key} onClick={() => setTab(t.key)} aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${active ? "bg-emerald-700 text-white" : attention ? "text-violet-800 hover:bg-violet-50" : "text-gray-700 hover:bg-gray-100"}`}>
                {t.label}
                {(n > 0 || active) && (
                  <span className={`min-w-6 rounded-full px-1.5 py-0.5 text-center text-xs font-semibold ${active ? "bg-white/20 text-white" : attention ? "bg-violet-600 text-white" : t.key === "yeni" && n > 0 ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600"}`}>{n}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {debounced ? (
        <p className="text-sm text-gray-600">Tüm siparişlerde “{debounced}” için {total} sonuç.</p>
      ) : tabDef.hint ? (
        <p className={`text-sm ${tabDef.alert || tab === "odenmemis" ? "rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900" : "text-gray-600"}`}>{tabDef.hint}</p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {/* Başlık satırı (masaüstü) */}
        <div className="hidden grid-cols-[28px_100px_1.2fr_1.5fr_100px_140px_150px] items-center gap-3 border-b border-gray-200 bg-gray-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 xl:grid">
          <input type="checkbox" checked={allSelected} onChange={toggleAll} disabled={!bulkActions.length || !orders.length} className="h-4 w-4 accent-emerald-700" aria-label="Tümünü seç" />
          <span>Sipariş</span><span>Müşteri</span><span>Ürünler</span><span className="text-right">Tutar</span><span>Durum</span><span />
        </div>

        {loading && orders.length === 0 ? (
          <div className="divide-y divide-gray-100">{[0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse bg-gray-50/60" />)}</div>
        ) : orders.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="text-base font-medium text-gray-900">{debounced ? "Sonuç bulunamadı" : tab === "yeni" ? "Bekleyen yeni sipariş yok 🎉" : "Bu bölümde sipariş yok"}</div>
            <p className="mt-1 text-sm text-gray-500">{debounced ? "Farklı bir arama deneyin." : "Yeni siparişler geldiğinde burada görünecek."}</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {orders.map((o) => {
              const next = NEXT_ACTION[o.status];
              const checked = selected.has(o.id);
              return (
                <li key={o.id} className={`grid grid-cols-[24px_1fr] gap-x-3 gap-y-2 px-4 py-3.5 transition-colors xl:grid-cols-[28px_100px_1.2fr_1.5fr_100px_140px_150px] xl:items-center ${checked ? "bg-emerald-50/60" : "hover:bg-gray-50"}`}>
                  <div className="row-span-5 pt-0.5 xl:row-span-1 xl:pt-0">
                    {bulkActions.length > 0 && <input type="checkbox" checked={checked} onChange={() => toggle(o.id)} className="h-4 w-4 accent-emerald-700" aria-label={`#${displayOrderNo(o.id)} seç`} />}
                  </div>

                  <Link href={`/admin/siparisler/${o.id}`} className="flex items-baseline justify-between gap-2 xl:block">
                    <span className="font-mono text-sm font-semibold text-gray-900 hover:text-emerald-700">#{displayOrderNo(o.id)}</span>
                    <span className="block text-xs text-gray-500" title={new Date(o.createdAt).toLocaleString("tr-TR")}>{timeAgo(o.createdAt)}</span>
                  </Link>

                  <Link href={`/admin/siparisler/${o.id}`} className="min-w-0">
                    <div className="truncate text-sm font-medium text-gray-900">
                      {o.customer.ad}
                      {o.isGuest && <span className="ml-1.5 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-gray-500">misafir</span>}
                    </div>
                    <div className="truncate text-xs text-gray-500">{o.customer.sehir} · {o.customer.telefon}</div>
                  </Link>

                  <div className="min-w-0 text-sm text-gray-700">
                    <div className="truncate" title={o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}>{summary(o)}</div>
                    {o.status === "kargoda" && o.cargoTrackingNo && <div className="truncate text-xs text-gray-500">{o.cargoCompany} · <span className="font-mono">{o.cargoTrackingNo}</span></div>}
                    {o.paymentError && (o.status === "odeme_incelemede" || o.status === "odeme_basarisiz") && <div className="truncate text-xs text-gray-500" title={o.paymentError}>{o.paymentError}</div>}
                    {o.adminNote && <div className="truncate text-xs text-amber-700" title={o.adminNote}>📝 {o.adminNote}</div>}
                  </div>

                  <div className="flex items-center justify-between gap-2 xl:contents">
                    <div className="text-sm font-semibold text-gray-900 xl:text-right">{formatTRY(o.total)}</div>
                    <div><span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusClass(o.status)}`}>{ADMIN_STATUS_LABELS[o.status] || o.status}</span></div>
                  </div>

                  <div className="flex justify-end gap-2 xl:col-auto">
                    {next ? (
                      <button onClick={() => setDialog({ ids: [o.id], status: next.to, cargo: { company: o.cargoCompany, no: o.cargoTrackingNo } })}
                        className="w-full rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800 xl:w-auto">
                        {next.label}
                      </button>
                    ) : o.status === "odeme_incelemede" ? (
                      <Link href={`/admin/siparisler/${o.id}`} className="w-full rounded-lg bg-violet-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-violet-700 xl:w-auto">İncele</Link>
                    ) : (
                      <Link href={`/admin/siparisler/${o.id}`} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 xl:w-auto">Detay</Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <button className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 disabled:opacity-40" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>← Önceki</button>
          <span className="text-gray-600">Sayfa {page} / {pages}</span>
          <button className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 disabled:opacity-40" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages}>Sonraki →</button>
        </div>
      )}

      {/* Toplu işlem çubuğu */}
      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-[150] border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2">
            <span className="mr-2 text-sm font-semibold text-gray-900">{selected.size} sipariş seçildi</span>
            {bulkActions.map((a) => (
              <button key={a.status} onClick={() => setDialog({ ids: Array.from(selected), status: a.status })}
                className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800">{a.label}</button>
            ))}
            <button onClick={() => setSelected(new Set())} className="ml-auto rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">Seçimi temizle</button>
          </div>
        </div>
      )}

      <StatusDialog open={!!dialog} status={dialog?.status || null} count={dialog?.ids.length || 1} initialCargo={dialog?.cargo}
        busy={busy} onCancel={() => setDialog(null)} onConfirm={confirm} />

      {toast && (
        <div role="status" className={`fixed left-1/2 top-4 z-[250] -translate-x-1/2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-lg ${toast.tone === "ok" ? "bg-gray-900" : "bg-red-600"}`}>{toast.text}</div>
      )}
    </div>
  );
}

export default function OrdersAdmin() {
  return (
    <Suspense fallback={null}>
      <OrdersAdminInner />
    </Suspense>
  );
}
