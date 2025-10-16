import { HomeContent, Settings } from "@/lib/data";

type OrderLite = {
    id: string;
    createdAt: string;
    customer: { ad: string; email: string; adres: string; sehir: string; telefon: string };
    items: { slug: string; qty: number; name?: string; price?: number }[];
};

function style() {
    return `
  body{background:#f6f7f9;margin:0;padding:24px;font-family:Segoe UI,Arial,sans-serif;color:#0f172a}
  .card{max-width:640px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb}
  .hdr{background:#065f46;color:#fff;padding:20px}
  .hdr h1{margin:0;font-size:20px}
  .content{padding:20px}
  .muted{color:#64748b}
  .table{width:100%;border-collapse:collapse;margin-top:12px}
  .table th,.table td{border-bottom:1px solid #e5e7eb;padding:8px;text-align:left;font-size:14px}
  .cta{display:inline-block;background:#065f46;color:#fff;text-decoration:none;padding:10px 14px;border-radius:8px}
  .foot{padding:16px;text-align:center;font-size:12px;color:#64748b}
  `;
}

export function renderAdminOrderEmail(order: OrderLite, settings: Settings) {
    const title = settings.site?.title || "Yeni Sipariş";
    const rows = order.items.map((i) => `<tr>
      <td>${i.name || i.slug}</td>
      <td>${i.qty}</td>
      <td>${typeof i.price === "number" ? i.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" }) : "-"}</td>
    </tr>`).join("");
    return `<!doctype html><html><head><meta charSet="utf-8"/><style>${style()}</style></head><body>
    <div class="card">
      <div class="hdr"><h1>${title} – Yeni Sipariş</h1></div>
      <div class="content">
        <p><strong>Sipariş ID:</strong> ${order.id}<br/>
        <span class="muted">${new Date(order.createdAt).toLocaleString("tr-TR")}</span></p>
        <p>
          <strong>Müşteri:</strong> ${order.customer.ad} – ${order.customer.email} – ${order.customer.telefon}<br/>
          <strong>Adres:</strong> ${order.customer.adres}, ${order.customer.sehir}
        </p>
        <table class="table">
          <thead><tr><th>Ürün</th><th>Adet</th><th>Fiyat</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="margin-top:16px">
          <a class="cta" href="/admin/siparisler">Panelde Gör</a>
        </p>
      </div>
      <div class="foot">Bu e-posta ${title} tarafından otomatik gönderildi.</div>
    </div>
  </body></html>`;
}

export function renderCustomerOrderEmail(order: OrderLite, settings: Settings) {
    const title = settings.site?.title || "Çaycı Hurşit Efendi";
    const rows = order.items.map((i) => `<tr>
      <td>${i.name || i.slug}</td>
      <td>${i.qty}</td>
      <td>${typeof i.price === "number" ? i.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" }) : "-"}</td>
    </tr>`).join("");
    return `<!doctype html><html><head><meta charSet="utf-8"/><style>${style()}</style></head><body>
    <div class="card">
      <div class="hdr"><h1>${title} – Siparişiniz Oluşturuldu</h1></div>
      <div class="content">
        <p>Merhaba ${order.customer.ad}, siparişiniz başarıyla oluşturuldu.</p>
        <p><strong>Sipariş ID:</strong> ${order.id}<br/>
        <span class="muted">${new Date(order.createdAt).toLocaleString("tr-TR")}</span></p>
        <table class="table">
          <thead><tr><th>Ürün</th><th>Adet</th><th>Fiyat</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="margin-top:16px" class="muted">Herhangi bir sorunuz olursa bu e-postayı yanıtlayabilirsiniz.</p>
      </div>
      <div class="foot">Teşekkür ederiz. ${title}</div>
    </div>
  </body></html>`;
}


