import { redirect } from "next/navigation";

// Eski sonuç sayfası. Ödeme sonucu artık /odeme/sonuc'ta gerçek sipariş durumuyla gösteriliyor.
export default function ThanksPage() {
  redirect("/odeme/sonuc");
}
