import Link from "next/link";
import { auth } from "@/lib/auth";
import { getDashboard } from "@/lib/dashboard";
import RevenueChart from "@/components/admin/RevenueChart";
import { ADMIN_STATUS_LABELS, displayOrderNo, formatTRY, statusClass, timeAgo } from "@/lib/orderStatus";

export const dynamic = "force-dynamic";

const fmt0 = (n: number) => n.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

function waNumber(phone: string) {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("0")) d = "9" + d;
  else if (d.length === 10) d = "90" + d;
  return d;
}

function Change({ now, prev }: { now: number; prev: number }) {
  if (!prev) return now ? <span className="text-xs text-gray-500">geçen ay aynı dönemde satış yok</span> : null;
  const pct = Math.round(((now - prev) / prev) * 100);
  const up = pct >= 0;
  return (
    <span className={`text-xs font-medium ${up ? "text-emerald-700" : "text-red-600"}`}>
      {up ? "▲" : "▼"} %{Math.abs(pct)} <span className="font-normal text-gray-500">geçen ayın aynı dönemine göre</span>
    </span>
  );
}

export default async function AdminHome() {
  const [d, session] = await Promise.all([getDashboard(), auth()]);
  const name = String(session?.user?.name || "").split(" ")[0];
  const hour = Number(new Date().toLocaleString("en-GB", { hour: "2-digit", hour12: false, timeZone: "Europe/Istanbul" }));
  const greet = hour < 6 ? "İyi geceler" : hour < 12 ? "Günaydın" : hour < 18 ? "İyi günler" : "İyi akşamlar";
  const todoTotal = d.todo.toPrepare + d.todo.toShip + d.todo.review;

  const todos = [
    { n: d.todo.toPrepare, label: "Hazırlanacak sipariş", sub: "Ödemesi alındı, paketlenmeyi bekliyor", href: "/admin/siparisler?sekme=yeni", tone: "amber" },
    { n: d.todo.toShip, label: "Kargoya verilecek", sub: "Hazırlanıyor, takip no bekliyor", href: "/admin/siparisler?sekme=hazirlaniyor", tone: "emerald" },
    { n: d.todo.review, label: "Ödeme incelemesi", sub: "Banka panelinden kontrol edin", href: "/admin/siparisler?sekme=inceleme", tone: "violet" },
    { n: d.todo.inTransit, label: "Yolda", sub: "Teslim edilince işaretleyin", href: "/admin/siparisler?sekme=kargoda", tone: "blue" },
  ];
  const toneCls: Record<string, string> = {
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    violet: "border-violet-200 bg-violet-50 text-violet-900",
    blue: "border-blue-200 bg-blue-50 text-blue-900",
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
      {/* Karşılama */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{greet}{name ? `, ${name}` : ""}</h1>
        <p className="text-sm text-gray-600">
          {new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Istanbul" })}
          {" · "}
          {todoTotal > 0 ? <>İlgilenmeniz gereken <strong className="text-gray-900">{todoTotal} sipariş</strong> var.</> : "Bekleyen iş yok, her şey yolunda."}
        </p>
      </div>

      {/* Yapılacaklar */}
      <section aria-label="Yapılacaklar" className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3 lg:grid-cols-4">
        {todos.map((t) => {
          const active = t.n > 0;
          return (
            <Link key={t.label} href={t.href}
              className={`group min-w-0 rounded-xl border p-4 transition-shadow hover:shadow-md ${active ? toneCls[t.tone] : "border-gray-200 bg-white text-gray-500"}`}>
              <div className="flex items-baseline justify-between">
                <span className={`text-3xl font-bold tabular-nums ${active ? "" : "text-gray-300"}`}>{t.n}</span>
                <span className="text-sm opacity-60 transition-transform group-hover:translate-x-0.5">→</span>
              </div>
              <div className={`mt-1 text-sm font-semibold ${active ? "" : "text-gray-600"}`}>{t.label}</div>
              <div className="text-xs opacity-75">{t.sub}</div>
            </Link>
          );
        })}
      </section>

      {/* Satış özeti */}
      <section aria-label="Satış özeti" className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3 lg:grid-cols-4">
        <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Bugün</div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-gray-900">{fmt0(d.today.revenue)}</div>
          <div className="truncate text-xs text-gray-500">{d.today.count} sipariş · dün {fmt0(d.yesterday.revenue)}</div>
        </div>
        <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Son 7 gün</div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-gray-900">{fmt0(d.last7.revenue)}</div>
          <div className="text-xs text-gray-500">{d.last7.count} sipariş</div>
        </div>
        <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Bu ay</div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-gray-900">{fmt0(d.month.revenue)}</div>
          <div className="text-xs text-gray-500">{d.month.count} sipariş</div>
          <div className="mt-1"><Change now={d.month.revenue} prev={d.prevMonthSame.revenue} /></div>
        </div>
        <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Ortalama sepet</div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-gray-900">{fmt0(d.avgBasket)}</div>
          <div className="text-xs text-gray-500">son 30 gün · {d.last30.count} sipariş</div>
        </div>
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-3">
        <section className="rounded-xl border border-gray-200 bg-white p-5 xl:col-span-2">
          <RevenueChart days={d.days} />
        </section>

        {/* Ödeme dönüşümü */}
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-900">Ödeme başarısı · 30 gün</h2>
          {d.conversion === null ? (
            <p className="mt-2 text-sm text-gray-500">Henüz ödeme denemesi yok.</p>
          ) : (
            <>
              <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
                <span className="text-3xl font-bold tabular-nums text-gray-900">%{Math.round(d.conversion * 100)}</span>
                <span className="text-sm text-gray-500">{d.paidCustomerCount} / {d.triedCount} müşteri ödemeyi tamamladı</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100" role="img" aria-label={`Yüzde ${Math.round(d.conversion * 100)}`}>
                <div className="h-full rounded-full bg-emerald-600" style={{ width: `${Math.round(d.conversion * 100)}%` }} />
              </div>
              <p className="mt-3 text-xs text-gray-500">Ödeme sayfasına gelip kartla ödemeyi tamamlayan müşterilerin oranı. Düşükse aşağıdaki listeden müşterilere ulaşabilirsiniz.</p>
            </>
          )}
        </section>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-2">
        {/* Son siparişler */}
        <section className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
            <h2 className="font-semibold text-gray-900">Son siparişler</h2>
            <Link href="/admin/siparisler?sekme=tumu" className="text-sm font-medium text-emerald-700 hover:underline">Tümü →</Link>
          </div>
          {d.recent.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-gray-500">Henüz sipariş yok.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {d.recent.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/siparisler/${o.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-mono font-semibold text-gray-900">#{displayOrderNo(o.id)}</span>
                        <span className="truncate text-gray-700">{o.customerAd}</span>
                      </div>
                      <div className="truncate text-xs text-gray-500">{o.summary} · {timeAgo(o.createdAt)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold tabular-nums text-gray-900">{formatTRY(o.total)}</div>
                      <span className={`mt-0.5 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusClass(o.status)}`}>{ADMIN_STATUS_LABELS[o.status] || o.status}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* En çok satanlar */}
        <section className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-3">
            <h2 className="font-semibold text-gray-900">En çok satanlar · 30 gün</h2>
          </div>
          {d.topProducts.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-gray-500">Son 30 günde satış yok.</p>
          ) : (
            <ul className="grid gap-3 px-5 py-4">
              {d.topProducts.map((p, i) => {
                const maxQty = d.topProducts[0].qty || 1;
                return (
                  <li key={p.name}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate text-gray-900"><span className="mr-1.5 text-gray-400">{i + 1}.</span>{p.name}</span>
                      <span className="shrink-0 tabular-nums text-gray-700"><strong>{p.qty}</strong> adet · {fmt0(p.revenue)}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-emerald-600" style={{ width: `${(p.qty / maxQty) * 100}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-2">
        {/* Ödemesi tamamlanmayan müşteriler */}
        <section className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-3">
            <h2 className="font-semibold text-gray-900">Ödemesi tamamlanmayan müşteriler</h2>
            <p className="text-xs text-gray-500">Son 14 günde ödeme sayfasına gelip ödemeyi tamamlamayan ve sonra da sipariş vermeyenler. Bir mesajla satışı kurtarabilirsiniz.</p>
          </div>
          {d.lostCustomers.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-gray-500">Kaçan müşteri yok 👍</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {d.lostCustomers.map((c) => (
                <li key={c.id} className="flex items-center gap-2 px-5 py-3">
                  <Link href={`/admin/siparisler/${c.id}`} className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-gray-900">{c.name} <span className="font-normal text-gray-500">· {c.city}</span></div>
                    <div className="truncate text-xs text-gray-500" title={c.reason || ""}>{formatTRY(c.total)} · {timeAgo(c.createdAt)}{c.reason ? ` · ${c.reason}` : ""}</div>
                  </Link>
                  <a href={`https://wa.me/${waNumber(c.phone)}?text=${encodeURIComponent(`Merhaba ${c.name}, Çaycı Hurşit Efendi'den yazıyoruz. Sitemizdeki siparişinizin ödemesi tamamlanamamış görünüyor; yardımcı olmamızı ister misiniz?`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="shrink-0 rounded-lg border border-emerald-600 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">WhatsApp</a>
                  <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="shrink-0 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">Ara</a>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Stok + hızlı erişim */}
        <div className="grid grid-cols-[minmax(0,1fr)] content-start gap-5">
          <section className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
              <h2 className="font-semibold text-gray-900">Azalan stok</h2>
              <Link href="/admin/urunler" className="text-sm font-medium text-emerald-700 hover:underline">Ürünler →</Link>
            </div>
            {d.lowStock.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-gray-500">Stoğu azalan ürün yok.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {d.lowStock.map((p) => (
                  <li key={p.id}>
                    <Link href={`/admin/urunler/${p.id}`} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm hover:bg-gray-50">
                      <span className="truncate text-gray-900">{p.name}</span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${p.stock === 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"}`}>
                        {p.stock === 0 ? "Tükendi" : `${p.stock} adet`}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3">
            {[
              { href: "/admin/urunler/yeni", label: "Yeni ürün ekle" },
              { href: "/admin/urunler", label: "Fiyat ve stok düzenle" },
              { href: "/admin/anasayfa", label: "Anasayfa içerikleri" },
              { href: "/admin/ayarlar", label: "Ayarlar ve POS logları" },
            ].map((q) => (
              <Link key={q.href} href={q.href} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 hover:border-emerald-300 hover:bg-emerald-50/50">
                {q.label} <span className="text-gray-400">→</span>
              </Link>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
