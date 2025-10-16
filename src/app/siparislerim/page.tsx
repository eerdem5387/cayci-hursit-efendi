"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";

type Order = {
  id: string;
  createdAt: string;
  customer: { ad: string; email: string; adres: string; sehir: string; telefon: string };
  items: { slug: string; qty: number }[];
  status: "pending" | "paid" | "failed";
};

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  weightKg?: number | null;
  images?: string[];
};

export default function MyOrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.email) {
      Promise.all([
        fetch("/api/orders").then(r => r.json()),
        fetch("/api/products").then(r => r.json())
      ]).then(([allOrders, allProducts]) => {
        const userOrders = allOrders.filter((order: Order) => order.customer.email === session.user?.email);
        setOrders(userOrders);
        setProducts(allProducts);
      }).finally(() => setLoading(false));
    }
  }, [session]);

  const getProduct = (slug: string) => products.find(p => p.slug === slug);

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
          <p className="text-gray-600">Siparişlerinizi görüntülemek için giriş yapmanız gerekiyor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Siparişlerim</h1>
        <p className="text-gray-600 mt-2">Tüm siparişlerinizi buradan takip edebilirsiniz</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Siparişler yükleniyor...</div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-6">Henüz sipariş vermediniz</div>
          <Link href="/urunlerimiz" className="inline-block rounded bg-emerald-700 px-6 py-3 text-white hover:bg-emerald-800">
            Alışverişe Başla
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Sipariş #{order.id.slice(-6)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString("tr-TR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                    order.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                    order.status === "paid" ? "bg-green-100 text-green-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {order.status === "pending" ? "Beklemede" :
                     order.status === "paid" ? "Ödendi" : "Başarısız"}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Sipariş Kalemleri:</h4>
                {order.items.map((item, index) => {
                  const product = getProduct(item.slug);
                  return (
                    <div key={index} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {product?.name || item.slug}
                        </div>
                        {product?.weightKg && (
                          <div className="text-sm text-gray-600">{product.weightKg} kg</div>
                        )}
                        <div className="text-sm text-gray-600">Adet: {item.qty}</div>
                      </div>
                      <div className="text-right">
                        {product?.price && (
                          <div className="font-medium text-gray-900">
                            {product.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                          </div>
                        )}
                        {product?.price && (
                          <div className="text-sm text-emerald-700">
                            Toplam: {(product.price * item.qty).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Toplam adet:</span>
                  <span>{order.items.reduce((sum, item) => sum + item.qty, 0)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
