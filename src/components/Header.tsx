"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";

const navItems = [
  { href: "/", label: "Anasayfa" },
  { href: "/urunlerimiz", label: "Ürünlerimiz" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/sss", label: "Sıkça Sorulan Sorular" },
  { href: "/referanslarimiz", label: "Referanslarımız" },
  { href: "/iletisim", label: "İletişim" },
];

export default function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    navItems.forEach((n) => {
      map[n.href] = pathname === n.href || (n.href !== "/" && pathname?.startsWith(n.href));
    });
    return map;
  }, [pathname]);

  const isHome = pathname === "/";
  return (
    <header className={isHome ? "absolute inset-x-0 top-0 z-50 w-full border-b border-white/10 bg-[#194A33] backdrop-blur-sm" : "sticky top-0 z-50 w-full border-b border-gray-200 bg-[#194A33] backdrop-blur"}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6 md:py-5 lg:py-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
            <img src="/hursit_efendi_logo.png" alt="Hursit Efendi Logo" className="h-12 w-auto sm:h-14 md:h-16 lg:h-20 drop-shadow" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 lg:gap-8 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={(isHome ? "text-base lg:text-lg text-white/90 hover:text-white" : "text-base lg:text-lg text-white/90 hover:text-white") + (activeMap[item.href] ? " font-semibold" : "") + " transition-colors"}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          {session ? (
            <div className="flex items-center gap-2 lg:gap-3">
              <span className="text-sm lg:text-base text-white/90 hidden xl:block">
                Merhaba, {session.user?.name}
              </span>
              <div className="relative group">
                <button className="inline-flex h-11 w-11 md:h-12 md:w-12 lg:h-14 lg:w-14 items-center justify-center rounded-full bg-white/90 text-emerald-800 shadow hover:bg-white transition-colors touch-manipulation" aria-label="Kullanıcı menüsü">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="lg:w-6 lg:h-6"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <Link href="/profil" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                      Profilim
                    </Link>
                    <Link href="/siparislerim" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                      Siparişlerim
                    </Link>
                    {(session.user as any)?.role === "admin" && (
                      <Link href="/admin" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                        Yönetim Paneli
                      </Link>
                    )}
                    <button
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Çıkış Yap
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden items-center gap-2 lg:gap-3 md:flex">
              <Link
                href="/auth/signin"
                className="text-sm lg:text-base text-white/90 hover:text-white transition-colors px-3 py-2 lg:px-4 lg:py-2.5"
              >
                Giriş Yap
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center rounded-lg bg-white/90 px-4 py-2 lg:px-5 lg:py-2.5 text-sm lg:text-base font-medium text-emerald-800 hover:bg-white transition-colors touch-manipulation"
              >
                Kayıt Ol
              </Link>
            </div>
          )}
          <Link
            href="/sepet"
            className="inline-flex h-11 w-11 md:h-12 md:w-12 lg:h-14 lg:w-14 items-center justify-center rounded-full bg-white/90 text-emerald-800 shadow hover:bg-white transition-colors touch-manipulation relative"
            aria-label="Sepet"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="lg:w-6 lg:h-6"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 12.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          </Link>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 text-white md:hidden touch-manipulation"
            aria-label="Menü"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            ) : (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#194A33] backdrop-blur-sm">
          <nav className="mx-auto max-w-7xl px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded-lg px-4 py-3 text-base font-medium text-white/90 transition-colors touch-manipulation ${
                  activeMap[item.href] 
                    ? "bg-white/20 text-white" 
                    : "hover:bg-white/10"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {!session && (
              <>
                <div className="border-t border-white/10 my-2"></div>
                <Link
                  href="/auth/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg px-4 py-3 text-base font-medium text-white/90 hover:bg-white/10 transition-colors touch-manipulation"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg px-4 py-3 text-base font-medium text-white bg-white/20 hover:bg-white/30 transition-colors touch-manipulation text-center"
                >
                  Kayıt Ol
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}


