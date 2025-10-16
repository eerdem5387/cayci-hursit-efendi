"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

type Slide = {
  id: number;
  src: string;
  alt: string;
  eyebrow?: string; // küçük üst metin
  heading?: string; // büyük başlık
  description?: string; // kısa açıklama
  ctaHref?: string;
  ctaLabel?: string;
};

const slides: Slide[] = [
  {
    id: 1,
    src: "/caycihursit.jpg",
    alt: "Siyah çay koleksiyonu",
    eyebrow: "1983'ten beri",
    heading: "Çaycı Hurşit Efendi",
    description: "Lezzeti Keşfet, Hemen Sipariş Ver.",
    ctaHref: "/urunlerimiz",
    ctaLabel: "Alışverişe Başla",
  },
  {
    id: 2,
    src: "/sakaoglu.jpg",
    alt: "Tarladan bardağınıza",
    eyebrow: "Saf & Doğal",
    heading: "Sakaoğlu Çay",
    description: "Her Dem Ayrı Lezzet.",
    ctaHref: "/urunlerimiz",
    ctaLabel: "Ürünleri Gör",
  },
  {
    id: 3,
    src: "/sa-kahve-1.jpg",
    alt: "Gerçek kahve tadı",
    eyebrow: "Kalite",
    heading: "Sakahve",
    description: "Keyifle Yudumla. En taze kahve çeşitleri",
    ctaHref: "/urunlerimiz",
    ctaLabel: "Keşfet",
  },
];

export default function Slider() {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((i) => (i + 1) % slides.length);
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  // autoplay
  useEffect(() => {
    const t = setInterval(() => next(), 10000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-r z-10 mt-24">
      <div className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0 flex h-full w-full transition-transform duration-700" style={{ transform: `translateX(-${index * 100}%)` }}>
          {slides.map((s) => (
            <div key={s.id} className="relative h-full w-full min-w-full">
              <Image src={s.src} alt={s.alt} fill priority sizes="100vw" className="object-cover" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 flex flex-col items-start justify-center px-20 text-white">
          {slides[index].eyebrow && (
            <div className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">{slides[index].eyebrow}</div>
          )}
          {slides[index].heading && (
            <h2 className="mt-3 text-3xl font-bold md:text-5xl" dangerouslySetInnerHTML={{ __html: slides[index].heading || "" }} />
          )}
          {slides[index].description && (
            <p className="mt-2 max-w-xl text-sm md:text-base">{slides[index].description}</p>
          )}
          {(slides[index].ctaHref || slides[index].ctaLabel) && (
            <a href={slides[index].ctaHref || "/"} className="mt-4 inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-emerald-800 shadow hover:bg-emerald-50">
              {slides[index].ctaLabel || "Devam"}
            </a>
          )}
        </div>
      </div>
      <button onClick={prev} aria-label="Önceki" className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 text-emerald-800 shadow-lg ring-1 ring-black/5 hover:bg-white">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button onClick={next} aria-label="Sonraki" className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 text-emerald-800 shadow-lg ring-1 ring-black/5 hover:bg-white">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
      </button>

      <div className="pointer-events-auto absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((s, i) => (
          <button key={s.id} onClick={() => setIndex(i)} aria-label={`Slide ${i+1}`} className={`h-2.5 w-2.5 rounded-full ring-1 ring-white/50 ${i === index ? "bg-white" : "bg-white/40"}`} />
        ))}
      </div>
    </section>
  );
}


