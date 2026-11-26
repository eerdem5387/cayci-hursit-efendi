"use client";
import { useCallback, useEffect, useState, use } from "react";
import Link from "next/link";
import StatusDialog, { type StatusPayload } from "@/components/admin/StatusDialog";
import { useOrderUpdate } from "@/components/admin/useOrderUpdate";
import { ADMIN_STATUS_LABELS, CARGO_COMPANIES, NEXT_ACTION, displayOrderNo, formatTRY, statusClass, timeAgo } from "@/lib/orderStatus";

type HistoryEntry = { at: string; from?: string; status: string; note?: string; notified?: boolean };
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
  cargoCompany?: string | null;
  cargoTrackingNo?: string | null;
  adminNote?: string | null;
  history: HistoryEntry[];
};

const PIPELINE = [
  { status: "paid", label: "Ödeme Alındı" },
  { status: "onaylandi", label: "Hazırlanıyor" },
  { status: "kargoda", label: "Kargoda" },
  { status: "teslim_edildi", label: "Teslim Edildi" },
];

function fmt(d: string | Date) {
  return new Date(d).toLocaleString("tr-TR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function waNumber(phone: string) {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("0")) d = "9" + d;
  else if (d.length === 10) d = "90" + d;
  return d;
}

export default function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [cargo, setCargo] = useState({ company: "", no: "" });
  const [copied, setCopied] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/orders?id=${encodeURIComponent(id)}`, { cache: "no-store" })
      .then(async (r) => {
        const d = await r.json().catch(() => ({} as any));
        if (!r.ok || !d?.ok) throw new Error(d?.error || "Sipariş yüklenemedi");
        setOrder(d.order);
        setNote(d.order.adminNote || "");
        setCargo({ company: d.order.cargoCompany || "", no: d.order.cargoTrackingNo || "" });
      })
      .catch((e) => setError(e.message));
  }, [id]);
  useEffect(load, [load]);

  const { busy, toast, update, show } = useOrderUpdate(load);

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <div className="font-semibold text-red-800">{error}</div>
        <Link href="/admin/siparisler" className="mt-3 inline-block text-sm text-red-700 underline">Siparişlere dön</Link>
      </div>
    );
  }
  if (!order) {
    return <div className="grid gap-4">{[0, 1, 2].map((i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-100" />)}</div>;
  }

  const no = displayOrderNo(order.id);
  const next = NEXT_ACTION[order.status];
  const unpaid = order.status === "pending" || order.status === "odeme_basarisiz";
  const review = order.status === "odeme_incelemede";
  const cancelled = order.status === "basarisiz" || order.status === "failed";
  const stage = PIPELINE.findIndex((p) => p.status === order.status);
  const stageTime = (s: string) => {
    if (s === "paid") return order.paidAt || null;
    const h = [...order.history].reverse().find((e) => e.status === s);
    return h?.at || null;
  };
  const addressBlock = `${order.customer.ad}\n${order.customer.telefon}\n${order.customer.adres}\n${order.customer.sehir}`;
  const cargoDirty = cargo.company !== (order.cargoCompany || "") || cargo.no !== (order.cargoTrackingNo || "");
  const noteDirty = note !== (order.adminNote || "");

  const confirm = async (p: StatusPayload) => {
    const ok = await update([order.id], p, `#${no} → ${ADMIN_STATUS_LABELS[p.status]}`);
    if (ok) setDialog(null);
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(addressBlock);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      show("err", "Kopyalanamadı");
    }
  };

  const timeline: { at: string; title: string; detail?: string; tone: string }[] = [
    { at: order.createdAt, title: "Sipariş oluşturuldu", detail: order.isGuest ? "Misafir müşteri" : "Üye müşteri", tone: "bg-gray-400" },
    ...(order.paidAt ? [{ at: order.paidAt, title: `Ödeme alındı · ${formatTRY(order.paidAmount ?? order.total)}`, detail: order.paymentRef ? `Banka ref: ${order.paymentRef}` : undefined, tone: "bg-emerald-500" }] : []),
    ...order.history.map((h) => ({
      at: h.at,
      title: ADMIN_STATUS_LABELS[h.status] || h.status,
      detail: [h.note, h.notified ? "müşteriye e-posta gönderildi" : null].filter(Boolean).join(" · ") || undefined,
      tone: h.status === "basarisiz" ? "bg-red-500" : h.status === "kargoda" ? "bg-blue-500" : "bg-emerald-500",
    })),
  ].sort((a, b) => +new Date(a.at) - +new Date(b.at));

  return (
    <div className="grid gap-5">
      {/* Başlık + aksiyonlar */}
      <div className="print:hidden">
        <Link href="/admin/siparisler" className="text-sm text-emerald-700 hover:underline">← Siparişler</Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-mono text-2xl font-bold text-gray-900">#{no}</h1>
              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(order.status)}`}>{ADMIN_STATUS_LABELS[order.status] || order.status}</span>
            </div>
            <p className="mt-1 text-sm text-gray-500">{fmt(order.createdAt)} · {timeAgo(order.createdAt)} · {formatTRY(order.total)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Kargo Fişi Yazdır
            </button>
            {!unpaid && !cancelled && (
              <button onClick={() => setDialog("basarisiz")} className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50">İptal Et</button>
            )}
            {review && (
              <button onClick={() => setDialog("paid")} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">Ödemeyi Onayla</button>
            )}
            {next && (
              <button onClick={() => setDialog(next.to)} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">{next.label}</button>
            )}
          </div>
        </div>
      </div>

      {/* Uyarılar */}
      {unpaid && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 print:hidden">
          <strong>Bu bir sipariş değil, tamamlanmamış ödeme denemesidir.</strong> Ödeme alınmadı; kargolanmamalıdır.
          {order.paymentError && <div className="mt-1">Neden: {order.paymentError}</div>}
        </div>
      )}
      {review && (
        <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-900 print:hidden">
          <strong>Ödeme elle kontrol edilmeli.</strong> {order.paymentError}
          <div className="mt-1">Ziraat sanal POS panelinde bu siparişi (sistem no: <span className="font-mono">{order.id}</span>) arayın. Ödeme alındıysa “Ödemeyi Onayla”, alınmadıysa “İptal Et”.</div>
        </div>
      )}
      {cancelled && order.statusReason && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 print:hidden">İptal nedeni: {order.statusReason}</div>
      )}

      {/* İlerleme */}
      {!unpaid && !review && (
        <ol className="grid grid-cols-4 rounded-xl border border-gray-200 bg-white p-4 print:hidden">
          {PIPELINE.map((p, i) => {
            const done = !cancelled && i <= stage;
            const t = stageTime(p.status);
            return (
              <li key={p.status} className="flex flex-col items-center text-center">
                <div className="flex w-full items-center">
                  <span className={`h-0.5 flex-1 ${i === 0 ? "invisible" : done ? "bg-emerald-500" : "bg-gray-200"}`} />
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${done ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-400"}`}>{done ? "✓" : i + 1}</span>
                  <span className={`h-0.5 flex-1 ${i === PIPELINE.length - 1 ? "invisible" : !cancelled && i < stage ? "bg-emerald-500" : "bg-gray-200"}`} />
                </div>
                <span className={`mt-1.5 text-xs font-medium sm:text-sm ${done ? "text-gray-900" : "text-gray-400"}`}>{p.label}</span>
                {done && t && <span className="text-[11px] text-gray-500">{new Date(t).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" })}</span>}
              </li>
            );
          })}
        </ol>
      )}

      <div className="grid gap-5 xl:grid-cols-3 print:hidden">
        <div className="grid min-w-0 content-start gap-5 xl:col-span-2">
          {/* Ürünler */}
          <section className="rounded-xl border border-gray-200 bg-white">
            <h2 className="border-b border-gray-100 px-5 py-3 font-semibold text-gray-900">Ürünler <span className="text-sm font-normal text-gray-500">({order.items.reduce((a, b) => a + b.qty, 0)} adet)</span></h2>
            <ul className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <li key={item.slug} className="flex items-center gap-3 px-5 py-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt="" className="h-12 w-12 rounded-lg bg-gray-50 object-contain" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.price != null ? `${formatTRY(item.price)} × ${item.qty}` : `${item.qty} adet`}</div>
                  </div>
                  <span className="hidden rounded-md bg-gray-100 px-2 py-1 text-sm font-bold text-gray-900 sm:inline-block">×{item.qty}</span>
                  {item.price != null && <div className="shrink-0 text-right font-semibold text-gray-900">{formatTRY(item.price * item.qty)}</div>}
                </li>
              ))}
            </ul>
            <div className="flex justify-between border-t border-gray-100 px-5 py-3 text-base font-bold">
              <span>Toplam <span className="text-xs font-normal text-gray-500">(kargo ücretsiz)</span></span>
              <span className="text-emerald-700">{formatTRY(order.total)}</span>
            </div>
          </section>

          {/* Kargo */}
          {!unpaid && !cancelled && (
            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="mb-3 font-semibold text-gray-900">Kargo</h2>
              <div className="grid gap-3 sm:grid-cols-[1fr_1.3fr_auto]">
                <select value={cargo.company} onChange={(e) => setCargo({ ...cargo, company: e.target.value })}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100">
                  <option value="">Kargo firması seçin</option>
                  {CARGO_COMPANIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <input value={cargo.no} onChange={(e) => setCargo({ ...cargo, no: e.target.value })} placeholder="Takip numarası"
                  className="rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100" />
                <button disabled={!cargoDirty || busy} onClick={() => update([order.id], { cargoCompany: cargo.company, cargoTrackingNo: cargo.no }, "Kargo bilgisi kaydedildi")}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-30">Kaydet</button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {order.status === "kargoda" || order.status === "teslim_edildi"
                  ? "Müşteri bu bilgiyi sipariş takip sayfasında görür."
                  : "“Kargoya Ver” dediğinizde bu bilgiler müşteriye e-postayla gönderilir."}
              </p>
            </section>
          )}

          {/* Geçmiş */}
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 font-semibold text-gray-900">İşlem Geçmişi</h2>
            <ol className="relative ml-1.5 border-l border-gray-200">
              {timeline.map((e, i) => (
                <li key={i} className="mb-4 ml-4 last:mb-0">
                  <span className={`absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white ${e.tone}`} />
                  <div className="text-sm font-medium text-gray-900">{e.title}</div>
                  <div className="text-xs text-gray-500">{fmt(e.at)}{e.detail ? ` · ${e.detail}` : ""}</div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="grid min-w-0 content-start gap-5 md:grid-cols-2 xl:grid-cols-1">
          {/* Müşteri */}
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Müşteri</h2>
              {order.isGuest && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">Misafir</span>}
            </div>
            <div className="text-sm">
              <div className="font-medium text-gray-900">{order.customer.ad}</div>
              <a href={`mailto:${order.customer.email}`} className="block truncate text-gray-600 hover:text-emerald-700">{order.customer.email}</a>
              <a href={`tel:${order.customer.telefon.replace(/\s/g, "")}`} className="block text-gray-600 hover:text-emerald-700">{order.customer.telefon}</a>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <a href={`tel:${order.customer.telefon.replace(/\s/g, "")}`} className="rounded-lg border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50">Ara</a>
              <a href={`https://wa.me/${waNumber(order.customer.telefon)}?text=${encodeURIComponent(`Merhaba ${order.customer.ad}, #${no} numaralı siparişiniz hakkında yazıyoruz.`)}`}
                target="_blank" rel="noopener noreferrer" className="rounded-lg border border-emerald-600 px-3 py-2 text-center text-sm font-medium text-emerald-700 hover:bg-emerald-50">WhatsApp</a>
            </div>
            <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Teslimat adresi</span>
                <button onClick={copyAddress} className="text-xs font-medium text-emerald-700 hover:underline">{copied ? "Kopyalandı ✓" : "Kopyala"}</button>
              </div>
              <div className="whitespace-pre-line">{order.customer.adres}</div>
              <div className="font-medium">{order.customer.sehir}</div>
            </div>
            {order.trackingToken && (
              <a href={`/siparis-takip/${order.trackingToken}`} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs text-emerald-700 hover:underline">Müşterinin gördüğü takip sayfası ↗</a>
            )}
          </section>

          {/* İç not */}
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-2 font-semibold text-gray-900">İç Not</h2>
            <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Sadece sizin göreceğiniz not (ör. hediye paketi istendi)"
              className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100" />
            <button disabled={!noteDirty || busy} onClick={() => update([order.id], { adminNote: note }, "Not kaydedildi")}
              className="mt-2 w-full rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-30">Notu Kaydet</button>
          </section>

          {/* Ödeme */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 text-sm">
            <h2 className="mb-2 font-semibold text-gray-900">Ödeme</h2>
            <dl className="grid gap-1.5">
              <div className="flex justify-between gap-2"><dt className="text-gray-500">Sipariş tutarı</dt><dd className="font-medium">{formatTRY(order.total)}</dd></div>
              {order.paidAmount != null && <div className="flex justify-between gap-2"><dt className="text-gray-500">Bankadan onaylanan</dt><dd className="font-medium">{formatTRY(order.paidAmount)}</dd></div>}
              {order.paidAt && <div className="flex justify-between gap-2"><dt className="text-gray-500">Ödeme zamanı</dt><dd>{fmt(order.paidAt)}</dd></div>}
              {order.paymentRef && <div className="flex justify-between gap-2"><dt className="text-gray-500">Banka ref.</dt><dd className="break-all text-right font-mono text-xs">{order.paymentRef}</dd></div>}
              <div className="flex justify-between gap-2"><dt className="text-gray-500">Sistem no</dt><dd className="break-all text-right font-mono text-xs">{order.id}</dd></div>
            </dl>
          </section>
        </aside>
      </div>

      {/* Yazdırılabilir kargo / paket fişi */}
      <div className="hidden text-black print:block">
        <div className="border-2 border-black p-6">
          <div className="flex justify-between border-b border-black pb-3">
            <div className="text-lg font-bold">Çaycı Hurşit Efendi</div>
            <div className="text-right">
              <div className="font-mono text-xl font-bold">#{no}</div>
              <div className="text-sm">{new Date(order.createdAt).toLocaleDateString("tr-TR")}</div>
            </div>
          </div>
          <div className="py-4">
            <div className="text-xs font-semibold uppercase">Alıcı</div>
            <div className="mt-1 text-2xl font-bold">{order.customer.ad}</div>
            <div className="text-lg">{order.customer.telefon}</div>
            <div className="mt-2 whitespace-pre-line text-lg">{order.customer.adres}</div>
            <div className="text-lg font-bold">{order.customer.sehir}</div>
          </div>
          <table className="w-full border-t border-black text-sm">
            <tbody>
              {order.items.map((i) => (
                <tr key={i.slug} className="border-b border-gray-400"><td className="py-1.5">{i.name}</td><td className="py-1.5 text-right font-bold">× {i.qty}</td></tr>
              ))}
            </tbody>
          </table>
          {order.adminNote && <div className="mt-3 text-sm"><strong>Not:</strong> {order.adminNote}</div>}
        </div>
      </div>

      <StatusDialog open={!!dialog} status={dialog} initialCargo={{ company: cargo.company || order.cargoCompany, no: cargo.no || order.cargoTrackingNo }}
        busy={busy} onCancel={() => setDialog(null)} onConfirm={confirm} />

      {toast && (
        <div role="status" className={`fixed left-1/2 top-4 z-[250] -translate-x-1/2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-lg print:hidden ${toast.tone === "ok" ? "bg-gray-900" : "bg-red-600"}`}>{toast.text}</div>
      )}
    </div>
  );
}
