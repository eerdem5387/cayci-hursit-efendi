import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-6 px-4 py-8 md:grid-cols-[240px_1fr] md:px-6">
      <aside className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Yönetim Paneli
        </div>
        <nav className="grid gap-2 text-sm">
          <Link href="/admin" className="inline-flex items-center gap-2 rounded px-2 py-1 hover:bg-emerald-50"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12l9-9 9 9"/><path d="M9 21V9h6v12"/></svg> Genel Bakış</Link>
          <Link href="/admin/ayarlar" className="inline-flex items-center gap-2 rounded px-2 py-1 hover:bg-emerald-50"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .66.26 1.3.73 1.77.47.47 1.11.73 1.77.73H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> Ayarlar</Link>
          <Link href="/admin/urunler" className="inline-flex items-center gap-2 rounded px-2 py-1 hover:bg-emerald-50"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Ürünler</Link>
          <Link href="/admin/markalar" className="inline-flex items-center gap-2 rounded px-2 py-1 hover:bg-emerald-50"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M21 15l-9 4-9-4"/><path d="M21 11l-9 4-9-4"/></svg> Markalar</Link>
          <Link href="/admin/anasayfa" className="inline-flex items-center gap-2 rounded px-2 py-1 hover:bg-emerald-50"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> Anasayfa İçerikleri</Link>
          <Link href="/admin/siparisler" className="inline-flex items-center gap-2 rounded px-2 py-1 hover:bg-emerald-50"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Siparişler</Link>
          <form action="/api/admin/logout" method="post" className="mt-4">
            <button className="inline-flex w-full items-center gap-2 rounded border border-gray-300 px-2 py-1 text-left text-red-700 hover:bg-red-50"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> Çıkış Yap</button>
          </form>
        </nav>
      </aside>
      <section>{children}</section>
    </div>
  );
}


