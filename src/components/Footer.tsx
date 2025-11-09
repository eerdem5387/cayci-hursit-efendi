import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-[#194A33]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-2 md:grid-cols-4 md:gap-8 md:px-6 md:py-10">
        <div className="sm:col-span-2 md:col-span-1">
          <div className="mb-5 sm:mb-6 flex items-center gap-2">
            <img src="/hursit_efendi_logo.png" alt="Hursit Efendi Logo" className="h-16 w-auto sm:h-20 md:h-24 lg:h-28 drop-shadow" />
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-white/90">
            1983'ten bugüne gerçek çay tadı. Organik ve hijyenik üretim.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-white">Kurumsal</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/hakkimizda" className="block text-white/90 hover:text-emerald-300 transition-colors touch-manipulation py-1">Hakkımızda</Link></li>
            <li><Link href="/referanslarimiz" className="block text-white/90 hover:text-emerald-300 transition-colors touch-manipulation py-1">Referanslarımız</Link></li>
            <li><Link href="/sss" className="block text-white/90 hover:text-emerald-300 transition-colors touch-manipulation py-1">S.S.S.</Link></li>
            <li><Link href="/iletisim" className="block text-white/90 hover:text-emerald-300 transition-colors touch-manipulation py-1">İletişim</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-white">Ürünler</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/urunlerimiz" className="block text-white/90 hover:text-emerald-300 transition-colors touch-manipulation py-1">Tüm Ürünler</Link></li>
            <li><Link href="/urunlerimiz?marka=sakaoglu" className="block text-white/90 hover:text-emerald-300 transition-colors touch-manipulation py-1">Sakaoğlu</Link></li>
            <li><Link href="/urunlerimiz?marka=hursit-efendi" className="block text-white/90 hover:text-emerald-300 transition-colors touch-manipulation py-1">Çaycı Hurşit Efendi</Link></li>
            <li><Link href="/urunlerimiz?marka=sakahve" className="block text-white/90 hover:text-emerald-300 transition-colors touch-manipulation py-1">Sakahve</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-white">Yasal</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/gizlilik-politikasi" className="block text-white/90 hover:text-emerald-300 transition-colors touch-manipulation py-1">Gizlilik Politikası</Link></li>
            <li><Link href="/mesafeli-satis-sozlesmesi" className="block text-white/90 hover:text-emerald-300 transition-colors touch-manipulation py-1">Mesafeli Satış Sözleşmesi</Link></li>
            <li><Link href="/kvkk-aydinlatma-metni" className="block text-white/90 hover:text-emerald-300 transition-colors touch-manipulation py-1">KVKK Aydınlatma Metni</Link></li>
            <li><Link href="/iade-iptal-kosullari" className="block text-white/90 hover:text-emerald-300 transition-colors touch-manipulation py-1">İade ve İptal Koşulları</Link></li>
          </ul>
          <div className="mt-4">
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP?.replace(/[^\d]/g, "") || "905555555555"}?text=${encodeURIComponent("Merhaba, destek almak istiyorum.")}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors touch-manipulation w-full sm:w-auto"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/images/whatsapp.svg" alt="WhatsApp" className="h-5 w-5" /> WhatsApp Destek
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 bg-[#194A33]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <span>© {new Date().getFullYear()} Developed by Framio Agency</span>
          <span className="text-white/60">Ziraat Bankası Sanal POS ile güvenli ödeme</span>
        </div>
      </div>
    </footer>
  );
}


