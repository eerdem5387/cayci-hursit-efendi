import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") {
    redirect("/");
  }
  // Menüde dikkat gerektiren sipariş sayısı (yeni + incelemede)
  const [newCount, reviewCount] = await Promise.all([
    prisma.order.count({ where: { status: "paid" } }).catch(() => 0),
    prisma.order.count({ where: { status: "odeme_incelemede" } }).catch(() => 0),
  ]);
  return (
    <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-[minmax(0,1fr)] content-start gap-4 px-4 py-4 md:grid-cols-[240px_minmax(0,1fr)] md:gap-6 md:px-6 md:py-8 print:block print:p-0">
      <aside className="-mx-4 border-b border-gray-200 bg-white px-2 py-2 md:mx-0 md:self-start md:rounded-lg md:border md:p-4 print:hidden">
        <div className="mb-4 hidden items-center gap-2 text-sm font-semibold text-gray-900 md:flex">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Yönetim Paneli
        </div>
        <nav className="flex gap-1 overflow-x-auto text-sm md:grid md:gap-2 md:overflow-visible">
          <Link href="/admin" className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded px-2 py-1.5 hover:bg-emerald-50"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12l9-9 9 9"/><path d="M9 21V9h6v12"/></svg> Genel Bakış</Link>
          <Link href="/admin/siparisler" className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded px-2 py-1.5 font-medium hover:bg-emerald-50"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Siparişler
            {newCount > 0 && <span className="md:ml-auto rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white" title="Hazırlanmayı bekleyen yeni sipariş">{newCount}</span>}
            {reviewCount > 0 && <span className={`${newCount > 0 ? "" : "md:ml-auto "}rounded-full bg-violet-600 px-2 py-0.5 text-xs font-bold text-white`} title="İnceleme bekleyen ödeme">{reviewCount}</span>}
          </Link>
          <Link href="/admin/ayarlar" className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded px-2 py-1.5 hover:bg-emerald-50"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .66.26 1.3.73 1.77.47.47 1.11.73 1.77.73H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> Ayarlar</Link>
          <Link href="/admin/urunler" className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded px-2 py-1.5 hover:bg-emerald-50"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Ürünler</Link>
          <Link href="/admin/markalar" className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded px-2 py-1.5 hover:bg-emerald-50"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M21 15l-9 4-9-4"/><path d="M21 11l-9 4-9-4"/></svg> Markalar</Link>
          <Link href="/admin/anasayfa" className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded px-2 py-1.5 hover:bg-emerald-50"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> Anasayfa İçerikleri</Link>
          <form action="/api/auth/signout" method="post" className="shrink-0 md:mt-4">
            <button className="inline-flex w-full items-center gap-2 whitespace-nowrap rounded border border-gray-300 px-2 py-1 text-left text-red-700 hover:bg-red-50"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> Çıkış Yap</button>
          </form>
        </nav>
      </aside>
      <section className="min-w-0">{children}</section>
    </div>
  );
}


