import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-[#194A33]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 md:grid-cols-4 md:px-6">
        <div>
          <div className="mb-3 items-center gap-2">
            <img src="/hursit_efendi_logo.png" alt="Hursit Efendi Logo" className="h-30 w-50" />
          </div>
          <p className="text-sm text-white">
            1983'ten bugüne gerçek çay tadı. Organik ve hijyenik üretim.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">Kurumsal</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/hakkimizda" className="text-white hover:text-emerald-700">Hakkımızda</Link></li>
            <li><Link href="/referanslarimiz" className="text-white hover:text-emerald-700">Referanslarımız</Link></li>
            <li><Link href="/sss" className="text-white hover:text-emerald-700">S.S.S.</Link></li>
            <li><Link href="/iletisim" className="text-white hover:text-emerald-700">İletişim</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">Ürünler</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/urunlerimiz" className="text-white hover:text-emerald-700">Tüm Ürünler</Link></li>
            <li><Link href="/urunlerimiz?marka=sakaoglu" className="text-white hover:text-emerald-700">Sakaoğlu</Link></li>
            <li><Link href="/urunlerimiz?marka=hursit-efendi" className="text-white hover:text-emerald-700">Çaycı Hurşit Efendi</Link></li>
            <li><Link href="/urunlerimiz?marka=sakahve" className="text-white hover:text-emerald-700">Sakahve</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">Yasal</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/gizlilik-politikasi" className="text-white hover:text-emerald-700">Gizlilik Politikası</Link></li>
            <li><Link href="/mesafeli-satis-sozlesmesi" className="text-white hover:text-emerald-700">Mesafeli Satış Sözleşmesi</Link></li>
            <li><Link href="/kvkk-aydinlatma-metni" className="text-white hover:text-emerald-700">KVKK Aydınlatma Metni</Link></li>
            <li><Link href="/iade-iptal-kosullari" className="text-white hover:text-emerald-700">İade ve İptal Koşulları</Link></li>
          </ul>
          <div className="mt-4">
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP?.replace(/[^\d]/g, "") || "905555555555"}?text=${encodeURIComponent("Merhaba, destek almak istiyorum.")}`}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/images/whatsapp.svg" alt="WhatsApp" className="h-4 w-4" /> WhatsApp Destek
            </a>
            <div className="mt-1 text-xs text-emerald-100">{process.env.NEXT_PUBLIC_WHATSAPP || "+90 555 555 55 55"}</div>
          </div>
        </div>
      </div>
      <div className="border-t text-white bg-gray-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 text-xs text-gray-600 md:px-6">
          <span>© {new Date().getFullYear()} Developed by Framio Agency</span>
          <span>Ziraat Bankası Sanal POS ile güvenli ödeme</span>
        </div>
      </div>
    </footer>
  );
}


