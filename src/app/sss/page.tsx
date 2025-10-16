"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const faqs = [
  { q: "Çaycı Hurşit Efendi ürünlerini nereden satın alabilirim?", a: "Sakaoğlu Çay ve Çaycı Hurşit Efendi markalarımıza ait ürünleri yetkili satış noktalarımızdan, e-ticaret sitemizden ve çeşitli online platformlardan güvenle satın alabilirsiniz." },
  { q: "Çaylarınız tamamen yerli üretim mi?", a: "Evet. Tüm çaylarımız Rize bölgesindeki seçkin çay bahçelerinden toplanmakta, yine Rize’de bulunan fabrikamızda tamamen yerli sermaye ile işlenmektedir." },
  { q: "Çaycı Hurşit Efendi markası nedir?", a: "Çaycı Hurşit Efendi, Sakaoğlu Çay’ın yıllar içinde edindiği bilgi birikimi ve deneyimin sonucu olarak doğan yeni bir markadır. Geleneksel çay kültürünü modern sunumla birleştiren özel bir üründür." },
  { q: "Kurumsal müşterilere (cafe, restoran, otel) özel satışlarınız var mı?", a: "Evet. Kurumsal iş birlikleri kapsamında cafe, restoran, pastane, otel ve benzeri işletmelere özel fiyatlandırma ve toptan satış imkânları sunmaktayız." },
  { q: "Ürünlerinizi yurt dışına gönderiyor musunuz?", a: "Şu anda belirli ülkelerde distribütörlüklerimiz ve sınırlı ihracat faaliyetlerimiz bulunmakta. Detaylı bilgi için bizimle iletişime geçebilirsiniz." },
  { q: "Hangi çay çeşitlerini sunuyorsunuz?", a: "Siyah çay başta olmak üzere dökme çay, poşet çay ve özel harmanlarımızla farklı damak zevklerine hitap eden birçok ürün sunuyoruz. Yakında yeşil çay ve aromalı çay seçenekleri de ürün gamımıza eklenecektir." },
  { q: "Ürünlerinizde katkı maddesi bulunuyor mu?", a: "Hayır, Sakaoğlu Çay ve Çaycı Hurşit Efendi markalı ürünlerimiz tamamen doğal, katkı maddesi içermeyen ve tarım onaylı çaylardan üretilmektedir. Saf çay satışlarımızın yanı sıra, müşterilerimizin talepleri doğrultusunda bazı özel harmanlarımızda hibiskus bitki özü ve Seylan çayı gibi doğal içerikler de kullanılmaktadır." },
];

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
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <motion.div
      className="mx-auto max-w-6xl px-4 py-10 md:px-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 variants={itemVariants} className="mb-8 text-3xl font-extrabold text-emerald-900">
        Sizden Gelen Sorular
      </motion.h1>

      <motion.div variants={containerVariants} className="grid items-start gap-8 md:grid-cols-2">
        <motion.div variants={containerVariants} className="space-y-3">
          {faqs.map((f, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div key={f.q} variants={itemVariants} className="rounded-2xl border border-emerald-100 bg-white">
                <button
                  className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left md:px-5 md:py-5"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="text-lg font-semibold text-emerald-900 md:text-xl">{f.q}</span>
                  <span className="text-emerald-900">{isOpen ? "−" : "+"}</span>
                </button>
                <div
                  className="overflow-hidden px-4 md:px-5"
                  style={{ maxHeight: isOpen ? 400 : 0, transition: "max-height 300ms ease" }}
                >
                  <div className="pb-5 text-sm leading-relaxed text-gray-700 md:text-base">{f.a || ""}</div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div variants={itemVariants} className="hidden overflow-hidden rounded-3xl md:block">
          <img src="/faq-pic-1.jpg" alt="SSS görsel" className="h-full w-full object-cover" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}


