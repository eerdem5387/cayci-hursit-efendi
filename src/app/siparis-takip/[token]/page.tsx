import { prisma } from "@/lib/db";
import { getProducts } from "@/lib/data";

export default async function OrderTrackPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const order = await prisma.order.findFirst({ where: { trackingToken: token }, include: { items: true } });
  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
        <h1 className="text-2xl font-bold text-gray-900">Sipariş bulunamadı</h1>
        <p className="mt-2 text-gray-600">Bağlantınız geçersiz veya süresi geçmiş olabilir.</p>
      </div>
    );
  }

  const products = await getProducts();
  const nameMap = Object.fromEntries((products as any[]).map((p: any) => [p.slug, p.name]));
  const priceMap = Object.fromEntries((products as any[]).map((p: any) => [p.slug, p.price]));
  const imageMap = Object.fromEntries((products as any[]).map((p: any) => [p.slug, Array.isArray(p.images) ? p.images[0] : undefined]));

  const steps = [
    { key: "pending", label: "Beklemede" },
    { key: "onaylandi", label: "Onaylandı" },
    { key: "kargoda", label: "Kargoda" },
    { key: "teslim_edildi", label: "Teslim Edildi" },
  ];
  const status = String(order.status || "pending");
  const currentIdx = Math.max(0, steps.findIndex((s) => s.key === status));
  const isFailed = status === "basarisiz" || status === "failed";

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-6">
      <h1 className="text-3xl font-bold text-gray-900">Sipariş Özeti</h1>

      {/* Durum zaman çizelgesi */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => {
            const active = idx <= currentIdx && !isFailed;
            return (
              <div key={step.key} className="flex-1 flex items-center">
                <div className={`h-8 w-8 shrink-0 rounded-full border-2 ${active ? "border-emerald-600 bg-emerald-600 text-white" : "border-gray-300 bg-white text-gray-600"} flex items-center justify-center text-xs font-bold`}>{idx+1}</div>
                {idx < steps.length - 1 && (
                  <div className={`mx-2 h-1 flex-1 rounded ${active ? "bg-emerald-200" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex justify-between text-sm text-gray-700">
          {steps.map((s) => (<div key={s.key}>{s.label}</div>))}
        </div>
        {isFailed && (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-800">
            <div className="font-semibold">Sipariş Durumu: Başarısız</div>
            {order as any}
            {order && (order as any).statusReason ? <div className="text-sm mt-1">Neden: {(order as any).statusReason}</div> : null}
          </div>
        )}
      </div>

      {/* Özet kutuları */}
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="text-sm text-gray-500">Sipariş No</div>
          <div className="font-semibold">{order.id}</div>
          <div className="mt-3 text-sm text-gray-500">Tarih</div>
          <div className="font-medium">{new Date(order.createdAt).toLocaleString("tr-TR")}</div>
          <div className="mt-3 text-sm text-gray-500">Durum</div>
          <div className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${isFailed ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"}`}>{status}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="text-sm text-gray-500">Toplam</div>
          <div className="text-2xl font-bold text-emerald-700">{order.total.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</div>
          <div className="mt-3 text-sm text-gray-500">Müşteri</div>
          <div className="font-medium">{order.customerAd}</div>
          <div className="text-sm text-gray-700">{order.customerEmail} · {order.customerTelefon}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="text-sm text-gray-500">Teslimat Adresi</div>
          <div className="font-medium">{order.customerAdres}</div>
          <div className="text-sm text-gray-700">{order.customerSehir}</div>
        </div>
      </div>

      {/* Ürünler */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Ürünler</h2>
        <div className="space-y-3">
          {order.items.map((i) => (
            <div key={i.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageMap[i.slug] || `/images/${i.slug}.jpg`} alt={nameMap[i.slug] || i.slug} className="h-full w-full object-contain" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{nameMap[i.slug] || i.slug}</div>
                  <div className="text-sm text-gray-600">Adet: {i.qty}</div>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-900">
                {(Number(priceMap[i.slug] || 0) * i.qty).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


