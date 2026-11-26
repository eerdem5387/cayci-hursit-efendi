// Sipariş durumları – hem sunucu hem istemci tarafında kullanılır.
//
// Akış:
//   pending (ödeme bekleniyor) ──► paid (ödeme alındı) ──► onaylandi ──► kargoda ──► teslim_edildi
//        │
//        ├──► odeme_basarisiz (banka reddetti / 3D doğrulanamadı / müşteri yeniden denedi)
//        └──► odeme_incelemede (banka onay verdi ama tutar/imza tutarsız → elle kontrol)
//   Herhangi bir aşamada admin "basarisiz" (iptal) yapabilir.

export const ORDER_STATUSES = [
  "pending",
  "paid",
  "onaylandi",
  "kargoda",
  "teslim_edildi",
  "basarisiz",
  "odeme_basarisiz",
  "odeme_incelemede",
  "failed",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Admin panelinde gösterilen etiketler */
export const ADMIN_STATUS_LABELS: Record<string, string> = {
  pending: "Ödeme Bekleniyor",
  paid: "Ödendi – Hazırlanacak",
  onaylandi: "Onaylandı / Hazırlanıyor",
  kargoda: "Kargoda",
  teslim_edildi: "Teslim Edildi",
  basarisiz: "İptal / Başarısız",
  odeme_basarisiz: "Ödeme Başarısız",
  odeme_incelemede: "Ödeme İncelemede",
  failed: "(Eski) Başarısız",
};

/** Müşteriye gösterilen etiketler */
export const CUSTOMER_STATUS_LABELS: Record<string, string> = {
  pending: "Ödeme bekleniyor",
  paid: "Ödeme alındı",
  onaylandi: "Hazırlanıyor",
  kargoda: "Kargoya verildi",
  teslim_edildi: "Teslim edildi",
  basarisiz: "İptal edildi",
  odeme_basarisiz: "Ödeme tamamlanamadı",
  odeme_incelemede: "Ödeme kontrol ediliyor",
  failed: "İptal edildi",
};

export const STATUS_TONE: Record<string, "amber" | "emerald" | "blue" | "green" | "red" | "violet" | "gray"> = {
  pending: "amber",
  paid: "emerald",
  onaylandi: "emerald",
  kargoda: "blue",
  teslim_edildi: "green",
  basarisiz: "red",
  odeme_basarisiz: "red",
  odeme_incelemede: "violet",
  failed: "red",
};

export const TONE_CLASSES: Record<string, string> = {
  amber: "bg-amber-50 text-amber-800 border-amber-200",
  emerald: "bg-emerald-50 text-emerald-800 border-emerald-200",
  blue: "bg-blue-50 text-blue-800 border-blue-200",
  green: "bg-green-50 text-green-800 border-green-200",
  red: "bg-red-50 text-red-800 border-red-200",
  violet: "bg-violet-50 text-violet-800 border-violet-200",
  gray: "bg-gray-50 text-gray-700 border-gray-200",
};

export function statusClass(status: string) {
  return TONE_CLASSES[STATUS_TONE[status] || "gray"];
}

/** Ödemesi alınmış (ve sonrasındaki) durumlar */
export const PAID_STATUSES = ["paid", "onaylandi", "kargoda", "teslim_edildi"];

export function isPaidStatus(status: string) {
  return PAID_STATUSES.includes(status);
}

/** Müşteriye gösterilecek kısa sipariş numarası */
export function displayOrderNo(id: string) {
  return id.slice(-8).toUpperCase();
}

export function formatTRY(n: number) {
  return (Number(n) || 0).toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}
