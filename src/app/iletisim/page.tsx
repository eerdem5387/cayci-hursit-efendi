"use client";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

export default function ContactPage() {
  return (
    <motion.div
      className="mx-auto max-w-7xl px-4 py-12 md:px-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 variants={itemVariants} className="mb-8 text-center text-4xl font-extrabold text-emerald-900">
        İletişim
      </motion.h1>

      <motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-3">
        <motion.div variants={itemVariants} className="rounded-2xl border border-emerald-100 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-emerald-900">İletişim</h2>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div className="mt-4 space-y-1 text-gray-800">
            <div>T: 0 (539) 850 72 53</div>
            <div>E: info@caycihursitefendi.com</div>
            <div className="pt-2">
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP?.replace(/[^\d]/g, "") || "905555555555"}?text=${encodeURIComponent("Merhaba, destek almak istiyorum.")}`}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="/images/whatsapp.svg" alt="WhatsApp" className="h-4 w-4" /> WhatsApp Destek
              </a>
              <div className="mt-1 text-xs text-gray-600">{process.env.NEXT_PUBLIC_WHATSAPP || "+90 555 555 55 55"}</div>
            </div>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="rounded-2xl border border-emerald-100 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-emerald-900">Saatler</h2>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div className="mt-4 space-y-1 text-gray-800">
            <div>Hafta içi: <span className="font-semibold">7.00 – 19.00</span></div>
            <div>Hafta sonu: <span className="font-semibold">10.00 – 18.00</span></div>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="rounded-2xl border border-emerald-100 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-emerald-900">Konum</h2>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div className="mt-4 text-gray-800">Yunus Emre Mah. Yunus Emre Bulvarı No: 65, SULTANGAZİ / İSTANBUL</div>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} className="mt-8 overflow-hidden rounded-2xl">
        <iframe
          src="https://www.google.com/maps?q=Yunus%20Emre%20Blv.%20No:65%20Sultangazi&output=embed"
          width="100%"
          height="480"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </motion.div>
    </motion.div>
  );
}


