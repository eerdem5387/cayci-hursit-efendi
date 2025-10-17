import Link from "next/link";

export default function ThankYouPage({ searchParams }: { searchParams?: Promise<{ guest?: string; oid?: string }> }) {
  const spPromise = searchParams || Promise.resolve({});
  // Not using suspense; simple hydration-safe
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center md:px-6">
      <h1 className="text-3xl font-extrabold text-emerald-900">Siparişiniz Alındı</h1>
      <p className="mt-3 text-gray-700">Sipariş onayı e‑postanıza gönderildi.</p>
      <div className="mt-8">
        <Link href="/" className="rounded-lg bg-emerald-700 px-5 py-2 text-white hover:bg-emerald-800">Anasayfaya Dön</Link>
      </div>
      <div className="mt-6 text-sm text-gray-600">
        Üye olmadan verdiyseniz, e‑postanızdaki bağlantıdan siparişinizi takip edebilirsiniz.
      </div>
    </div>
  );
}

import Link from "next/link";

export default function ThanksPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 md:px-6">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="mb-4 text-3xl font-bold text-gray-900">Siparişiniz Alındı!</h1>
        <p className="mb-8 text-lg text-gray-600">
          Siparişiniz başarıyla oluşturuldu. En kısa sürede işleme koyacağız ve size e-posta ile bilgi vereceğiz.
        </p>
        
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Sipariş Detayları</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Sipariş Numarası:</span>
              <span className="font-medium text-gray-900">#{Date.now().toString().slice(-6)}</span>
            </div>
            <div className="flex justify-between">
              <span>Sipariş Tarihi:</span>
              <span className="font-medium text-gray-900">{new Date().toLocaleDateString("tr-TR")}</span>
            </div>
            <div className="flex justify-between">
              <span>Durum:</span>
              <span className="font-medium text-emerald-700">Onay Bekliyor</span>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <p className="text-sm text-gray-600">
            Siparişinizle ilgili güncellemeleri e-posta adresinize göndereceğiz. 
            Sorularınız için bizimle iletişime geçebilirsiniz.
          </p>
          
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link 
              href="/urunlerimiz" 
              className="inline-flex items-center justify-center rounded-lg border border-emerald-700 bg-transparent px-6 py-3 text-emerald-700 hover:bg-emerald-50"
            >
              Alışverişe Devam Et
            </Link>
            <Link 
              href="/iletisim" 
              className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-6 py-3 text-white hover:bg-emerald-800"
            >
              İletişime Geç
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


