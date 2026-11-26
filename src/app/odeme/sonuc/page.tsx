import Link from "next/link";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import CheckoutSteps from "@/components/CheckoutSteps";
import { resolveItems } from "@/lib/orders";
import { displayOrderNo, formatTRY, isPaidStatus } from "@/lib/orderStatus";
import { PaidEffects, PendingPoller } from "./ResultClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sipariş Sonucu", robots: { index: false } };

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP?.replace(/[^\d]/g, "") || "905555555555";

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export default async function PaymentResultPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const id = sp.siparis || "";
  const token = sp.t || "";
  const order = id
    ? await prisma.order.findUnique({ where: { id }, include: { items: true } })
    : null;
  const authorized = !!order && !!order.trackingToken && !!token && safeEqual(order.trackingToken, token);

  if (!order || !authorized) return <Unknown />;

  const items = await resolveItems(order.items);
  const no = displayOrderNo(order.id);
  const status = order.status;
  const trackUrl = `/siparis-takip/${order.trackingToken}`;
  const waText = encodeURIComponent(`Merhaba, #${no} numaralı siparişim hakkında yardım almak istiyorum.`);

  const summary = (
    <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-gray-100 pb-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-500">Sipariş No</div>
          <div className="text-lg font-bold text-gray-900">#{no}</div>
        </div>
        <div className="text-right text-sm text-gray-600">
          {order.createdAt.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul", dateStyle: "long", timeStyle: "short" })}
        </div>
      </div>
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
      <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-bold">
        <span>Toplam</span>
        <span className="text-emerald-700">{formatTRY(order.total)}</span>
      </div>
      <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
        <div className="font-medium text-gray-900">Teslimat adresi</div>
        <div>{order.customerAd} · {order.customerTelefon}</div>
        <div>{order.customerAdres}, {order.customerSehir}</div>
      </div>
    </div>
  );

  if (isPaidStatus(status)) {
    return (
      <Shell step={4}>
        <PaidEffects />
        <Icon tone="success" />
        <h1 className="mb-3 text-2xl font-bold text-gray-900 sm:text-3xl">Ödemeniz alındı, siparişiniz oluşturuldu</h1>
        <p className="text-gray-600">
          Teşekkür ederiz! Sipariş onayınızı <strong className="text-gray-900">{order.customerEmail}</strong> adresine gönderdik.
          Siparişiniz kargoya verildiğinde ayrıca bilgilendirileceksiniz.
        </p>
        {summary}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href={trackUrl} className="rounded-lg bg-emerald-700 px-6 py-3 font-semibold text-white hover:bg-emerald-800">Siparişimi Takip Et</Link>
          <Link href="/urunlerimiz" className="rounded-lg border border-emerald-700 px-6 py-3 font-semibold text-emerald-700 hover:bg-emerald-50">Alışverişe Devam Et</Link>
        </div>
      </Shell>
    );
  }

  if (status === "odeme_basarisiz") {
    return (
      <Shell step={2} failed>
        <Icon tone="error" />
        <h1 className="mb-3 text-2xl font-bold text-gray-900 sm:text-3xl">Ödeme tamamlanamadı</h1>
        <p className="text-gray-700">{order.paymentError || "Ödeme işlemi bankanız tarafından onaylanmadı."}</p>
        <div className="mx-auto mt-5 max-w-lg rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Siparişiniz <strong>oluşturulmadı</strong> ve bu işlem için kartınızdan ödeme alınmadı. Sepetiniz korunuyor; bilgilerinizi kontrol edip tekrar deneyebilir veya başka bir kart kullanabilirsiniz.
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/odeme" className="rounded-lg bg-emerald-700 px-6 py-3 font-semibold text-white hover:bg-emerald-800">Ödemeyi Tekrar Dene</Link>
          <a href={`https://wa.me/${WHATSAPP}?text=${waText}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-800 hover:bg-gray-50">WhatsApp ile Destek Al</a>
        </div>
        <p className="mt-6 text-xs text-gray-500">Referans: #{no}</p>
      </Shell>
    );
  }

  if (status === "odeme_incelemede") {
    return (
      <Shell step={2}>
        <Icon tone="pending" />
        <h1 className="mb-3 text-2xl font-bold text-gray-900 sm:text-3xl">Ödemeniz kontrol ediliyor</h1>
        <p className="text-gray-700">
          Bankadan gelen ödeme bilgisini doğruluyoruz. Lütfen tekrar ödeme yapmayın. Ekibimiz en kısa sürede <strong>{order.customerEmail}</strong> adresi veya telefon numaranız üzerinden size dönüş yapacak.
        </p>
        {summary}
        <div className="mt-8 flex justify-center">
          <a href={`https://wa.me/${WHATSAPP}?text=${waText}`} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-emerald-700 px-6 py-3 font-semibold text-white hover:bg-emerald-800">WhatsApp ile Bize Ulaşın</a>
        </div>
      </Shell>
    );
  }

  if (status === "pending") {
    return (
      <Shell step={2}>
        <Icon tone="pending" spin />
        <h1 className="mb-3 text-2xl font-bold text-gray-900 sm:text-3xl">Ödeme sonucu bekleniyor</h1>
        <p className="text-gray-700">Bankanızdan gelecek cevabı bekliyoruz. Bu sayfa kendini otomatik olarak güncelleyecek.</p>
        <PendingPoller />
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/odeme" className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-800 hover:bg-gray-50">Ödeme Sayfasına Dön</Link>
        </div>
      </Shell>
    );
  }

  // Yönetici tarafından iptal edilmiş vb.
  return (
    <Shell step={3}>
      <Icon tone="error" />
      <h1 className="mb-3 text-2xl font-bold text-gray-900">Sipariş iptal edildi</h1>
      {order.statusReason && <p className="text-gray-700">{order.statusReason}</p>}
      <div className="mt-8 flex justify-center">
        <Link href={trackUrl} className="rounded-lg bg-emerald-700 px-6 py-3 font-semibold text-white hover:bg-emerald-800">Sipariş Detayı</Link>
      </div>
    </Shell>
  );
}

function Unknown() {
  return (
    <Shell step={2}>
      <Icon tone="pending" />
      <h1 className="mb-3 text-2xl font-bold text-gray-900 sm:text-3xl">Ödeme sonucunu görüntüleyemiyoruz</h1>
      <p className="text-gray-700">
        Ödemeniz başarılı olduysa onay e-postası birkaç dakika içinde gelen kutunuza ulaşır. E-posta almadıysanız ve kartınızdan çekim yapıldıysa lütfen bizimle iletişime geçin.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/sepet" className="rounded-lg bg-emerald-700 px-6 py-3 font-semibold text-white hover:bg-emerald-800">Sepetime Dön</Link>
        <Link href="/iletisim" className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-800 hover:bg-gray-50">İletişime Geç</Link>
      </div>
    </Shell>
  );
}

function Shell({ children, step, failed = false }: { children: React.ReactNode; step: 0 | 1 | 2 | 3 | 4; failed?: boolean }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12 md:px-6">
      <CheckoutSteps current={step} failed={failed} />
      <div className="text-center">{children}</div>
    </div>
  );
}

function Icon({ tone, spin = false }: { tone: "success" | "error" | "pending"; spin?: boolean }) {
  const cls = tone === "success" ? "bg-emerald-100 text-emerald-700" : tone === "error" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700";
  return (
    <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ${cls}`} aria-hidden="true">
      {tone === "success" ? (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
      ) : tone === "error" ? (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
      ) : (
        <svg className={`h-8 w-8 ${spin ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={spin ? "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" : "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"} /></svg>
      )}
    </div>
  );
}
