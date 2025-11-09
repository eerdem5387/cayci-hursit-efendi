"use client";
import { useEffect, useMemo, useState, use } from "react";
import Link from "next/link";

type Order = {
  id: string;
  createdAt: string;
  customer: { ad: string; email: string; adres: string; sehir: string; telefon: string };
  items: { slug: string; qty: number }[];
  status: "pending" | "paid" | "failed" | "onaylandi" | "kargoda" | "teslim_edildi" | "basarisiz";
  total?: number;
};

type Product = { id: string; name: string; slug: string; price: number; weightKg?: number | null };

export default function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [ordersRes, productsRes] = await Promise.all([
          fetch("/api/orders?page=1&pageSize=1000").then((r) => {
            if (!r.ok) throw new Error("Siparişler yüklenemedi");
            return r.json();
          }),
          fetch("/api/products").then((r) => {
            if (!r.ok) throw new Error("Ürünler yüklenemedi");
            return r.json();
          })
        ]);

        const list = Array.isArray(ordersRes) ? ordersRes : (ordersRes.items || []);
        const foundOrder = list.find((x: Order) => x.id === id) || null;
        
        if (!foundOrder) {
          setError("Sipariş bulunamadı");
        } else {
          setOrder(foundOrder);
        }
        
        setProducts(Array.isArray(productsRes) ? productsRes : []);
      } catch (err: any) {
        console.error("Sipariş detay yükleme hatası:", err);
        setError(err?.message || "Bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const updateStatus = async (status: Order["status"]) => {
    if (!order) return;
    
    let body: any = { id: order.id, status };
    if (status === "basarisiz") {
      const reason = window.prompt("Başarısız nedeni (zorunlu):");
      if (!reason || !reason.trim()) return;
      body.reason = reason.trim();
    }
    
    try {
      const res = await fetch("/api/orders", { 
        method: "PUT", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body) 
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any));
        alert(data?.error || "Durum güncellenemedi");
        return;
      }
      
      setOrder({ ...order, status });
    } catch (err) {
      console.error("Durum güncelleme hatası:", err);
      alert("Bir hata oluştu");
    }
  };

  const getProduct = (slug: string) => products.find(p => p.slug === slug);

  const totals = useMemo(() => {
    const totalQty = order?.items.reduce((a, b) => a + b.qty, 0) || 0;
    // Toplam tutarı hesapla
    const calculateTotal = () => {
      if (order?.total !== undefined && order.total !== null) {
        return order.total;
      }
      // Ürün fiyatlarından hesapla
      return order?.items.reduce((sum, item) => {
        const product = products.find(p => p.slug === item.slug);
        if (product?.price) {
          return sum + (product.price * item.qty);
        }
        return sum;
      }, 0) || 0;
    };
    return { totalQty, total: calculateTotal() };
  }, [order, products]);

  if (loading) {
    return (
      <div className="px-4 py-8 text-center">
        <div className="text-gray-500">Yükleniyor...</div>
        <div className="mt-2 text-xs text-gray-400">Sipariş bilgileri getiriliyor</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="font-semibold text-red-800">Hata</div>
          <div className="mt-1 text-sm text-red-600">{error}</div>
          <Link href="/admin/siparisler" className="mt-3 inline-block text-sm text-red-700 underline">
            Siparişler listesine dön
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="px-4 py-8 text-center">
        <div className="text-gray-500">Sipariş bulunamadı.</div>
        <Link href="/admin/siparisler" className="mt-3 inline-block text-sm text-emerald-700 underline">
          Siparişler listesine dön
        </Link>
      </div>
    );
  }

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
              const productName = product?.name || `Ürün bulunamadı (${item.slug})`;
              return (
                <div key={item.slug} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{productName}</div>
                    {!product && (
                      <div className="text-xs text-amber-600 mt-1">⚠️ Bu ürün sistemde bulunamadı</div>
                    )}
                    {product?.weightKg && (
                      <div className="text-sm text-gray-600 mt-1">{product.weightKg} kg</div>
                    )}
                  </div>
                  <div className="text-right">
                    {product?.price ? (
                      <>
                        <div className="font-medium text-gray-900">{product.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</div>
                        <div className="text-sm text-gray-600">Adet: {item.qty}</div>
                        <div className="text-sm font-medium text-emerald-700">
                          Toplam: {(product.price * item.qty).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-gray-500">Adet: {item.qty}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
            <div>
              <div className="text-sm text-gray-600">Toplam adet: {totals.totalQty}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Sipariş Tutarı</div>
              <div className="text-2xl font-bold text-emerald-700">
                {totals.total.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
              </div>
            </div>
          </div>
        </section>

        <aside className="grid gap-4">
          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-2 font-semibold">Durum</h3>
            <select className="w-full rounded border border-gray-300 px-2 py-1 text-sm" value={order.status} onChange={(e) => updateStatus(e.target.value as Order["status"]) }>
              <option value="pending">Beklemede</option>
              <option value="onaylandi">Onaylandı</option>
              <option value="kargoda">Kargoda</option>
              <option value="teslim_edildi">Teslim Edildi</option>
              <option value="basarisiz">Başarısız</option>
              <option value="paid">(Eski) Ödendi</option>
              <option value="failed">(Eski) Başarısız</option>
            </select>
            <div className="mt-2 text-xs text-gray-500">Durum değişikliğinde müşteriye otomatik e-posta gönderilir.</div>
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


