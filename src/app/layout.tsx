import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/data";

/** DB kullanıldığı için build aşamasında statik ön üretim yapılmaz (Vercel/Neon uyumu). */
export const dynamic = "force-dynamic";

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
  let settings: Awaited<ReturnType<typeof getSettings>>;
  try {
    settings = await getSettings();
  } catch {
    settings = {
      site: { title: "Çaycı Hurşit Efendi", description: "Gerçek çay tadı" },
      smtp: { host: "", port: 587, user: "", pass: "", from: "" },
      notifications: { adminEmail: "" },
      payments: { ziraatPos: {} },
    } as Awaited<ReturnType<typeof getSettings>>;
  }

  return {
    title: {
      default: settings.site.title,
      template: `%s | ${settings.site.title}`,
    },
    description: settings.site.description,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    icons: {
      icon: "/hursit_efendi_logo.png",
      shortcut: "/hursit_efendi_logo.png",
      apple: "/hursit_efendi_logo.png",
    },
  };
}

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Providers } from "./providers";
import WhatsAppButton from "@/components/WhatsAppButton";

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
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
