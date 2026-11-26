import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/data";
import { sendMail } from "@/lib/mailer";
import type { EmailOrder } from "@/lib/emails";
import { renderAdminOrderEmail, renderCustomerPaidEmail } from "@/lib/emails";

type OrderWithItems = NonNullable<Awaited<ReturnType<typeof loadOrder>>>;

export function loadOrder(id: string) {
  return prisma.order.findUnique({ where: { id }, include: { items: true } });
}

/**
 * Sipariş kalemlerinin ad/fiyat bilgisi. Yeni siparişlerde sipariş anındaki
 * değerler saklanır; eski siparişlerde güncel ürün bilgisine düşülür.
 */
export async function resolveItems(items: { slug: string; qty: number; name?: string | null; unitPrice?: number | null }[]) {
  const missing = items.filter((i) => i.name == null || i.unitPrice == null).map((i) => i.slug);
  const products = missing.length ? await prisma.product.findMany({ where: { slug: { in: missing } } }) : [];
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  return items.map((i) => {
    const p = bySlug.get(i.slug);
    const images = Array.isArray((p as any)?.images) ? ((p as any).images as string[]) : [];
    return {
      slug: i.slug,
      qty: i.qty,
      name: i.name ?? p?.name ?? i.slug,
      price: i.unitPrice ?? p?.price ?? null,
      image: images[0] || `/images/${i.slug}.jpg`,
    };
  });
}

export async function toEmailOrder(order: OrderWithItems): Promise<EmailOrder> {
  const items = await resolveItems(order.items);
  return {
    id: order.id,
    createdAt: order.createdAt.toISOString(),
    trackingToken: order.trackingToken,
    total: order.total,
    customer: {
      ad: order.customerAd,
      email: order.customerEmail,
      adres: order.customerAdres,
      sehir: order.customerSehir,
      telefon: order.customerTelefon,
    },
    items: items.map((i) => ({ slug: i.slug, qty: i.qty, name: i.name, price: i.price })),
    paymentError: order.paymentError,
    cargoCompany: order.cargoCompany,
    cargoTrackingNo: order.cargoTrackingNo,
  };
}

async function adminRecipient() {
  const settings = await getSettings();
  return { settings, to: settings.notifications?.adminEmail || settings.smtp.from || "" };
}

/** Ödeme ilk kez onaylandığında: sepeti temizle, müşteriye ve yöneticiye e-posta gönder. */
export async function onOrderPaid(orderId: string) {
  const order = await loadOrder(orderId);
  if (!order) return;
  if (order.cartId) {
    await prisma.cartItem.deleteMany({ where: { cartId: order.cartId } }).catch(() => {});
  }
  const emailOrder = await toEmailOrder(order);
  const { settings, to } = await adminRecipient();
  await Promise.allSettled([
    order.customerEmail
      ? sendMail(order.customerEmail, `Siparişiniz alındı – #${order.id.slice(-8).toUpperCase()}`, renderCustomerPaidEmail(emailOrder, settings))
      : Promise.resolve(),
    to ? sendMail(to, `Yeni sipariş – ödeme alındı (${order.total.toLocaleString("tr-TR")} ₺)`, renderAdminOrderEmail(emailOrder, settings)) : Promise.resolve(),
  ]);
}

/** Banka onay verdi ama tutar/imza tutarsız: yöneticiyi uyar. */
export async function notifyAdminReview(orderId: string, note: string) {
  const order = await loadOrder(orderId);
  if (!order) return;
  const emailOrder = await toEmailOrder(order);
  const { settings, to } = await adminRecipient();
  if (!to) return;
  await sendMail(
    to,
    "DİKKAT: Ödeme elle kontrol edilmeli",
    renderAdminOrderEmail(emailOrder, settings, { heading: "Ödeme incelemede", note })
  ).catch(() => {});
}

/** Admin API ve müşteri ekranları için ortak sipariş biçimi */
export async function serializeOrder(order: OrderWithItems, opts: { includeContact?: boolean } = {}) {
  const items = await resolveItems(order.items);
  return {
    id: order.id,
    createdAt: order.createdAt,
    status: order.status,
    total: order.total,
    isGuest: order.isGuest,
    trackingToken: order.trackingToken,
    paidAt: order.paidAt,
    paidAmount: order.paidAmount,
    paymentRef: order.paymentRef,
    paymentError: order.paymentError,
    statusReason: order.statusReason,
    cargoCompany: order.cargoCompany,
    cargoTrackingNo: order.cargoTrackingNo,
    adminNote: order.adminNote,
    history: Array.isArray(order.history) ? (order.history as any[]) : [],
    customerName: order.customerName,
    customer: opts.includeContact === false
      ? undefined
      : { ad: order.customerAd, email: order.customerEmail, adres: order.customerAdres, sehir: order.customerSehir, telefon: order.customerTelefon },
    items,
  };
}
