"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import CheckoutSteps from "@/components/CheckoutSteps";
import { emitCartChanged } from "@/lib/cartClient";
import { formatTRY } from "@/lib/orderStatus";

type Line = { slug: string; qty: number; name: string; price: number; lineTotal: number; image: string; weightKg: number | null };
type Cart = { items: Line[]; count: number; total: number; removed: string[] };
type FieldKey = "ad" | "email" | "telefon" | "sehir" | "adres" | "sozlesme";

const STORAGE_KEY = "chf_checkout_form";

function formatPhone(value: string) {
  let d = value.replace(/\D/g, "");
  if (d.startsWith("90")) d = d.slice(2);
  if (d && !d.startsWith("0")) d = "0" + d;
  d = d.slice(0, 11);
  const parts = [d.slice(0, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)].filter(Boolean);
  return parts.join(" ");
}

function validate(f: { ad: string; email: string; telefon: string; sehir: string; adres: string }, sozlesme: boolean) {
  const e: Partial<Record<FieldKey, string>> = {};
  if (f.ad.trim().length < 3 || !f.ad.trim().includes(" ")) e.ad = "Lütfen adınızı ve soyadınızı yazın.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "Geçerli bir e-posta adresi girin.";
  const p = f.telefon.replace(/\D/g, "").replace(/^0/, "");
  if (!/^[2-5]\d{9}$/.test(p)) e.telefon = "Geçerli bir telefon numarası girin (05XX XXX XX XX).";
  if (f.sehir.trim().length < 2) e.sehir = "İl / ilçe bilgisini girin.";
  if (f.adres.trim().length < 10) e.adres = "Lütfen açık adresinizi (mahalle, sokak, no) yazın.";
  if (!sozlesme) e.sozlesme = "Devam etmek için sözleşmeleri onaylamanız gerekiyor.";
  return e;
}

export default function CheckoutPage() {
  const { data: session, status: sessionStatus } = useSession();
  const user = (session as any)?.user as { name?: string; email?: string } | undefined;
  const [cart, setCart] = useState<Cart | null>(null);
  const [form, setForm] = useState({ ad: "", email: "", telefon: "", sehir: "", adres: "" });
  const [sozlesme, setSozlesme] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "submitting" | "redirecting">("idle");
  const formRef = useRef<HTMLFormElement>(null);

  const loadCart = () =>
    fetch("/api/cart", { cache: "no-store" })
      .then((r) => r.json())
      .then((c: Cart) => { setCart(c); emitCartChanged(c.count); return c; })
      .catch(() => { setCart({ items: [], count: 0, total: 0, removed: [] }); return null; });

  useEffect(() => {
    loadCart();
    // Daha önce girilen teslimat bilgilerini geri getir (ör. başarısız ödemeden sonra tekrar denerken)
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && typeof saved === "object") setForm((f) => ({ ...f, ...pickForm(saved) }));
    } catch { /* yoksay */ }
    // Bankadan "geri" tuşuyla dönülürse sayfa önbellekten gelir: kilidi kaldır
    const onShow = (e: PageTransitionEvent) => { if (e.persisted) { setPhase("idle"); loadCart(); } };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, ad: f.ad || user.name || "", email: user.email || f.email }));
  }, [user?.email, user?.name]);

  const set = (k: keyof typeof form, v: string) => {
    const next = { ...form, [k]: v };
    setForm(next);
    if (touched[k]) setErrors((e) => ({ ...e, [k]: validate(next, sozlesme)[k] }));
  };
  const blur = (k: FieldKey) => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors((e) => ({ ...e, [k]: validate(form, sozlesme)[k] }));
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (phase !== "idle" || !cart) return;
    setBanner(null);
    const v = validate(form, sozlesme);
    setErrors(v);
    setTouched({ ad: true, email: true, telefon: true, sehir: true, adres: true, sozlesme: true });
    if (Object.keys(v).length) {
      const first = formRef.current?.querySelector<HTMLElement>(`[name="${Object.keys(v)[0]}"]`);
      first?.focus();
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(form)); } catch { /* yoksay */ }

    setPhase("submitting");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sozlesme, expectedTotal: cart.total }),
      });
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok || !data?.ok) {
        if (data?.fields) setErrors(data.fields);
        if (data?.code === "TOTAL_CHANGED" || data?.code === "CART_CHANGED" || data?.code === "EMPTY_CART") await loadCart();
        setBanner(data?.error || "Ödeme başlatılamadı. Lütfen tekrar deneyin.");
        setPhase("idle");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setPhase("redirecting");
      const f = document.createElement("form");
      f.method = "POST";
      f.action = data.action;
      f.style.display = "none";
      Object.entries(data.params || {}).forEach(([k, val]) => {
        const inp = document.createElement("input");
        inp.type = "hidden";
        inp.name = k;
        inp.value = String(val);
        f.appendChild(inp);
      });
      document.body.appendChild(f);
      f.submit();
      // Not: Buradan sonra sayfa bankaya geçer; buton kilitli kalır (çift sipariş oluşmasın).
    } catch {
      setBanner("Bağlantı hatası oluştu. İnternet bağlantınızı kontrol edip tekrar deneyin.");
      setPhase("idle");
    }
  };

  if (!cart || sessionStatus === "loading") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="h-96 animate-pulse rounded-xl bg-gray-100 lg:col-span-2" />
          <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
        </div>
      </div>
    );
  }

  if (cart.items.length === 0 && phase === "idle") {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Sepetiniz boş</h1>
        <p className="mb-6 text-gray-600">Ödeme adımına geçmek için önce sepetinize ürün ekleyin.</p>
        <Link href="/urunlerimiz" className="inline-block rounded-lg bg-emerald-700 px-6 py-3 font-medium text-white hover:bg-emerald-800">Ürünlere Göz At</Link>
      </div>
    );
  }

  const inputCls = (k: FieldKey) =>
    `w-full rounded-lg border px-4 py-3 text-base transition-colors focus:outline-none focus:ring-2 ${
      errors[k] && touched[k] ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-gray-300 focus:border-emerald-500 focus:ring-emerald-100"
    }`;
  const Err = ({ k }: { k: FieldKey }) =>
    errors[k] && touched[k] ? <p id={`${k}-err`} className="mt-1.5 text-sm text-red-600">{errors[k]}</p> : null;
  const locked = phase !== "idle";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10 md:px-6">
      <CheckoutSteps current={1} />
      <h1 className="mb-6 text-2xl font-bold text-gray-900 sm:text-3xl">Teslimat ve Ödeme</h1>

      {banner && (
        <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{banner}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <form ref={formRef} onSubmit={submit} noValidate className="space-y-6 lg:col-span-2">
          {!user && (
            <div className="flex flex-col gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-900 sm:flex-row sm:items-center sm:justify-between">
              <span>Üye olmadan sipariş verebilirsiniz. Sipariş takibiniz e-posta ile yapılır.</span>
              <Link href="/auth/signin?callbackUrl=/odeme" className="font-semibold text-emerald-800 underline underline-offset-2">Giriş yap</Link>
            </div>
          )}

          <fieldset disabled={locked} className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
            <legend className="sr-only">Teslimat Bilgileri</legend>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Teslimat Bilgileri</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="ad" className="mb-1.5 block text-sm font-medium text-gray-700">Ad Soyad</label>
                <input id="ad" name="ad" autoComplete="name" className={inputCls("ad")} value={form.ad}
                  onChange={(e) => set("ad", e.target.value)} onBlur={() => blur("ad")} aria-invalid={!!errors.ad} aria-describedby="ad-err" />
                <Err k="ad" />
              </div>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">E-posta</label>
                <input id="email" name="email" type="email" inputMode="email" autoComplete="email" className={`${inputCls("email")} ${user ? "bg-gray-50 text-gray-600" : ""}`}
                  value={form.email} readOnly={!!user} onChange={(e) => set("email", e.target.value)} onBlur={() => blur("email")}
                  aria-invalid={!!errors.email} aria-describedby="email-err" />
                <Err k="email" />
                {!errors.email && <p className="mt-1.5 text-xs text-gray-500">Sipariş onayı ve kargo bilgisi bu adrese gönderilir.</p>}
              </div>
              <div>
                <label htmlFor="telefon" className="mb-1.5 block text-sm font-medium text-gray-700">Cep Telefonu</label>
                <input id="telefon" name="telefon" type="tel" inputMode="tel" autoComplete="tel" placeholder="05XX XXX XX XX" className={inputCls("telefon")}
                  value={form.telefon} onChange={(e) => set("telefon", formatPhone(e.target.value))} onBlur={() => blur("telefon")}
                  aria-invalid={!!errors.telefon} aria-describedby="telefon-err" />
                <Err k="telefon" />
              </div>
              <div>
                <label htmlFor="sehir" className="mb-1.5 block text-sm font-medium text-gray-700">İl / İlçe</label>
                <input id="sehir" name="sehir" autoComplete="address-level1" placeholder="Örn. İstanbul / Kadıköy" className={inputCls("sehir")}
                  value={form.sehir} onChange={(e) => set("sehir", e.target.value)} onBlur={() => blur("sehir")}
                  aria-invalid={!!errors.sehir} aria-describedby="sehir-err" />
                <Err k="sehir" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="adres" className="mb-1.5 block text-sm font-medium text-gray-700">Açık Adres</label>
                <textarea id="adres" name="adres" rows={3} autoComplete="street-address" placeholder="Mahalle, cadde/sokak, bina ve daire no"
                  className={`${inputCls("adres")} resize-none`} value={form.adres} onChange={(e) => set("adres", e.target.value)} onBlur={() => blur("adres")}
                  aria-invalid={!!errors.adres} aria-describedby="adres-err" />
                <Err k="adres" />
              </div>
            </div>
          </fieldset>

          <fieldset disabled={locked} className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
            <legend className="sr-only">Ödeme</legend>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Ödeme</h2>
            <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
              <svg className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              <div>
                <div className="font-medium text-gray-900">Kredi / Banka Kartı – Ziraat Bankası 3D Secure</div>
                <p className="mt-1">Butona bastığınızda Ziraat Bankası&apos;nın güvenli ödeme sayfasına yönlendirileceksiniz. Kart bilgilerinizi orada girip bankanızdan gelen SMS şifresiyle onaylayacaksınız. Kart bilgileriniz sitemize iletilmez ve saklanmaz.</p>
              </div>
            </div>

            <label className={`mt-4 flex cursor-pointer items-start gap-3 rounded-lg p-1 text-sm ${errors.sozlesme && touched.sozlesme ? "text-red-700" : "text-gray-800"}`}>
              <input type="checkbox" name="sozlesme" className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-emerald-700" checked={sozlesme}
                onChange={(e) => { setSozlesme(e.target.checked); setErrors((x) => ({ ...x, sozlesme: e.target.checked ? undefined : x.sozlesme })); }} />
              <span className="leading-relaxed">
                <a className="font-medium text-emerald-700 underline-offset-2 hover:underline" href="/mesafeli-satis-sozlesmesi" target="_blank" rel="noopener noreferrer">Mesafeli Satış Sözleşmesi</a>&apos;ni ve{" "}
                <a className="font-medium text-emerald-700 underline-offset-2 hover:underline" href="/iade-iptal-kosullari" target="_blank" rel="noopener noreferrer">İade ve İptal Koşulları</a>&apos;nı okudum, kabul ediyorum.
              </span>
            </label>
            <Err k="sozlesme" />
            <p className="mt-2 pl-9 text-xs text-gray-500">
              Kişisel verileriniz <a className="underline underline-offset-2" href="/kvkk-aydinlatma-metni" target="_blank" rel="noopener noreferrer">KVKK Aydınlatma Metni</a> kapsamında işlenir.
            </p>
          </fieldset>

          <button
            type="submit"
            disabled={locked}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-emerald-800 active:bg-emerald-900 disabled:cursor-wait disabled:opacity-70 sm:text-lg"
          >
            {locked ? (
              <><Spinner /> {phase === "redirecting" ? "Bankaya yönlendiriliyorsunuz…" : "Hazırlanıyor…"}</>
            ) : (
              <>Güvenli Ödemeye Geç · {formatTRY(cart.total)}</>
            )}
          </button>
          <Link href="/sepet" className="block text-center text-sm font-medium text-emerald-700 hover:text-emerald-800">← Sepete dön</Link>
        </form>

        <aside className="lg:col-span-1">
          <div className="sticky top-28 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Sipariş Özeti</h2>
              <Link href="/sepet" className="text-sm font-medium text-emerald-700 hover:underline">Düzenle</Link>
            </div>
            <ul className="max-h-[360px] space-y-3 overflow-y-auto">
              {cart.items.map((item) => (
                <li key={item.slug} className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
                    <span className="absolute -right-0 -top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-700 px-1 text-[11px] font-bold text-white">{item.qty}</span>
                  </div>
                  <div className="min-w-0 flex-1 text-sm">
                    <div className="line-clamp-2 font-medium text-gray-900">{item.name}</div>
                    {item.weightKg ? <div className="text-xs text-gray-500">{item.weightKg} kg</div> : null}
                  </div>
                  <div className="whitespace-nowrap text-sm font-medium text-gray-900">{formatTRY(item.lineTotal)}</div>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-gray-200 pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-gray-600">Ara toplam</dt><dd className="font-medium">{formatTRY(cart.total)}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-600">Kargo</dt><dd className="font-medium text-emerald-700">Ücretsiz</dd></div>
              <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-bold"><dt>Toplam</dt><dd className="text-emerald-700">{formatTRY(cart.total)}</dd></div>
            </dl>
          </div>
        </aside>
      </div>

      {phase === "redirecting" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 px-6 backdrop-blur-sm" role="alertdialog" aria-live="assertive">
          <div className="max-w-sm text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50"><Spinner className="h-7 w-7 text-emerald-700" /></div>
            <div className="text-lg font-semibold text-gray-900">Güvenli ödeme sayfası açılıyor</div>
            <p className="mt-2 text-sm text-gray-600">Ziraat Bankası 3D Secure sayfasına yönlendiriliyorsunuz. Lütfen sayfayı kapatmayın.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function pickForm(o: any) {
  const out: Record<string, string> = {};
  for (const k of ["ad", "email", "telefon", "sehir", "adres"]) if (typeof o[k] === "string") out[k] = o[k];
  return out;
}

function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}
