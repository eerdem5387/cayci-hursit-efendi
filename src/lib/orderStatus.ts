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

/** Yönetim panelindeki iş akışı sekmeleri */
export const ADMIN_TABS: { key: string; label: string; statuses: string[]; hint: string; alert?: boolean }[] = [
  { key: "yeni", label: "Yeni", statuses: ["paid"], hint: "Ödemesi alındı, hazırlanmayı bekliyor." },
  { key: "hazirlaniyor", label: "Hazırlanıyor", statuses: ["onaylandi"], hint: "Paketleniyor; kargoya verildiğinde takip numarasını girin." },
  { key: "kargoda", label: "Kargoda", statuses: ["kargoda"], hint: "Müşteriye ulaştığında “Teslim Edildi” yapın." },
  { key: "teslim", label: "Teslim Edildi", statuses: ["teslim_edildi"], hint: "Tamamlanan siparişler." },
  { key: "inceleme", label: "İnceleme", statuses: ["odeme_incelemede"], hint: "Banka onayı ile sipariş tutarı/imzası tutmadı. Banka panelinden kontrol edin.", alert: true },
  { key: "iptal", label: "İptal", statuses: ["basarisiz", "failed"], hint: "İptal edilen siparişler." },
  { key: "odenmemis", label: "Ödenmemiş", statuses: ["pending", "odeme_basarisiz"], hint: "Ödemesi tamamlanmamış denemeler. Bunlar sipariş değildir, kargolanmamalıdır." },
  { key: "tumu", label: "Tümü", statuses: [], hint: "" },
];

/** Bir sonraki iş adımı */
export const NEXT_ACTION: Record<string, { to: string; label: string }> = {
  paid: { to: "onaylandi", label: "Hazırlamaya Başla" },
  onaylandi: { to: "kargoda", label: "Kargoya Ver" },
  kargoda: { to: "teslim_edildi", label: "Teslim Edildi" },
};

export const CARGO_COMPANIES = [
  "Yurtiçi Kargo",
  "Aras Kargo",
  "MNG Kargo",
  "PTT Kargo",
  "Sürat Kargo",
  "Hepsijet",
  "Kolay Gelsin",
  "UPS",
  "DHL",
  "Diğer",
];

/** "3 saat önce" gibi göreli zaman */
export function timeAgo(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "az önce";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} dk önce`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} saat önce`;
  const g = Math.round(h / 24);
  if (g < 30) return `${g} gün önce`;
  return d.toLocaleDateString("tr-TR");
}
