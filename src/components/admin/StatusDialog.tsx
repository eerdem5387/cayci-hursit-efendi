"use client";
import { useEffect, useRef, useState } from "react";
import { ADMIN_STATUS_LABELS, CARGO_COMPANIES } from "@/lib/orderStatus";

export type StatusPayload = {
  status: string;
  reason?: string;
  cargoCompany?: string;
  cargoTrackingNo?: string;
  notify: boolean;
};

const DESCRIPTIONS: Record<string, string> = {
  onaylandi: "Sipariş “Hazırlanıyor” olarak işaretlenecek.",
  kargoda: "Kargo bilgileri müşteriye e-postayla iletilir ve takip sayfasında görünür.",
  teslim_edildi: "Sipariş tamamlandı olarak işaretlenecek.",
  basarisiz: "Sipariş iptal edilecek. Ödeme alındıysa iadeyi banka panelinden ayrıca yapmanız gerekir.",
  paid: "Ödemenin banka panelinde gerçekten alındığını doğruladıysanız devam edin.",
};

const NOTIFIABLE = ["onaylandi", "kargoda", "teslim_edildi", "basarisiz"];

/** Durum değiştirme penceresi: kargo bilgisi, iptal nedeni ve müşteri bildirimi */
export default function StatusDialog({
  open,
  status,
  count = 1,
  initialCargo,
  busy,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  status: string | null;
  count?: number;
  initialCargo?: { company?: string | null; no?: string | null };
  busy?: boolean;
  onCancel: () => void;
  onConfirm: (p: StatusPayload) => void;
}) {
  const [company, setCompany] = useState("");
  const [trackingNo, setTrackingNo] = useState("");
  const [reason, setReason] = useState("");
  const [notify, setNotify] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const firstRef = useRef<HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const last = typeof window !== "undefined" ? localStorage.getItem("chf_last_cargo") || "" : "";
    setCompany(initialCargo?.company || last || CARGO_COMPANIES[0]);
    setTrackingNo(initialCargo?.no || "");
    setReason("");
    setNotify(true);
    setError(null);
    setTimeout(() => firstRef.current?.focus(), 30);
  }, [open, initialCargo?.company, initialCargo?.no]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !busy) onCancel(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onCancel]);

  if (!open || !status) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "basarisiz" && !reason.trim()) { setError("Lütfen iptal nedenini yazın."); return; }
    if (status === "kargoda" && count === 1 && !trackingNo.trim()) { setError("Kargo takip numarasını girin."); return; }
    if (status === "kargoda") try { localStorage.setItem("chf_last_cargo", company); } catch { /* yoksay */ }
    onConfirm({
      status,
      reason: reason.trim() || undefined,
      cargoCompany: status === "kargoda" ? company : undefined,
      cargoTrackingNo: status === "kargoda" && count === 1 ? trackingNo.trim() : undefined,
      notify: NOTIFIABLE.includes(status) ? notify : false,
    });
  };

  const danger = status === "basarisiz";

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && !busy && onCancel()}>
      <form onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="status-dialog-title"
        className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl sm:p-6">
        <h2 id="status-dialog-title" className="text-lg font-semibold text-gray-900">
          {count > 1 ? `${count} sipariş → ` : ""}{ADMIN_STATUS_LABELS[status] || status}
        </h2>
        <p className="mt-1 text-sm text-gray-600">{DESCRIPTIONS[status]}</p>

        {status === "kargoda" && (
          <div className="mt-4 grid gap-3">
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-gray-700">Kargo firması</span>
              <select ref={(el) => { firstRef.current = el; }} value={company} onChange={(e) => setCompany(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100">
                {CARGO_COMPANIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            {count === 1 ? (
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-gray-700">Takip numarası</span>
                <input value={trackingNo} onChange={(e) => { setTrackingNo(e.target.value); setError(null); }} inputMode="text" autoComplete="off"
                  placeholder="Kargo fişindeki takip / gönderi no"
                  className="rounded-lg border border-gray-300 px-3 py-2.5 font-mono focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100" />
              </label>
            ) : (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">Toplu işlemde takip numarası girilmez. Gerekirse her siparişin detayından ayrıca ekleyebilirsiniz.</p>
            )}
          </div>
        )}

        {danger && (
          <label className="mt-4 grid gap-1 text-sm">
            <span className="font-medium text-gray-700">İptal nedeni</span>
            <textarea ref={(el) => { firstRef.current = el; }} rows={3} value={reason} onChange={(e) => { setReason(e.target.value); setError(null); }}
              placeholder="Örn. Ürün stokta kalmadı, ücret iadesi yapıldı."
              className="resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100" />
          </label>
        )}

        {NOTIFIABLE.includes(status) && (
          <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-lg bg-gray-50 p-3 text-sm text-gray-800">
            <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="mt-0.5 h-4 w-4 accent-emerald-700" />
            <span>
              Müşteriye e-posta ile bildir
              <span className="block text-xs text-gray-500">Eski siparişleri toplu kapatırken kapatabilirsiniz.</span>
            </span>
          </label>
        )}

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} disabled={busy}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Vazgeç</button>
          <button type="submit" disabled={busy} ref={(el) => { if (status !== "kargoda" && !danger) firstRef.current = el; }}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${danger ? "bg-red-600 hover:bg-red-700" : "bg-emerald-700 hover:bg-emerald-800"}`}>
            {busy ? "Kaydediliyor…" : danger ? "Siparişi İptal Et" : "Onayla"}
          </button>
        </div>
      </form>
    </div>
  );
}
