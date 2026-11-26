import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "@/lib/db";

// Her ziyaretçinin kendi sepeti olur: kimlik httpOnly bir çerezde tutulur,
// kalemler CartItem tablosunda bu kimlikle saklanır. Fiyatlar her zaman
// sunucuda, ürün tablosundan hesaplanır.

export const CART_COOKIE = "chf_cart";
const MAX_QTY = 99;
const ID_RE = /^[a-f0-9-]{36}$/;

export type CartLine = {
  slug: string;
  qty: number;
  name: string;
  price: number;
  lineTotal: number;
  image: string;
  weightKg: number | null;
  /** null = sınırsız */
  stock: number | null;
};

export type Cart = {
  items: CartLine[];
  count: number;
  total: number;
  /** Sepette olup artık satılamayan (silinmiş / stokta olmayan) ürünler */
  removed: string[];
};

export async function getCartId(): Promise<string | null> {
  const jar = await cookies();
  const id = jar.get(CART_COOKIE)?.value || "";
  return ID_RE.test(id) ? id : null;
}

export async function ensureCartId(): Promise<string> {
  const existing = await getCartId();
  if (existing) return existing;
  const id = crypto.randomUUID();
  const jar = await cookies();
  jar.set(CART_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return id;
}

function clampQty(qty: unknown) {
  const n = Math.floor(Number(qty));
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, MAX_QTY);
}

function maxForStock(stock: number | null | undefined) {
  if (stock === null || stock === undefined) return MAX_QTY;
  return Math.max(0, Math.min(stock, MAX_QTY));
}

export async function readCart(cartId: string | null): Promise<Cart> {
  if (!cartId) return { items: [], count: 0, total: 0, removed: [] };
  const rows = await prisma.cartItem.findMany({ where: { cartId }, orderBy: { id: "asc" } });
  if (!rows.length) return { items: [], count: 0, total: 0, removed: [] };
  const products = await prisma.product.findMany({ where: { slug: { in: rows.map((r) => r.slug) } } });
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const items: CartLine[] = [];
  const removed: string[] = [];
  for (const r of rows) {
    const p = bySlug.get(r.slug);
    const max = maxForStock(p?.stock);
    if (!p || max <= 0) {
      removed.push(p?.name || r.slug);
      continue;
    }
    const qty = Math.min(r.qty, max);
    const images = Array.isArray(p.images) ? (p.images as string[]) : [];
    items.push({
      slug: p.slug,
      qty,
      name: p.name,
      price: p.price,
      lineTotal: round2(p.price * qty),
      image: images[0] || `/images/${p.slug}.jpg`,
      weightKg: p.weightKg ?? null,
      stock: p.stock ?? null,
    });
  }
  const total = round2(items.reduce((s, i) => s + i.lineTotal, 0));
  const count = items.reduce((s, i) => s + i.qty, 0);
  return { items, count, total, removed };
}

export async function addToCart(cartId: string, slug: string, qty: unknown) {
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) throw new CartError("Ürün bulunamadı");
  const max = maxForStock(product.stock);
  if (max <= 0) throw new CartError("Bu ürün şu anda stokta yok");
  const existing = await prisma.cartItem.findFirst({ where: { cartId, slug } });
  const next = Math.min((existing?.qty || 0) + clampQty(qty), max);
  if (existing) {
    await prisma.cartItem.update({ where: { id: existing.id }, data: { qty: next } });
  } else {
    await prisma.cartItem.create({ data: { cartId, slug, qty: next } });
  }
}

export async function setCartQty(cartId: string, slug: string, qty: unknown) {
  const existing = await prisma.cartItem.findFirst({ where: { cartId, slug } });
  if (!existing) return;
  const product = await prisma.product.findUnique({ where: { slug } });
  const next = Math.min(clampQty(qty), maxForStock(product?.stock));
  if (next <= 0) {
    await prisma.cartItem.delete({ where: { id: existing.id } });
  } else {
    await prisma.cartItem.update({ where: { id: existing.id }, data: { qty: next } });
  }
}

export async function removeFromCart(cartId: string, slug: string) {
  await prisma.cartItem.deleteMany({ where: { cartId, slug } });
}

export async function clearCart(cartId: string | null | undefined) {
  if (!cartId) return;
  await prisma.cartItem.deleteMany({ where: { cartId } });
}

export class CartError extends Error {}

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}
