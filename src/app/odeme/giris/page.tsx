import Link from "next/link";

export const metadata = { title: "Ödeme - Giriş" };

export default function CheckoutEntryPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Alışverişe Devam</h1>
      <p className="mb-8 text-gray-700">
        Üye olmadan da sipariş verebilirsiniz. Üye olursanız sipariş geçmişinizi kolayca görüntüleyebilirsiniz.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Üye olarak devam et</h2>
          <p className="mb-4 text-sm text-gray-600">Hesabınıza giriş yaparak adreslerinizi ve siparişlerinizi yönetin.</p>
          <Link href="/auth/signin?callbackUrl=/odeme" className="inline-block rounded-lg bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800">
            Giriş Yap / Kayıt Ol
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Üye olmadan devam et</h2>
          <p className="mb-4 text-sm text-gray-600">E‑posta adresinizle sipariş verin. Sipariş durumunu e‑posta ile takip edersiniz.</p>
          <Link href="/odeme" className="inline-block rounded-lg border border-emerald-700 px-4 py-2 text-emerald-700 hover:bg-emerald-50">
            Üye Olmadan Devam Et
          </Link>
          <p className="mt-3 text-xs text-gray-500">Not: Üye olmadan verdiğiniz siparişler hesabınızda listelenmez.</p>
        </div>
      </div>
    </div>
  );
}


