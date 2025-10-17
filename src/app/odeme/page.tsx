"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type CartItem = { slug: string; qty: number };
type Product = { id: string; name: string; slug: string; price: number; weightKg?: number | null; images?: string[] };

export default function CheckoutPage() {
  const { data: session } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [agreeGuest, setAgreeGuest] = useState(false);
  const [agreeKvkk, setAgreeKvkk] = useState(false);
  const [agreeMesafeli, setAgreeMesafeli] = useState(false);
  const [agreeIade, setAgreeIade] = useState(false);
  const [formData, setFormData] = useState({
    ad: "",
    email: "",
    adres: "",
    sehir: "",
    telefon: "",
    kartNo: "",
    kartAd: "",
    sonKullanim: "",
    cvv: ""
  });

  // Kart numarası formatlama (4'lü gruplar halinde)
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ').slice(0, 19); // 16 haneli kart + 3 boşluk
  };

  // Son kullanım tarihi formatlama (MM/YY)
  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  // CVV formatlama (sadece 3-4 hane)
  const formatCVV = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 4);
  };

  // Telefon formatlama (0XXX XXX XX XX)
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return cleaned.slice(0, 3) + ' ' + cleaned.slice(3);
    if (cleaned.length <= 8) return cleaned.slice(0, 3) + ' ' + cleaned.slice(3, 6) + ' ' + cleaned.slice(6);
    return cleaned.slice(0, 3) + ' ' + cleaned.slice(3, 6) + ' ' + cleaned.slice(6, 8) + ' ' + cleaned.slice(8, 10);
  };

  useEffect(() => {
    fetch("/api/cart").then(r => r.json()).then(setCartItems);
    fetch("/api/products").then(r => r.json()).then(setProducts);
  }, []);

  // Oturum açmış kullanıcı varsa ad ve e-postayı doldur
  useEffect(() => {
    const user = (session as any)?.user;
    if (user) {
      setFormData((fd) => ({
        ...fd,
        ad: user.name || fd.ad,
        email: user.email || fd.email,
      }));
      // Checkbox görünmeyecek; validasyon takılmaması için true
      setAgreeGuest(true);
    }
  }, [session]);

  const getProduct = (slug: string) => products.find(p => p.slug === slug);
  const total = cartItems.reduce((sum, item) => {
    const product = getProduct(item.slug);
    return sum + (product?.price || 0) * item.qty;
  }, 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      alert("Lütfen e‑posta adresinizi giriniz.");
      return;
    }
    const isLoggedIn = !!(session as any)?.user;
    if (!isLoggedIn && !agreeGuest) {
      alert("Lütfen üye olmadan devam ettiğinizi onaylayın.");
      return;
    }
    if (!agreeKvkk || !agreeMesafeli || !agreeIade) {
      alert("Lütfen KVKK, Mesafeli Satış Sözleşmesi ve İade/İptal koşullarını onaylayın.");
      return;
    }

    setSubmitting(true);
    try {
      const isLoggedIn = !!(session as any)?.user;
      let res: Response;
      if (isLoggedIn) {
        const fd = new FormData();
        fd.set("ad", formData.ad);
        fd.set("email", formData.email);
        fd.set("telefon", formData.telefon);
        fd.set("sehir", formData.sehir);
        fd.set("adres", formData.adres);
        fd.set("kartAd", formData.kartAd);
        fd.set("kartNo", formData.kartNo);
        fd.set("sonKullanim", formData.sonKullanim);
        fd.set("cvv", formData.cvv);
        res = await fetch("/api/orders", { method: "POST", body: fd });
      } else {
        const payload = {
          name: formData.ad,
          email: formData.email,
          phone: formData.telefon,
          address: formData.adres,
          city: formData.sehir,
          items: cartItems.map(ci => ({ slug: ci.slug, qty: ci.qty })),
          total,
          shipping: {
            name: formData.ad,
            phone: formData.telefon,
            address: formData.adres,
            city: formData.sehir,
          },
        };
        res = await fetch("/api/orders/guest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        throw new Error(err?.error || "Sipariş oluşturulamadı");
      }
      const data = await res.json();
      const guestFlag = isLoggedIn ? "0" : "1";
      window.location.href = "/tesekkurler?guest=" + guestFlag + "&oid=" + encodeURIComponent(data.orderId);
    } catch (err: any) {
      alert(err?.message || "Bir hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">Sepetiniz boş</div>
          <Link href="/urunlerimiz" className="inline-block rounded bg-emerald-700 px-6 py-3 text-white hover:bg-emerald-800">
            Alışverişe Devam Et
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Ödeme</h1>
      
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <form onSubmit={submit} className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Teslimat Bilgileri</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad *</label>
                  <input 
                    name="ad" 
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                    placeholder="Ad Soyad" 
                    value={formData.ad}
                    onChange={(e) => setFormData({...formData, ad: e.target.value})}
                    required 
                    readOnly={!!session}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-posta *</label>
                  <input 
                    name="email" 
                    type="email" 
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                    placeholder="E-posta" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required 
                    readOnly={!!session}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
                  <input 
                    name="telefon" 
                    type="tel"
                    maxLength={14}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                    placeholder="0XXX XXX XX XX" 
                    value={formData.telefon}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      setFormData({...formData, telefon: formatted});
                    }}
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Şehir *</label>
                  <input 
                    name="sehir" 
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                    placeholder="Şehir" 
                    value={formData.sehir}
                    onChange={(e) => setFormData({...formData, sehir: e.target.value})}
                    required 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adres *</label>
                  <textarea 
                    name="adres" 
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                    placeholder="Tam adres" 
                    value={formData.adres}
                    onChange={(e) => setFormData({...formData, adres: e.target.value})}
                    required 
                  />
                </div>
              </div>
              {!session && (
                <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-amber-900">
                  <input id="guest-ok" type="checkbox" className="mt-1" checked={agreeGuest} onChange={(e)=>setAgreeGuest(e.target.checked)} />
                  <label htmlFor="guest-ok" className="text-sm">
                    Üye olmadan devam ettiğimin farkındayım. Siparişimi e‑posta yoluyla takip edeceğim.
                  </label>
                </div>
              )}
              <div className="mt-4 space-y-2 rounded-lg bg-gray-50 p-3 text-gray-800">
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" className="mt-1" checked={agreeKvkk} onChange={(e)=>setAgreeKvkk(e.target.checked)} />
                  <span>
                    <a className="text-emerald-700 hover:underline" href="/kvkk-aydinlatma-metni" target="_blank">KVKK Aydınlatma Metni</a>'ni okudum ve kabul ediyorum.
                  </span>
                </label>
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" className="mt-1" checked={agreeMesafeli} onChange={(e)=>setAgreeMesafeli(e.target.checked)} />
                  <span>
                    <a className="text-emerald-700 hover:underline" href="/mesafeli-satis-sozlesmesi" target="_blank">Mesafeli Satış Sözleşmesi</a>'ni okudum ve kabul ediyorum.
                  </span>
                </label>
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" className="mt-1" checked={agreeIade} onChange={(e)=>setAgreeIade(e.target.checked)} />
                  <span>
                    <a className="text-emerald-700 hover:underline" href="/iade-iptal-kosullari" target="_blank">İade ve İptal Koşulları</a>'nı okudum ve kabul ediyorum.
                  </span>
                </label>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Ödeme Bilgileri</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kart Üzerindeki İsim *</label>
                  <input 
                    name="kartAd" 
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                    placeholder="Kart üzerindeki isim" 
                    value={formData.kartAd}
                    onChange={(e) => setFormData({...formData, kartAd: e.target.value})}
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kart Numarası *</label>
                  <input 
                    name="kartNo" 
                    type="text"
                    maxLength={19}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                    placeholder="1234 5678 9012 3456" 
                    value={formData.kartNo}
                    onChange={(e) => {
                      const formatted = formatCardNumber(e.target.value);
                      setFormData({...formData, kartNo: formatted});
                    }}
                    required 
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Son Kullanım Tarihi *</label>
                    <input 
                      name="sonKullanim" 
                      type="text"
                      maxLength={5}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                      placeholder="MM/YY" 
                      value={formData.sonKullanim}
                      onChange={(e) => {
                        const formatted = formatExpiryDate(e.target.value);
                        setFormData({...formData, sonKullanim: formatted});
                      }}
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV *</label>
                    <input 
                      name="cvv" 
                      type="password"
                      maxLength={4}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                      placeholder="123" 
                      value={formData.cvv}
                      onChange={(e) => {
                        const formatted = formatCVV(e.target.value);
                        setFormData({...formData, cvv: formatted});
                      }}
                      required 
                    />
                  </div>
                </div>
              </div>
            </div>

            <button 
              disabled={submitting} 
              className="w-full rounded-lg bg-emerald-700 px-6 py-3 text-lg font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              {submitting ? "Sipariş Oluşturuluyor..." : "Siparişi Tamamla"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Sipariş Özeti</h3>
            <div className="space-y-3">
              {cartItems.map((item) => {
                const product = getProduct(item.slug);
                if (!product) return null;
                return (
                  <div key={item.slug} className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
                      <img 
                        src={product.images?.[0] || `/images/${product.slug}.jpg`} 
                        alt={product.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{product.name}</div>
                      {product.weightKg && (
                        <div className="text-xs text-gray-600">{product.weightKg} kg</div>
                      )}
                      <div className="text-sm text-gray-600">Adet: {item.qty}</div>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {(product.price * item.qty).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 space-y-2 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-sm">
                <span>Ara Toplam</span>
                <span>{total.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Kargo</span>
                <span className="text-emerald-700">Ücretsiz</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Toplam</span>
                <span className="text-emerald-700">{total.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


