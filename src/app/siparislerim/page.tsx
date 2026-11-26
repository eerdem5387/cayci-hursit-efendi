"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CUSTOMER_STATUS_LABELS, displayOrderNo, formatTRY, statusClass } from "@/lib/orderStatus";

type Order = {
  id: string;
  createdAt: string;
  status: string;
  total: number;
  trackingToken?: string | null;
  items: { slug: string; qty: number; name: string; price: number | null; image: string }[];
};

export default function MyOrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.email) return;
    fetch("/api/orders/mine", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => (d?.ok ? setOrders(d.items) : setError(d?.error || "Siparişler yüklenemedi")))
      .catch(() => setError("Siparişler yüklenemedi"));
  }, [session?.user?.email]);

  if (status === "loading" || (session && !orders && !error)) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="mt-8 space-y-4">{[0, 1].map((i) => <div key={i} className="h-40 animate-pulse rounded-xl bg-gray-100" />)}</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center md:px-6">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">Giriş Yapın</h1>
        <p className="mb-6 text-gray-600">Siparişlerinizi görüntülemek için giriş yapmanız gerekiyor.</p>
        <Link href="/auth/signin?callbackUrl=/siparislerim" className="rounded-lg bg-emerald-700 px-6 py-3 font-medium text-white hover:bg-emerald-800">Giriş Yap</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Siparişlerim</h1>
      <p className="mt-1 text-gray-600">Ödemesi tamamlanan siparişleriniz burada listelenir.</p>

      {error && <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}

      {orders && orders.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white py-14 text-center">
          <div className="mb-6 text-gray-600">Henüz tamamlanmış bir siparişiniz yok.</div>
          <Link href="/urunlerimiz" className="rounded-lg bg-emerald-700 px-6 py-3 font-medium text-white hover:bg-emerald-800">Alışverişe Başla</Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {orders?.map((o) => (
            <li key={o.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-gray-900">Sipariş #{displayOrderNo(o.id)}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(o.createdAt).toLocaleString("tr-TR", { dateStyle: "long", timeStyle: "short" })}
                  </div>
                </div>
                <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${statusClass(o.status)}`}>
                  {CUSTOMER_STATUS_LABELS[o.status] || o.status}
                </span>
              </div>
              <ul className="mt-4 divide-y divide-gray-100">
                {o.items.map((i) => (
                  <li key={i.slug} className="flex items-center gap-3 py-2.5">
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
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4">
                <div className="text-base font-bold text-gray-900">Toplam: <span className="text-emerald-700">{formatTRY(o.total)}</span></div>
                <Link href={`/siparis-takip/${o.trackingToken || o.id}`} className="rounded-lg border border-emerald-700 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50">
                  Siparişi Takip Et
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
