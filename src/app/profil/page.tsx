"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { CUSTOMER_STATUS_LABELS, displayOrderNo, statusClass } from "@/lib/orderStatus";

type Order = {
  id: string;
  createdAt: string;
  customer: { ad: string; email: string; adres: string; sehir: string; telefon: string };
  items: { slug: string; qty: number; name?: string }[];
  status: string;
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.email) {
      fetch("/api/orders/mine", { cache: "no-store" })
        .then(r => r.json())
        .then((d) => setOrders(Array.isArray(d?.items) ? d.items : []))
        .catch(() => setOrders([]))
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
        <div className="text-center">Yükleniyor...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Giriş Yapın</h1>
          <p className="text-gray-600">Profilinizi görüntülemek için giriş yapmanız gerekiyor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profilim</h1>
        <p className="text-gray-600 mt-2">Hesap bilgileriniz ve sipariş geçmişiniz</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Hesap Bilgileri</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Ad Soyad</label>
                <p className="text-gray-900">{session.user?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">E-posta</label>
                <p className="text-gray-900">{session.user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Üyelik Tarihi</label>
                <p className="text-gray-900">
                  {new Date().toLocaleDateString("tr-TR")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Sipariş Geçmişi</h2>
            
            {loading ? (
              <div className="text-center py-8">Yükleniyor...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">Henüz sipariş vermediniz</div>
                <a href="/urunlerimiz" className="inline-block rounded bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800">
                  Alışverişe Başla
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-medium text-gray-900">Sipariş #{displayOrderNo(order.id)}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(order.status)}`}>
                          {CUSTOMER_STATUS_LABELS[order.status] || order.status}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{item.name || item.slug}</span>
                          <span className="text-gray-500">Adet: {item.qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
