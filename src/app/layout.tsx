import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Dinamik metadata oluşturma
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  
  return {
    title: {
      default: settings.site.title,
      template: `%s | ${settings.site.title}`,
    },
    description: settings.site.description,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  };
}

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}>
        <Providers>
          <Header />
          <main>
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
          {/* Floating WhatsApp button */}
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP?.replace(/[^\d]/g, "") || "905555555555"}?text=${encodeURIComponent("Merhaba, destek almak istiyorum.")}`}
            className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-white shadow-lg transition hover:bg-emerald-700"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp Destek"
          >
            <img src="/images/whatsapp.svg" alt="WhatsApp" className="h-5 w-5" />
            <span className="hidden md:inline">WhatsApp</span>
          </a>
        </Providers>
      </body>
    </html>
  );
}
