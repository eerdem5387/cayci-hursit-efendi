"use client";
// Sepet değiştiğinde başlıktaki rozetin güncellenmesi için basit olay yayını.
export const CART_EVENT = "cart:changed";

export function emitCartChanged(count: number) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(CART_EVENT, { detail: { count } }));
}
