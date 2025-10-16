"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type KPI = { 
  products: number; 
  brands: number; 
  orders: number; 
  lowStock: number; 
  totalRevenue: number;
  paidOrders: number;
  pendingOrders: number;
  failedOrders: number;
  recent: { 
    id: string; 
    createdAt: string; 
    status: string;
    total: number;
    customerName: string;
  }[];
  popularProducts: {
    id: string;
    name: string;
    sales: number;
  }[];
};

export default function AdminHome() {
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/admin/brands").then((r) => r.json()),
      fetch("/api/orders?page=1&pageSize=1000").then((r) => r.json()),
    ]).then(([products, brands, ordersRes]) => {
      const orders = Array.isArray(ordersRes) ? ordersRes : (ordersRes.items || []);
      const lowStock = (products as any[]).filter((p) => {
        // Sadece stok değeri girilmiş ve 5 veya altında olan ürünler düşük stoklu
        return p.stock !== null && p.stock !== undefined && p.stock <= 5;
      }).length;
      const totalRevenue = (orders as any[]).reduce((sum, order) => {
        // Sadece 'paid' durumundaki siparişlerin gelirini hesapla
        return order.status === 'paid' ? sum + (order.total || 0) : sum;
      }, 0);
      
      // Sipariş durumu istatistikleri
      const paidOrders = (orders as any[]).filter((o: any) => o.status === 'paid').length;
      const pendingOrders = (orders as any[]).filter((o: any) => o.status === 'pending').length;
      const failedOrders = (orders as any[]).filter((o: any) => o.status === 'failed').length;
      
      const recent = (orders as any[])
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        .slice(0, 5)
        .map((o) => ({ 
          id: o.id, 
          createdAt: o.createdAt,
          status: o.status || 'Onay Bekliyor',
          total: o.total || 0,
          customerName: o.customerName || 'Müşteri'
        }));

      // Popüler ürünler (satış sayısına göre)
      const productSales = (orders as any[]).reduce((acc: any, order: any) => {
        if (order.items) {
          order.items.forEach((item: any) => {
            const product = products.find((p: any) => p.slug === item.slug);
            if (product) {
              acc[product.id] = (acc[product.id] || 0) + item.qty;
            }
          });
        }
        return acc;
      }, {});

      const popularProducts = Object.entries(productSales)
        .map(([id, sales]) => {
          const product = products.find((p: any) => p.id === id);
          return product ? { id, name: product.name, sales: sales as number } : null;
        })
        .filter(Boolean)
        .sort((a: any, b: any) => b.sales - a.sales)
        .slice(0, 3);

      setKpi({ 
        products: products.length, 
        brands: brands.length, 
        orders: orders.length, 
        lowStock, 
        totalRevenue,
        paidOrders,
        pendingOrders,
        failedOrders,
        recent,
        popularProducts: popularProducts as any[]
      });
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Genel Bakış</h1>
        <div className="text-sm text-gray-500">
          Son güncelleme: {new Date().toLocaleString("tr-TR")}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Toplam Ürün</p>
              <p className="text-3xl font-bold">{kpi?.products ?? 0}</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-lg p-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
          </div>
          <Link href="/admin/urunler" className="text-blue-100 text-sm hover:text-white transition-colors">
            Ürünleri Görüntüle →
          </Link>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Toplam Sipariş</p>
              <p className="text-3xl font-bold">{kpi?.orders ?? 0}</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-lg p-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
            </div>
          </div>
          <Link href="/admin/siparisler" className="text-green-100 text-sm hover:text-white transition-colors">
            Siparişleri Görüntüle →
          </Link>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Toplam Gelir</p>
              <p className="text-3xl font-bold">
                {kpi?.totalRevenue?.toLocaleString("tr-TR", { style: "currency", currency: "TRY" }) ?? "₺0"}
              </p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 rounded-lg p-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Düşük Stok</p>
              <p className="text-3xl font-bold">{kpi?.lowStock ?? 0}</p>
            </div>
            <div className="bg-red-400 bg-opacity-30 rounded-lg p-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          {(kpi?.lowStock ?? 0) > 0 && (
            <Link href="/admin/urunler" className="text-red-100 text-sm hover:text-white transition-colors">
              Stok Kontrolü →
            </Link>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Son Siparişler */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Son Siparişler</h3>
            <Link href="/admin/siparisler" className="text-blue-600 text-sm hover:text-blue-800">
              Tümünü Görüntüle
            </Link>
          </div>
          <div className="space-y-3">
            {(kpi?.recent || []).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">#{order.id}</div>
                  <div className="text-sm text-gray-600">{order.customerName}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleString("tr-TR")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {order.total.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'paid' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status === 'paid' ? 'Ödendi' :
                     order.status === 'pending' ? 'Beklemede' :
                     order.status === 'failed' ? 'Başarısız' :
                     order.status}
                  </div>
                </div>
              </div>
            ))}
            {(!kpi?.recent || kpi.recent.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                Henüz sipariş bulunmuyor
              </div>
            )}
          </div>
        </div>

        {/* Popüler Ürünler */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Popüler Ürünler</h3>
            <Link href="/admin/urunler" className="text-blue-600 text-sm hover:text-blue-800">
              Tümünü Görüntüle
            </Link>
          </div>
          <div className="space-y-3">
            {(kpi?.popularProducts || []).map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">#{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 truncate">{product.name}</div>
                    <div className="text-sm text-gray-600">{product.sales} adet satıldı</div>
                  </div>
                </div>
              </div>
            ))}
            {(!kpi?.popularProducts || kpi.popularProducts.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                Henüz satış verisi bulunmuyor
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sipariş Durumu Özeti */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Durumu Özeti</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <div className="text-sm text-green-600 font-medium">Ödenen Siparişler</div>
              <div className="text-2xl font-bold text-green-700">{kpi?.paidOrders ?? 0}</div>
            </div>
            <div className="bg-green-100 rounded-lg p-2">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
            <div>
              <div className="text-sm text-yellow-600 font-medium">Bekleyen Siparişler</div>
              <div className="text-2xl font-bold text-yellow-700">{kpi?.pendingOrders ?? 0}</div>
            </div>
            <div className="bg-yellow-100 rounded-lg p-2">
              <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <div className="text-sm text-red-600 font-medium">Başarısız Siparişler</div>
              <div className="text-2xl font-bold text-red-700">{kpi?.failedOrders ?? 0}</div>
            </div>
            <div className="bg-red-100 rounded-lg p-2">
              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Hızlı Erişim */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı Erişim</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Link href="/admin/urunler/yeni" className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <div className="bg-blue-500 rounded-lg p-2">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-gray-900">Yeni Ürün</div>
              <div className="text-sm text-gray-600">Ürün ekle</div>
            </div>
          </Link>

          <Link href="/admin/markalar" className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <div className="bg-green-500 rounded-lg p-2">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-gray-900">Marka Yönetimi</div>
              <div className="text-sm text-gray-600">Markaları düzenle</div>
            </div>
          </Link>

          <Link href="/admin/ayarlar" className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <div className="bg-purple-500 rounded-lg p-2">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-gray-900">Ayarlar</div>
              <div className="text-sm text-gray-600">Sistem ayarları</div>
            </div>
          </Link>

          <Link href="/admin/anasayfa" className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
            <div className="bg-orange-500 rounded-lg p-2">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-gray-900">Anasayfa</div>
              <div className="text-sm text-gray-600">İçerik yönetimi</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}


