export const metadata = { title: "Referanslarımız" };

type RefItem = { name: string; logo: string };

const references: RefItem[] = [
  { name: "Dilek", logo: "/Adsiz-tasarim-3-241x300.png" },
  { name: "Big Mamas", logo: "/Adsiz-tasarim-2-241x300.png" },
  { name: "Focaccia", logo: "/Adsiz-tasarim-4-241x300.png" },
  { name: "Köşebaşı", logo: "/Adsiz-tasarim-5-241x300.png" },
  { name: "Faruk Güllüoğlu", logo: "/Adsiz-tasarim-6-241x300.png" },
  { name: "Et Yiyelim", logo: "/Adsiz-tasarim-7-241x300.png" },
];

export default function ReferencesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <blockquote className="mx-auto max-w-4xl text-center text-2xl font-extrabold leading-tight text-emerald-900 md:text-4xl">
        “Yıllar içinde kalite, güven ve sürdürülebilirlik ilkelerimizle yanımızda olan iş ortaklarımızla çalışmaktan gurur duyuyor, bu güvenin bize yüklediği sorumluluğu her geçen gün daha büyük bir titizlikle taşıyoruz.”
      </blockquote>
      <div className="mt-2 text-center text-xs tracking-widest text-emerald-700/70">REFERANSLARIMIZ</div>

      <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
        {references.map((item) => (
          <div key={item.name} className="group relative aspect-square rounded-2xl border border-gray-200 bg-white p-6">
            <img src={item.logo} alt={item.name} className="mx-auto h-full w-auto object-contain opacity-90 transition-transform duration-200 group-hover:scale-105" />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-emerald-700/0 px-3 py-1 text-sm font-semibold text-white opacity-0 transition-all duration-200 group-hover:bg-emerald-700/90 group-hover:opacity-100">{item.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


