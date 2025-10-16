"use client";
import { useEffect, useMemo, useState, use } from "react";
import Link from "next/link";

type Order = {
  id: string;
  createdAt: string;
  customer: { ad: string; email: string; adres: string; sehir: string; telefon: string };
  items: { slug: string; qty: number }[];
  status: "pending" | "paid" | "failed";
};

type Product = { id: string; name: string; slug: string; price: number; weightKg?: number | null };

export default function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/orders").then((r) => r.json()).then((list: Order[]) => {
        const o = list.find((x) => x.id === id) || null;
        setOrder(o);
      }),
      fetch("/api/products").then((r) => r.json()).then(setProducts)
    ]).then(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status: Order["status"]) => {
    if (!order) return;
    await fetch("/api/orders", { method: "PUT", body: JSON.stringify({ id: order.id, status }) });
    setOrder({ ...order, status });
  };

  const getProduct = (slug: string) => products.find(p => p.slug === slug);

  const totals = useMemo(() => {
    // Basit toplam: adet toplamı; fiyatlar müşteri mailinde hesaplanıyor, burada yok.
    const totalQty = order?.items.reduce((a, b) => a + b.qty, 0) || 0;
    return { totalQty };
  }, [order]);

  if (loading) return <div className="px-4">Yükleniyor...</div>;
  if (!order) return <div className="px-4">Sipariş bulunamadı.</div>;

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Sipariş #{order.id}</h1>
        <Link href="/admin/siparisler" className="text-sm text-emerald-700">Geri dön</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded-lg border border-gray-200 bg-white p-4 md:col-span-2">
          <h2 className="mb-4 font-semibold">Sipariş Kalemleri</h2>
          <div className="space-y-3">
            {order.items.map((item) => {
              const product = getProduct(item.slug);
              return (
                <div key={item.slug} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{product?.name || item.slug}</div>
                    {product?.weightKg && (
                      <div className="text-sm text-gray-600">{product.weightKg} kg</div>
                    )}
                  </div>
                  <div className="text-right">
                    {product?.price && (
                      <div className="font-medium text-gray-900">{product.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</div>
                    )}
                    <div className="text-sm text-gray-600">Adet: {item.qty}</div>
                    {product?.price && (
                      <div className="text-sm font-medium text-emerald-700">
                        Toplam: {(product.price * item.qty).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-sm text-gray-600">Toplam adet: {totals.totalQty}</div>
        </section>

        <aside className="grid gap-4">
          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-2 font-semibold">Durum</h3>
            <select className="w-full rounded border border-gray-300 px-2 py-1 text-sm" value={order.status} onChange={(e) => updateStatus(e.target.value as Order["status"]) }>
              <option value="pending">Beklemede</option>
              <option value="paid">Ödendi</option>
              <option value="failed">Başarısız</option>
            </select>
            <div className="mt-2 text-xs text-gray-500">Otomatik e-posta gönderimi bu sayfada yapılmaz.</div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-2 font-semibold">Müşteri</h3>
            <div className="text-sm">
              <div>{order.customer.ad}</div>
              <div className="text-gray-600">{order.customer.email} – {order.customer.telefon}</div>
              <div className="mt-1 text-gray-700">{order.customer.adres}, {order.customer.sehir}</div>
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-2 font-semibold">İç Notlar</h3>
            <textarea className="w-full rounded border border-gray-300 px-2 py-1 text-sm" rows={4} placeholder="Sadece iç kullanım için" value={note} onChange={(e) => setNote(e.target.value)} />
            <div className="mt-1 text-xs text-gray-500">Notlar şu an geçici olarak tutulur.</div>
          </section>
        </aside>
      </div>
    </div>
  );
}


