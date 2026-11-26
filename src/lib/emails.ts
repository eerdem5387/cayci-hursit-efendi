import type { Settings } from "@/lib/data";
import { displayOrderNo, formatTRY } from "@/lib/orderStatus";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.caycihursitefendi.com").replace(/\/+$/, "");

export type EmailOrder = {
  id: string;
  createdAt: string;
  trackingToken?: string | null;
  total: number;
  customer: { ad: string; email: string; adres: string; sehir: string; telefon: string };
  items: { slug: string; qty: number; name?: string | null; price?: number | null }[];
  paymentError?: string | null;
};

export function trackingUrlFor(order: { id: string; trackingToken?: string | null }) {
  return `${SITE_URL}/siparis-takip/${encodeURIComponent(order.trackingToken || order.id)}`;
}

/** Kullanıcı girdisini HTML'e güvenle yerleştirir */
export function esc(v: unknown) {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function style() {
  return `
  body{background:#f6f7f9;margin:0;padding:24px;font-family:Segoe UI,Arial,sans-serif;color:#0f172a}
  .card{max-width:640px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb}
  .hdr{background:#065f46;color:#fff;padding:20px}
  .hdr h1{margin:0;font-size:20px}
  .content{padding:20px;line-height:1.5}
  .muted{color:#64748b}
  .table{width:100%;border-collapse:collapse;margin-top:12px}
  .table th,.table td{border-bottom:1px solid #e5e7eb;padding:8px;text-align:left;font-size:14px}
  .table td.r,.table th.r{text-align:right}
  .cta{display:inline-block;background:#065f46;color:#fff !important;text-decoration:none;padding:10px 14px;border-radius:8px}
  .box{margin-top:12px;padding:12px;border-radius:8px}
  .foot{padding:16px;text-align:center;font-size:12px;color:#64748b}
  `;
}

function itemsTable(order: EmailOrder) {
  const rows = order.items
    .map((i) => {
      const line = typeof i.price === "number" ? formatTRY(i.price * i.qty) : "-";
      return `<tr><td>${esc(i.name || i.slug)}</td><td>${i.qty}</td><td class="r">${line}</td></tr>`;
    })
    .join("");
  return `<table class="table">
    <thead><tr><th>Ürün</th><th>Adet</th><th class="r">Tutar</th></tr></thead>
    <tbody>${rows}
      <tr><td colspan="2"><strong>Toplam</strong></td><td class="r"><strong>${formatTRY(order.total)}</strong></td></tr>
    </tbody>
  </table>`;
}

function layout(title: string, body: string, footer: string) {
  return `<!doctype html><html><head><meta charSet="utf-8"/><style>${style()}</style></head><body>
    <div class="card">
      <div class="hdr"><h1>${title}</h1></div>
      <div class="content">${body}</div>
      <div class="foot">${footer}</div>
    </div>
  </body></html>`;
}

/** Ödeme alındığında müşteriye giden onay */
export function renderCustomerPaidEmail(order: EmailOrder, settings: Settings) {
  const title = esc(settings.site?.title || "Çaycı Hurşit Efendi");
  const url = trackingUrlFor(order);
  return layout(
    `Siparişiniz alındı – #${displayOrderNo(order.id)}`,
    `<p>Merhaba ${esc(order.customer.ad)},</p>
     <p>Ödemeniz başarıyla alındı ve siparişiniz hazırlanmak üzere sıraya alındı. Kargoya verildiğinde size ayrıca haber vereceğiz.</p>
     <p><strong>Sipariş No:</strong> #${displayOrderNo(order.id)}<br/>
     <span class="muted">${new Date(order.createdAt).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}</span></p>
     ${itemsTable(order)}
     <p style="margin-top:12px"><strong>Teslimat adresi:</strong><br/>${esc(order.customer.adres)}, ${esc(order.customer.sehir)}</p>
     <p style="margin-top:16px"><a class="cta" href="${url}">Siparişimi Takip Et</a></p>
     <p class="muted">Sorularınız için bu e-postayı yanıtlayabilirsiniz.</p>`,
    `Teşekkür ederiz. ${title}`
  );
}

/** Ödeme alındığında yöneticiye giden bildirim */
export function renderAdminOrderEmail(order: EmailOrder, settings: Settings, opts?: { heading?: string; note?: string }) {
  const title = esc(settings.site?.title || "Çaycı Hurşit Efendi");
  const heading = opts?.heading || "Yeni sipariş – ödeme alındı";
  const note = opts?.note
    ? `<div class="box" style="background:#fef3c7;color:#92400e;border:1px solid #fde68a">${esc(opts.note)}</div>`
    : "";
  return layout(
    `${esc(heading)} – #${displayOrderNo(order.id)}`,
    `${note}
     <p><strong>Sipariş:</strong> #${displayOrderNo(order.id)} <span class="muted">(${esc(order.id)})</span><br/>
     <span class="muted">${new Date(order.createdAt).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}</span></p>
     <p><strong>Müşteri:</strong> ${esc(order.customer.ad)} – ${esc(order.customer.email)} – ${esc(order.customer.telefon)}<br/>
     <strong>Adres:</strong> ${esc(order.customer.adres)}, ${esc(order.customer.sehir)}</p>
     ${itemsTable(order)}
     <p style="margin-top:16px"><a class="cta" href="${SITE_URL}/admin/siparisler/${encodeURIComponent(order.id)}">Panelde Gör</a></p>`,
    `Bu e-posta ${title} tarafından otomatik gönderildi.`
  );
}

export type CustomerNotifiableStatus = "onaylandi" | "kargoda" | "teslim_edildi" | "basarisiz";

export function renderCustomerOrderStatusEmail(
  order: EmailOrder,
  settings: Settings,
  params: { status: CustomerNotifiableStatus; reason?: string }
) {
  const title = esc(settings.site?.title || "Çaycı Hurşit Efendi");
  const human: Record<CustomerNotifiableStatus, string> = {
    onaylandi: "Siparişiniz hazırlanıyor",
    kargoda: "Siparişiniz kargoya verildi",
    teslim_edildi: "Siparişiniz teslim edildi",
    basarisiz: "Siparişiniz iptal edildi",
  };
  const reasonBlock =
    params.status === "basarisiz" && params.reason
      ? `<div class="box" style="background:#fef2f2;color:#991b1b;border:1px solid #fecaca"><strong>Açıklama:</strong> ${esc(params.reason)}</div>`
      : "";
  return layout(
    `${human[params.status]} – #${displayOrderNo(order.id)}`,
    `<p>Merhaba ${esc(order.customer.ad)},</p>
     <p>#${displayOrderNo(order.id)} numaralı siparişinizin durumu güncellendi: <strong>${human[params.status]}</strong>.</p>
     ${reasonBlock}
     ${itemsTable(order)}
     <p style="margin-top:16px"><a class="cta" href="${trackingUrlFor(order)}">Siparişimi Takip Et</a></p>`,
    `Teşekkür ederiz. ${title}`
  );
}
