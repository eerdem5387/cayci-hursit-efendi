export const metadata = {
  title: "İletişim",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <h1 className="mb-8 text-center text-4xl font-extrabold text-emerald-900">İletişim</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-emerald-100 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-emerald-900">İletişim</h2>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div className="mt-4 space-y-1 text-gray-800">
            <div>T: 0 (539) 850 72 53</div>
            <div>E: info@caycihursitefendi.com</div>
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-emerald-900">Saatler</h2>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div className="mt-4 space-y-1 text-gray-800">
            <div>Hafta içi: <span className="font-semibold">7.00 – 19.00</span></div>
            <div>Hafta sonu: <span className="font-semibold">10.00 – 18.00</span></div>
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-emerald-900">Konum</h2>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div className="mt-4 text-gray-800">Yunus Emre Mah. Yunus Emre Bulvarı No: 65, SULTANGAZİ / İSTANBUL</div>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl">
        <iframe
          src="https://www.google.com/maps?q=Yunus%20Emre%20Blv.%20No:65%20Sultangazi&output=embed"
          width="100%"
          height="480"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}


