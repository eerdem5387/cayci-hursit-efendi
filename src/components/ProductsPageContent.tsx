"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  weightKg?: number | null;
  images?: string[];
  brandId?: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface ProductsPageContentProps {
  products: Product[];
  brands: Brand[];
  brandParam: string | null;
  brand: Brand | null;
  filtered: Product[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function ProductsPageContent({ products, brands, brandParam, brand, filtered }: ProductsPageContentProps) {
  return (
    <motion.div
      className="mx-auto max-w-7xl px-4 py-10 md:px-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 variants={itemVariants} className="mb-4 sm:mb-6 text-2xl sm:text-3xl font-semibold text-gray-900">
        Ürünlerimiz
      </motion.h1>
      
      <motion.div variants={itemVariants} className="mb-6 flex flex-wrap items-center gap-2 text-sm">
        <span className="w-full sm:w-auto mb-1 sm:mb-0 font-medium text-gray-700">Markaya göre filtrele:</span>
        <Link 
          href="/urunlerimiz" 
          className="rounded-lg border border-gray-300 px-3 py-2 hover:border-emerald-600 hover:bg-emerald-50 transition-colors touch-manipulation"
        >
          Tümü
        </Link>
        {brands.map((b) => (
          <Link 
            key={b.id} 
            href={`/urunlerimiz?marka=${b.slug}`} 
            className="rounded-lg border border-gray-300 px-3 py-2 hover:border-emerald-600 hover:bg-emerald-50 transition-colors touch-manipulation"
          >
            {b.name}
          </Link>
        ))}
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
      >
        {filtered.map((p, index) => {
          const imageSrc = p?.images?.[0] || `/images/${p.slug}.jpg`;
          return (
            <motion.div
              key={p.id}
              variants={itemVariants}
              className="group rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 aspect-[4/3] overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center relative">
                <Image 
                  src={imageSrc}
                  alt={p.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-contain transition-transform group-hover:scale-105"
                  priority={false}
                />
              </div>
              <div className="mb-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2">{p.name}</h3>
              </div>
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-emerald-700">
                    {p.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                  </div>
                  {p.weightKg && (
                    <div className="text-sm text-gray-600 mt-0.5">{p.weightKg} kg</div>
                  )}
                </div>
                <form action="/sepet/ekle" method="post" className="flex items-center gap-2">
                  <input type="hidden" name="slug" value={p.slug} />
                  <input 
                    name="qty" 
                    type="number" 
                    min={1} 
                    defaultValue={1} 
                    className="w-16 sm:w-20 rounded-lg border border-gray-300 px-2 py-2 text-sm text-center focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 touch-manipulation" 
                  />
                  <button 
                    type="submit"
                    className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-emerald-700 text-white transition-colors hover:bg-emerald-800 active:bg-emerald-900 touch-manipulation"
                    title="Sepete Ekle"
                    aria-label="Sepete Ekle"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 7H6L5 9z" />
                    </svg>
                  </button>
                </form>
              </div>
              <Link 
                href={`/urun/${p.slug}`} 
                className="block w-full rounded-lg border border-emerald-700 bg-transparent px-4 py-3 text-center text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-700 hover:text-white active:bg-emerald-800 touch-manipulation"
              >
                Detayları Gör
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
