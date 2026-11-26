import Link from "next/link";
import { prisma } from "@/lib/db";
import { resolveItems } from "@/lib/orders";
import { CUSTOMER_STATUS_LABELS, displayOrderNo, formatTRY, statusClass } from "@/lib/orderStatus";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sipariş Takibi", robots: { index: false } };

const STEPS = [
  { key: "paid", label: "Ödeme Alındı" },
  { key: "onaylandi", label: "Hazırlanıyor" },
  { key: "kargoda", label: "Kargoda" },
  { key: "teslim_edildi", label: "Teslim Edildi" },
];

export default async function OrderTrackPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  // Yeni bağlantılar takip anahtarını, eski e-postalardaki bağlantılar sipariş kimliğini kullanır
  const order =
    (await prisma.order.findFirst({ where: { trackingToken: token }, include: { items: true } })) ||
    (/^c[a-z0-9]{20,}$/.test(token) ? await prisma.order.findUnique({ where: { id: token }, include: { items: true } }) : null);

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center md:px-6">
        <h1 className="text-2xl font-bold text-gray-900">Sipariş bulunamadı</h1>
        <p className="mt-2 text-gray-600">Bağlantınız geçersiz olabilir. Yardım için bizimle iletişime geçebilirsiniz.</p>
        <Link href="/iletisim" className="mt-6 inline-block rounded-lg bg-emerald-700 px-6 py-3 font-medium text-white hover:bg-emerald-800">İletişime Geç</Link>
      </div>
    );
  }

  const items = await resolveItems(order.items);
  const status = String(order.status || "pending");
  const stepIdx = STEPS.findIndex((s) => s.key === status);
  const cancelled = ["basarisiz", "failed"].includes(status);
  const unpaid = ["pending", "odeme_basarisiz"].includes(status);
  const review = status === "odeme_incelemede";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Sipariş #{displayOrderNo(order.id)}</h1>
          <p className="mt-1 text-sm text-gray-600">{order.createdAt.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul", dateStyle: "long", timeStyle: "short" })}</p>
        </div>
        <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${statusClass(status)}`}>{CUSTOMER_STATUS_LABELS[status] || status}</span>
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
        {cancelled ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <div className="font-semibold">Bu sipariş iptal edildi.</div>
            {order.statusReason && <div className="mt-1 text-sm">Açıklama: {order.statusReason}</div>}
          </div>
        ) : unpaid ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <div className="font-semibold">Bu siparişin ödemesi tamamlanmadı.</div>
            <div className="mt-1 text-sm">{order.paymentError || "Ödeme alınmadığı için sipariş işleme alınmadı."} Kartınızdan ödeme alınmadı.</div>
          </div>
        ) : review ? (
          <div className="rounded-lg border border-violet-200 bg-violet-50 p-4 text-violet-900">
            <div className="font-semibold">Ödemeniz kontrol ediliyor.</div>
            <div className="mt-1 text-sm">Ekibimiz en kısa sürede sizinle iletişime geçecek. Lütfen tekrar ödeme yapmayın.</div>
          </div>
        ) : (
          <ol className="grid grid-cols-4 gap-2">
            {STEPS.map((s, i) => {
              const done = i <= stepIdx;
              return (
                <li key={s.key} className="flex flex-col items-center text-center">
                  <div className="flex w-full items-center">
                    <span className={`h-1 flex-1 rounded ${i === 0 ? "invisible" : done ? "bg-emerald-500" : "bg-gray-200"}`} />
                    <span className={`mx-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${done ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-500"}`}>{done ? "✓" : i + 1}</span>
                    <span className={`h-1 flex-1 rounded ${i === STEPS.length - 1 ? "invisible" : i < stepIdx ? "bg-emerald-500" : "bg-gray-200"}`} />
                  </div>
                  <span className={`mt-2 text-xs sm:text-sm ${done ? "font-medium text-gray-900" : "text-gray-500"}`}>{s.label}</span>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
          <h2 className="mb-3 font-semibold text-gray-900">Teslimat</h2>
          <div className="text-sm text-gray-700">
            <div className="font-medium text-gray-900">{order.customerAd}</div>
            <div>{order.customerAdres}</div>
            <div>{order.customerSehir}</div>
            <div className="mt-2">{order.customerTelefon}</div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
          <h2 className="mb-3 font-semibold text-gray-900">Ödeme</h2>
          <div className="text-sm text-gray-700">
            <div className="flex justify-between"><span>Tutar</span><span className="font-semibold text-gray-900">{formatTRY(order.total)}</span></div>
            <div className="mt-1 flex justify-between"><span>Yöntem</span><span>Kredi / Banka Kartı</span></div>
            {order.paidAt && <div className="mt-1 flex justify-between"><span>Ödeme tarihi</span><span>{order.paidAt.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul", dateStyle: "medium", timeStyle: "short" })}</span></div>}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
        <h2 className="mb-3 font-semibold text-gray-900">Ürünler</h2>
        <ul className="divide-y divide-gray-100">
          {items.map((i) => (
            <li key={i.slug} className="flex items-center gap-3 py-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={i.image} alt={i.name} className="h-12 w-12 rounded-lg bg-gray-50 object-contain" />
              <div className="min-w-0 flex-1 text-sm">
                <div className="font-medium text-gray-900">{i.name}</div>
                <div className="text-gray-500">{i.qty} adet</div>
              </div>
              <div className="text-sm font-medium">{i.price != null ? formatTRY(i.price * i.qty) : "-"}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
