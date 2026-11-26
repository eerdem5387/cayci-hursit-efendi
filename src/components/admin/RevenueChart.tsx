"use client";
import { useState } from "react";

type Day = { key: string; label: string; revenue: number; count: number };

const fmt = (n: number) => n.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

/** Son 30 günün günlük cirosu – tek seri çubuk grafik, hover ile ayrıntı, tablo görünümü */
export default function RevenueChart({ days }: { days: Day[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const [table, setTable] = useState(false);
  const max = Math.max(...days.map((d) => d.revenue), 1);
  // Okunaklı üst sınır: 1-2-5 adımına yuvarla
  const pow = Math.pow(10, Math.floor(Math.log10(max)));
  const top = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((v) => v >= max) || max;
  const ticks = [0, top / 2, top];
  const H = 160;
  const total = days.reduce((s, d) => s + d.revenue, 0);
  const h = hover !== null ? days[hover] : null;

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-900">Günlük ciro · son 30 gün</h2>
          <p className="text-sm text-gray-500">Toplam {fmt(total)} · ödemesi alınmış siparişler</p>
        </div>
        <button onClick={() => setTable((t) => !t)} className="text-xs font-medium text-emerald-700 hover:underline">{table ? "Grafik" : "Tablo"}</button>
      </div>

      {table ? (
        <div className="max-h-64 overflow-auto rounded-lg border border-gray-100">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 text-left text-xs text-gray-500"><tr><th className="px-3 py-2">Gün</th><th className="px-3 py-2 text-right">Sipariş</th><th className="px-3 py-2 text-right">Ciro</th></tr></thead>
            <tbody>
              {[...days].reverse().map((d) => (
                <tr key={d.key} className="border-t border-gray-100"><td className="px-3 py-1.5">{d.label}</td><td className="px-3 py-1.5 text-right tabular-nums">{d.count}</td><td className="px-3 py-1.5 text-right tabular-nums">{fmt(d.revenue)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative pl-14">
          {/* Y ekseni + ızgara */}
          <div className="absolute inset-y-0 left-0 right-0" style={{ height: H }} aria-hidden="true">
            {ticks.map((t) => (
              <div key={t} className="absolute left-0 right-0 flex items-center" style={{ bottom: (t / top) * H - 6 }}>
                <span className="w-14 pr-2 text-right text-[10px] tabular-nums text-gray-400">{t >= 1000 ? `₺${Math.round(t / 1000)} bin` : `₺${Math.round(t)}`}</span>
                <span className="h-px flex-1 bg-gray-100" />
              </div>
            ))}
          </div>

          <div className="relative flex items-end gap-[2px]" style={{ height: H }} onMouseLeave={() => setHover(null)} role="list" aria-label="Günlük ciro">
            {days.map((d, i) => {
              const hgt = d.revenue > 0 ? Math.max(3, (d.revenue / top) * H) : 0;
              const isToday = i === days.length - 1;
              return (
                <div key={d.key} role="listitem" tabIndex={0} aria-label={`${d.label}: ${fmt(d.revenue)}, ${d.count} sipariş`}
                  onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}
                  className="group relative flex h-full flex-1 cursor-default items-end outline-none">
                  <div className={`w-full rounded-t-[4px] transition-colors ${hover === i ? "bg-emerald-800" : isToday ? "bg-emerald-500" : "bg-emerald-600"}`} style={{ height: hgt }} />
                  {d.revenue === 0 && <div className="absolute bottom-0 h-px w-full bg-gray-200" />}
                </div>
              );
            })}
          </div>

          {/* Bilgi kutusu */}
          {h && hover !== null && (
            <div className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg"
              style={{ left: `calc(3.5rem + (100% - 3.5rem) * ${(hover + 0.5) / days.length})` }}>
              <div className="font-semibold">{h.label}</div>
              <div className="tabular-nums">{fmt(h.revenue)} · {h.count} sipariş</div>
            </div>
          )}

          <div className="mt-2 flex justify-between text-[10px] text-gray-400" aria-hidden="true">
            <span>{days[0]?.label}</span><span>{days[14]?.label}</span><span>Bugün</span>
          </div>
        </div>
      )}
    </div>
  );
}
