"use client";
import { usePathname } from "next/navigation";

// Sağ alttaki WhatsApp destek butonu. Yönetim panelinde içeriğin üstüne bindiği için gösterilmez.
export default function WhatsAppButton() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return (
    <a
      href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP?.replace(/[^\d]/g, "") || "905555555555"}?text=${encodeURIComponent("Merhaba, destek almak istiyorum.")}`}
      className="fixed bottom-4 right-4 z-40 inline-flex touch-manipulation items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-white shadow-lg transition-colors hover:bg-emerald-700 active:bg-emerald-800 sm:bottom-5 sm:right-5 print:hidden"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp Destek"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/whatsapp.svg" alt="WhatsApp" className="h-5 w-5 sm:h-6 sm:w-6" />
      <span className="hidden text-sm font-medium sm:inline">WhatsApp</span>
    </a>
  );
}
