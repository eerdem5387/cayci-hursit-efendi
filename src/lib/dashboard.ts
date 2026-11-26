import { prisma } from "@/lib/db";
import { PAID_STATUSES } from "@/lib/orderStatus";

// Yönetim paneli "Genel Bakış" istatistikleri. Gün sınırları Türkiye saatine (UTC+3) göre hesaplanır.

const TR_OFFSET = 3 * 3600 * 1000;
const DAY = 24 * 3600 * 1000;

/** Türkiye saatine göre YYYY-MM-DD */
export function trDayKey(d: Date) {
  return new Date(d.getTime() + TR_OFFSET).toISOString().slice(0, 10);
}
/** Türkiye saatine göre o günün başlangıcı (UTC Date) */
function trStartOfDay(d: Date) {
  const k = trDayKey(d);
  return new Date(new Date(`${k}T00:00:00Z`).getTime() - TR_OFFSET);
}
function trStartOfMonth(d: Date, monthDelta = 0) {
  const t = new Date(d.getTime() + TR_OFFSET);
  const m = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + monthDelta, 1));
  return new Date(m.getTime() - TR_OFFSET);
}

export type Dashboard = Awaited<ReturnType<typeof getDashboard>>;

export async function getDashboard() {
  const now = new Date();
  const todayStart = trStartOfDay(now);
  const since60 = new Date(todayStart.getTime() - 60 * DAY);
  const monthStart = trStartOfMonth(now);
  const prevMonthStart = trStartOfMonth(now, -1);
  const dayOfMonthMs = now.getTime() - monthStart.getTime();

  const [grouped, paid, attempts, recent, lowStock] = await Promise.all([
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.findMany({
      where: { status: { in: PAID_STATUSES }, OR: [{ paidAt: { gte: since60 } }, { paidAt: null, createdAt: { gte: since60 } }] },
      select: { id: true, total: true, paidAt: true, createdAt: true, customerEmail: true, items: { select: { slug: true, qty: true, name: true, unitPrice: true } } },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: new Date(todayStart.getTime() - 30 * DAY) } },
      select: { id: true, status: true, total: true, createdAt: true, customerAd: true, customerEmail: true, customerTelefon: true, customerSehir: true, paymentError: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      where: { status: { notIn: ["pending", "odeme_basarisiz"] } },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, createdAt: true, status: true, total: true, customerAd: true, customerSehir: true, items: { select: { qty: true, name: true, slug: true } } },
    }),
    prisma.product.findMany({ where: { stock: { not: null, lte: 5 } }, select: { id: true, name: true, stock: true }, orderBy: { stock: "asc" }, take: 6 }),
  ]);

  const byStatus = Object.fromEntries(grouped.map((g) => [g.status, g._count._all])) as Record<string, number>;
  const paidTime = (o: { paidAt: Date | null; createdAt: Date }) => o.paidAt || o.createdAt;

  const sum = (from: Date, to: Date = now) => {
    const list = paid.filter((o) => paidTime(o) >= from && paidTime(o) < to);
    return { revenue: list.reduce((s, o) => s + o.total, 0), count: list.length };
  };

  const today = sum(todayStart);
  const yesterday = sum(new Date(todayStart.getTime() - DAY), todayStart);
  const last7 = sum(new Date(todayStart.getTime() - 6 * DAY));
  const month = sum(monthStart);
  // Geçen ayın aynı dönemi (ayın ilk N günü) ile karşılaştır
  const prevMonthSame = sum(prevMonthStart, new Date(Math.min(prevMonthStart.getTime() + dayOfMonthMs, monthStart.getTime())));
  const last30 = sum(new Date(todayStart.getTime() - 29 * DAY));

  // Son 30 günün günlük cirosu
  const days: { key: string; label: string; revenue: number; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(todayStart.getTime() - i * DAY);
    const key = trDayKey(d);
    days.push({ key, label: new Date(`${key}T12:00:00Z`).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }), revenue: 0, count: 0 });
  }
  const dayIdx = new Map(days.map((d, i) => [d.key, i]));
  for (const o of paid) {
    const i = dayIdx.get(trDayKey(paidTime(o)));
    if (i !== undefined) { days[i].revenue += o.total; days[i].count += 1; }
  }

  // En çok satanlar (30 gün)
  const since30 = new Date(todayStart.getTime() - 29 * DAY);
  const prodMap = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const o of paid) {
    if (paidTime(o) < since30) continue;
    for (const it of o.items) {
      const cur = prodMap.get(it.slug) || { name: it.name || it.slug, qty: 0, revenue: 0 };
      cur.qty += it.qty;
      cur.revenue += (it.unitPrice ?? 0) * it.qty;
      prodMap.set(it.slug, cur);
    }
  }
  // Eski siparişlerde kalem adı/fiyatı yok: ürün tablosundan tamamla
  const missing = [...prodMap.entries()].filter(([k, v]) => v.revenue === 0 || v.name === k).map(([k]) => k);
  if (missing.length) {
    const ps = await prisma.product.findMany({ where: { slug: { in: missing } }, select: { slug: true, name: true, price: true } });
    for (const p of ps) {
      const v = prodMap.get(p.slug)!;
      if (!v.name || v.name === p.slug) v.name = p.name;
      if (v.revenue === 0) v.revenue = p.price * v.qty;
    }
  }
  const topProducts = [...prodMap.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);

  // Ödeme dönüşümü (30 gün): ödeme deneyen müşterilerin kaçı ödemeyi tamamladı
  const tried = new Set(attempts.map((a) => a.customerEmail.toLowerCase()));
  const paidEmails = new Set(attempts.filter((a) => PAID_STATUSES.includes(a.status)).map((a) => a.customerEmail.toLowerCase()));
  const conversion = tried.size ? paidEmails.size / tried.size : null;

  // Ödemesi tamamlanmayan ve sonra da ödeme yapmayan müşteriler (son 14 gün) – geri kazanmak için
  const since14 = new Date(todayStart.getTime() - 13 * DAY);
  const seen = new Set<string>();
  const lostCustomers = attempts
    .filter((a) => a.createdAt >= since14 && (a.status === "pending" || a.status === "odeme_basarisiz") && Date.now() - a.createdAt.getTime() > 15 * 60 * 1000)
    .filter((a) => !paidEmails.has(a.customerEmail.toLowerCase()))
    .filter((a) => { const k = a.customerEmail.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; })
    .slice(0, 8)
    .map((a) => ({ id: a.id, createdAt: a.createdAt, total: a.total, name: a.customerAd, phone: a.customerTelefon, city: a.customerSehir, reason: a.paymentError }));

  return {
    todo: {
      toPrepare: byStatus["paid"] || 0,
      toShip: byStatus["onaylandi"] || 0,
      inTransit: byStatus["kargoda"] || 0,
      review: byStatus["odeme_incelemede"] || 0,
    },
    today,
    yesterday,
    last7,
    month,
    prevMonthSame,
    avgBasket: last30.count ? last30.revenue / last30.count : 0,
    last30,
    conversion,
    triedCount: tried.size,
    paidCustomerCount: paidEmails.size,
    days,
    topProducts,
    recent: recent.map((o) => ({ ...o, summary: o.items.map((i) => `${i.qty}× ${i.name || i.slug}`).join(", ") })),
    lostCustomers,
    lowStock,
  };
}
