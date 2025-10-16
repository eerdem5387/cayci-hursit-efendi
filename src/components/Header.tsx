"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
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

  const activeMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    navItems.forEach((n) => {
      map[n.href] = pathname === n.href || (n.href !== "/" && pathname?.startsWith(n.href));
    });
    return map;
  }, [pathname]);

  const isHome = pathname === "/";
  return (
    <header className={isHome ? "absolute inset-x-0 top-0 z-50 w-full border-b border-white/10 bg-white/10 backdrop-blur-sm" : "sticky top-0 z-50 w-full border-b border-gray-200 bg-[#194A33] backdrop-blur"}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <img src="/hursit_efendi_logo.png" alt="Hursit Efendi Logo" className="h-30 w-50 drop-shadow" />

          </Link>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={(isHome ? "text-md  text-white/90 hover:text-white" : "text-sm text-white/90 hover:text-white") + (activeMap[item.href] ? " font-semibold" : "")}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/90 hidden sm:block">
                Merhaba, {session.user?.name}
              </span>
              <div className="relative group">
                <button className={isHome ? "inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-emerald-800 shadow hover:bg-white" : "inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-emerald-800 shadow hover:bg-white"}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <Link href="/profil" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profilim
                    </Link>
                    <Link href="/siparislerim" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Siparişlerim
                    </Link>
                    {(session.user as any)?.role === "admin" && (
                      <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Yönetim Paneli
                      </Link>
                    )}
                    <button
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Çıkış Yap
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/signin"
                className="text-sm text-white/90 hover:text-white"
              >
                Giriş Yap
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center rounded-lg bg-white/90 px-3 py-1.5 text-sm font-medium text-emerald-800 hover:bg-white"
              >
                Kayıt Ol
              </Link>
            </div>
          )}
          <Link
            href="/sepet"
            className={isHome ? "inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-emerald-800 shadow hover:bg-white" : "inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-emerald-800 shadow hover:bg-white"}
            aria-label="Sepet"
          >
            {/* cart icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 12.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          </Link>
        </div>
      </div>

      <div className="md:hidden">
        <nav className="mx-auto grid max-w-7xl grid-cols-2 gap-2 px-4 pb-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={(isHome ? "rounded-md px-3 py-2 text-sm text-white/90 backdrop-blur-sm hover:bg-white/10" : "rounded-md px-3 py-2 text-sm text-white/90 hover:bg-white/10") + (activeMap[item.href] ? " bg-white/10" : "")}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}


