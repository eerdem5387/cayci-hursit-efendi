"use client";
import { useCallback, useEffect, useState, use } from "react";
import Link from "next/link";
import { ADMIN_STATUS_LABELS, displayOrderNo, formatTRY, statusClass } from "@/lib/orderStatus";

type Order = {
  id: string;
  createdAt: string;
  customer: { ad: string; email: string; adres: string; sehir: string; telefon: string };
  items: { slug: string; qty: number; name: string; price: number | null; image: string }[];
  status: string;
  total: number;
  isGuest?: boolean;
  trackingToken?: string | null;
  paidAt?: string | null;
  paidAmount?: number | null;
  paymentRef?: string | null;
  paymentError?: string | null;
  statusReason?: string | null;
};

const SELECTABLE = ["paid", "onaylandi", "kargoda", "teslim_edildi", "basarisiz"];

export default function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/orders?id=${encodeURIComponent(id)}`, { cache: "no-store" })
      .then(async (r) => {
        const d = await r.json().catch(() => ({} as any));
        if (!r.ok || !d?.ok) throw new Error(d?.error || "Sipariş yüklenemedi");
        setOrder(d.order);
      })
      .catch((e) => setError(e.message));
  }, [id]);
  useEffect(load, [load]);

  const updateStatus = async (status: string) => {
    if (!order || !status || status === order.status) return;
    const body: any = { id: order.id, status };
    if (status === "basarisiz") {
      const reason = window.prompt("İptal / başarısız nedeni (müşteriye e-postayla iletilir):");
      if (!reason || !reason.trim()) return;
      body.reason = reason.trim();
    } else if (status === "paid" && order.status === "odeme_incelemede") {
      if (!window.confirm("Ödemenin banka panelinde gerçekten alındığını doğruladınız mı?")) return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/orders", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await res.json().catch(() => ({} as any));
      if (!res.ok) alert(d?.error || "Durum güncellenemedi");
      load();
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="font-semibold text-red-800">{error}</div>
        <Link href="/admin/siparisler" className="mt-3 inline-block text-sm text-red-700 underline">Siparişler listesine dön</Link>
      </div>
    );
  }
  if (!order) return <div className="py-8 text-center text-gray-500">Yükleniyor…</div>;

  const totalQty = order.items.reduce((a, b) => a + b.qty, 0);
  const isAttempt = order.status === "pending" || order.status === "odeme_basarisiz";

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Sipariş #{displayOrderNo(order.id)}</h1>
          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(order.status)}`}>{ADMIN_STATUS_LABELS[order.status] || order.status}</span>
        </div>
        <Link href="/admin/siparisler" className="text-sm text-emerald-700">← Siparişler</Link>
      </div>

      {isAttempt && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Bu bir sipariş değil, tamamlanmamış ödeme denemesidir.</strong> Ödeme alınmadı; kargolanmamalıdır.
          {order.paymentError && <div className="mt-1">Neden: {order.paymentError}</div>}
        </div>
      )}
      {order.status === "odeme_incelemede" && (
        <div className="rounded-lg border border-violet-200 bg-violet-50 p-4 text-sm text-violet-900">
          <strong>Ödeme elle kontrol edilmeli.</strong> {order.paymentError}
          <div className="mt-1">Banka panelinde ödemeyi doğruladıktan sonra durumu “Ödendi” yapın; ödeme yoksa “İptal” seçin.</div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded-lg border border-gray-200 bg-white p-4 md:col-span-2">
          <h2 className="mb-4 font-semibold">Sipariş Kalemleri</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.slug} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt="" className="h-12 w-12 rounded bg-white object-contain" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-600">{item.price != null ? `${formatTRY(item.price)} × ${item.qty}` : `Adet: ${item.qty}`}</div>
                </div>
                {item.price != null && <div className="font-semibold text-gray-900">{formatTRY(item.price * item.qty)}</div>}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
            <div className="text-sm text-gray-600">Toplam adet: {totalQty}</div>
            <div className="text-right">
              <div className="mb-1 text-sm text-gray-600">Sipariş Tutarı</div>
              <div className="text-2xl font-bold text-emerald-700">{formatTRY(order.total)}</div>
            </div>
          </div>
        </section>

        <aside className="grid content-start gap-4">
          {!isAttempt && (
            <section className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="mb-2 font-semibold">Durum</h3>
              <select
                className="w-full rounded border border-gray-300 px-2 py-2 text-sm"
                value={SELECTABLE.includes(order.status) ? order.status : ""}
                disabled={saving}
                onChange={(e) => updateStatus(e.target.value)}
              >
                {!SELECTABLE.includes(order.status) && <option value="">Durum değiştir…</option>}
                {SELECTABLE.map((s) => <option key={s} value={s}>{ADMIN_STATUS_LABELS[s]}</option>)}
              </select>
              <div className="mt-2 text-xs text-gray-500">Hazırlanıyor, Kargoda, Teslim Edildi ve İptal durumlarında müşteriye otomatik e-posta gider.</div>
              {order.statusReason && <div className="mt-2 text-sm text-gray-700">İptal nedeni: {order.statusReason}</div>}
            </section>
          )}

          <section className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
            <h3 className="mb-2 font-semibold">Ödeme</h3>
            <dl className="grid gap-1">
              <div className="flex justify-between gap-2"><dt className="text-gray-600">Tutar</dt><dd>{formatTRY(order.total)}</dd></div>
              {order.paidAmount != null && <div className="flex justify-between gap-2"><dt className="text-gray-600">Bankadan onaylanan</dt><dd>{formatTRY(order.paidAmount)}</dd></div>}
              {order.paidAt && <div className="flex justify-between gap-2"><dt className="text-gray-600">Ödeme zamanı</dt><dd>{new Date(order.paidAt).toLocaleString("tr-TR")}</dd></div>}
              {order.paymentRef && <div className="flex justify-between gap-2"><dt className="text-gray-600">Banka ref.</dt><dd className="break-all text-right font-mono text-xs">{order.paymentRef}</dd></div>}
              <div className="flex justify-between gap-2"><dt className="text-gray-600">Sistem no</dt><dd className="break-all text-right font-mono text-xs">{order.id}</dd></div>
            </dl>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
            <h3 className="mb-2 font-semibold">Müşteri {order.isGuest && <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">Misafir</span>}</h3>
            <div>{order.customer.ad}</div>
            <div className="text-gray-600">{order.customer.email}</div>
            <div className="text-gray-600">{order.customer.telefon}</div>
            <div className="mt-2 text-gray-700">{order.customer.adres}, {order.customer.sehir}</div>
            <div className="mt-2 text-xs text-gray-500">{new Date(order.createdAt).toLocaleString("tr-TR")}</div>
            {order.trackingToken && (
              <a href={`/siparis-takip/${order.trackingToken}`} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-emerald-700 underline">Müşterinin takip sayfası</a>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
