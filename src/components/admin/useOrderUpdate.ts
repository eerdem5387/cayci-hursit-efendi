"use client";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { StatusPayload } from "./StatusDialog";

/** Sipariş güncelleme isteği + basit bildirim (toast) durumu */
export function useOrderUpdate(onDone: () => void) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  const show = useCallback((tone: "ok" | "err", text: string) => {
    setToast({ tone, text });
    setTimeout(() => setToast((t) => (t?.text === text ? null : t)), 4000);
  }, []);

  const update = useCallback(
    async (ids: string[], payload: Partial<StatusPayload> & { adminNote?: string }, successText?: string) => {
      setBusy(true);
      try {
        const res = await fetch("/api/orders", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids, ...payload }),
        });
        const d = await res.json().catch(() => ({} as any));
        if (!res.ok || d?.error) show("err", d?.error || "Güncellenemedi");
        else show("ok", successText || (ids.length > 1 ? `${d.updated} sipariş güncellendi` : "Kaydedildi"));
        onDone();
        router.refresh(); // menüdeki sipariş rozetlerini güncelle
        return !!d?.ok;
      } catch {
        show("err", "Bağlantı hatası");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [onDone, show, router]
  );

  return { busy, toast, update, show };
}
