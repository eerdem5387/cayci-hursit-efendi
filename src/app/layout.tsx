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
  const settings = getSettings();
  
  return {
    title: {
      default: settings.site.title,
      template: `%s | ${settings.site.title}`,
    },
    description: settings.site.description,
    metadataBase: new URL("https://caycihursitefendi.com"),
  };
}

import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
