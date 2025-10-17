import { prisma } from "@/lib/db";

export default async function OrderTrackPage({ params }: { params: { token: string } }) {
  const order = await prisma.order.findFirst({ where: { trackingToken: params.token } });
  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
        <h1 className="text-2xl font-bold text-gray-900">Sipariş bulunamadı</h1>
        <p className="mt-2 text-gray-600">Bağlantınız geçersiz veya süresi geçmiş olabilir.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <h1 className="text-2xl font-bold text-gray-900">Sipariş Özeti</h1>
      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6">
        <div className="text-sm text-gray-600">Sipariş No: {order.id}</div>
        <div className="text-sm text-gray-600">Durum: {order.status}</div>
        <div className="text-sm text-gray-600">Toplam: {order.total.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</div>
        <div className="mt-4 text-sm text-gray-700">Teslimat Adresi: {order.customerAdres}, {order.customerSehir}</div>
      </div>
    </div>
  );
}


