import Link from "next/link";
import Image from "next/image";
import { getBrands, getHome, getProducts } from "@/lib/data";

export function PopularTeas() {
  const products = getProducts();
  const popular = products.filter((p) => p.popular === true);
  return (
    <section className="mx-auto mt-16 max-w-7xl px-4 md:px-6">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Popüler Çaylarımız</h2>
        <Link href="/urunlerimiz" className="rounded-md border border-emerald-600 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50">Tümünü Gör</Link>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {popular.map((p) => (
          <Link key={p.id} href={`/urun/${p.slug}`} className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
            <div className="aspect-square flex items-center justify-center bg-gray-100">
              <Image 
                src={(p as any)?.images?.[0] || `/images/${p.slug}.jpg`} 
                alt={p.name} 
                width={394} 
                height={394} 
                sizes="(max-width: 768px) 100vw, 50vw" 
                className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105" 
              />
            </div>
            <div className="p-6">
              <div className="text-lg font-semibold text-gray-900">{p.name}</div>
              <div className="text-xl font-bold text-emerald-700">{p.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</div>
              {p.weightKg && (
                <div className="mt-1 text-sm text-gray-600">{p.weightKg} kg</div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function Brands() {
  const brands = getBrands();
  return (
    <section className="mx-auto mt-16 max-w-7xl px-4 md:px-6">
      <h2 className="mb-6 text-3xl font-bold text-gray-900">Markalarımız</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {brands.map((b) => (
          <Link key={b.id} href={`/urunlerimiz?marka=${b.slug}`} className="group relative block overflow-hidden rounded-3xl">
            <div className="relative aspect-square w-full">
              <Image
                src={`/brands/${b.slug}.jpg`}
                alt={b.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                priority={false}
              />
              <div className="absolute bottom-3 left-3">
                <span className="inline-flex items-center gap-1 rounded-xl border border-white/80 bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-900 backdrop-blur group-hover:bg-white">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                  İnceleyin
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function AboutTeaser() {
  return (
    <section className="mx-auto mt-16 max-w-7xl px-4 md:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-[#F1EEEA]">
        <div className="grid items-center gap-6 md:grid-cols-2">
          <div className="px-8 py-12 md:px-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-5xl">
              Tarladan bardağınıza gelen lezzet,
              <br />
              Çaycı Hurşit Efendi.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-gray-700">
              Doğal, taze ve her yudumda kaliteyi hissedeceğiniz çay, doğrudan tarladan fincanınıza.
            </p>
            <Link href="/hakkimizda" className="group mt-6 inline-flex items-center gap-2 text-emerald-800">
              <span className="rounded-full bg-white px-1.5 py-1 text-emerald-800 transition-transform duration-200 group-hover:translate-x-0.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </span>
              <span className="relative pb-0.5 text-sm font-semibold after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 after:bg-emerald-800 after:transition-all after:duration-200 group-hover:after:w-full">Bizi Tanıyın</span>
            </Link>
          </div>
          <div className="relative h-72 md:h-full">
            <Image src="/h1-bn-3.jpg" alt="Çay sunumu" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover object-right" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function Pillars() {
  const items = getHome().pillars;
  return (
    <section className="mx-auto mt-16 max-w-7xl px-4 md:px-6">
      <div className="grid gap-6 md:gap-8 xl:gap-12 md:grid-cols-2 xl:grid-cols-3">
        {items.map((i, idx) => (
          <div key={i.subtitle} className="relative rounded-2xl border border-emerald-100 bg-white p-8 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md md:h-[390px] md:aspect-square">
            <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-emerald-50">
              {(() => {
                const src = idx === 0 ? "/heritage.svg" : idx === 1 ? "/fresh.svg" : "/organic.svg";
                return (
                  <Image src={src} alt="pillar icon" width={64} height={64} className="object-contain" />
                );
              })()}
            </div>
            <div className="mt-6 text-center">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700/80">{i.title}</div>
              <h3 className="mt-2 text-2xl font-semibold leading-snug text-gray-900">{i.subtitle}</h3>
              <p className="mt-3 text-gray-700">{i.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function VideoBanner() {
  const v = getHome().video;
  return (
    <section className="relative mt-12 left-1/2 -translate-x-1/2 w-screen">
     <div className="relative h-[620px] w-screen overflow-hidden">
       {typeof v.src === "string" && v.src.includes("player.vimeo.com") ? (
         <div className="absolute inset-0">
           <iframe
             src={v.src}
             className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
             style={{ width: "177.78vh", height: "100vh", minWidth: "100vw", minHeight: "56.25vw" }}
             frameBorder="0"
             allow="autoplay; fullscreen; picture-in-picture"
             allowFullScreen
             title="Hero Video"
           />
         </div>
       ) : (
         <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover">
           <source src={v.src} type="video/mp4" />
         </video>
       )}
       <div className="absolute inset-0 bg-black/30" />
       <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
        <div className="text-sm uppercase tracking-wide">Sizi bir seyahate çıkaralım</div>
        <h2 className="mt-2 text-3xl font-bold md:text-4xl">{v.overlayTitle}</h2>
        <div className="mt-1 text-lg md:text-xl">{v.overlaySubtitle}</div>
        <p className="mt-3 max-w-3xl text-sm md:text-base">{v.overlayText}</p>
      </div>
    </div>
  </section>  
  );
}


