"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { emitCartChanged } from "@/lib/cartClient";

/** Ödeme başarılıysa başlıktaki sepet rozetini sıfırlar ve kayıtlı formu temizler. */
export function PaidEffects() {
  useEffect(() => {
    emitCartChanged(0);
    try { localStorage.removeItem("chf_checkout_form"); } catch { /* yoksay */ }
  }, []);
  return null;
}

/** Banka cevabı henüz işlenmediyse birkaç kez sayfayı yeniler. */
export function PendingPoller({ maxTries = 10, intervalMs = 3000 }: { maxTries?: number; intervalMs?: number }) {
  const router = useRouter();
  const [tries, setTries] = useState(0);
  useEffect(() => {
    if (tries >= maxTries) return;
    const t = setTimeout(() => { router.refresh(); setTries((n) => n + 1); }, intervalMs);
    return () => clearTimeout(t);
  }, [tries, maxTries, intervalMs, router]);
  if (tries >= maxTries) {
    return <p className="mt-3 text-sm text-gray-600">Banka cevabı henüz ulaşmadı. Ödeme yaptıysanız birkaç dakika içinde e-posta ile bilgilendirileceksiniz.</p>;
  }
  return <p className="mt-3 text-sm text-gray-500">Sonuç kontrol ediliyor…</p>;
}
