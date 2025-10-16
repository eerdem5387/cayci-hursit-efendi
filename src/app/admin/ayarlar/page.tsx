"use client";
import { useEffect, useState } from "react";

type Settings = {
  site: { title: string; description: string };
  smtp: { host: string; port: number; user: string; pass: string; from: string };
  notifications?: { adminEmail?: string };
  payments: { ziraatPos: { merchantId?: string; terminalId?: string; posUrl?: string } };
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then(setSettings);
  }, []);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({} as any));
      setMessage(data?.error || "Kaydedilemedi");
      return;
    }
    setMessage("Kaydedildi");
    setTimeout(() => setMessage("") ,2000);
  };

  if (!settings) return <div>Yükleniyor...</div>;

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Ayarlar</h1>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Site Kimliği</h2>
        <div className="grid gap-3">
          <input className="rounded border border-gray-300 px-3 py-2" value={settings.site.title} onChange={(e) => setSettings({ ...settings, site: { ...settings.site, title: e.target.value } })} placeholder="Site Başlığı" />
          <input className="rounded border border-gray-300 px-3 py-2" value={settings.site.description} onChange={(e) => setSettings({ ...settings, site: { ...settings.site, description: e.target.value } })} placeholder="Açıklama" />
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">SMTP</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <input className="rounded border border-gray-300 px-3 py-2" value={settings.smtp.host} onChange={(e) => setSettings({ ...settings, smtp: { ...settings.smtp, host: e.target.value } })} placeholder="Host" />
          <input className="rounded border border-gray-300 px-3 py-2" type="number" value={settings.smtp.port} onChange={(e) => setSettings({ ...settings, smtp: { ...settings.smtp, port: Number(e.target.value) } })} placeholder="Port" />
          <input className="rounded border border-gray-300 px-3 py-2" value={settings.smtp.user} onChange={(e) => setSettings({ ...settings, smtp: { ...settings.smtp, user: e.target.value } })} placeholder="Kullanıcı" />
          <input className="rounded border border-gray-300 px-3 py-2" type="password" value={settings.smtp.pass} onChange={(e) => setSettings({ ...settings, smtp: { ...settings.smtp, pass: e.target.value } })} placeholder="Parola" />
          <input className="rounded border border-gray-300 px-3 py-2 md:col-span-2" value={settings.smtp.from} onChange={(e) => setSettings({ ...settings, smtp: { ...settings.smtp, from: e.target.value } })} placeholder="Gönderen (from)" />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={async () => {
              setTesting(true);
              setMessage("");
              const res = await fetch("/api/admin/settings/test-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
              setTesting(false);
              if (!res.ok) {
                const data = await res.json().catch(() => ({} as any));
                setMessage(data?.error || "Test e-postası gönderilemedi");
                return;
              }
              setMessage("Test e-postası gönderildi");
              setTimeout(() => setMessage(""), 2000);
            }}
            className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
            disabled={testing}
          >
            {testing ? "Gönderiliyor…" : "Test E-postası Gönder"}
          </button>
          <span className="text-xs text-gray-500">Hedef: adminEmail varsa orası; yoksa SMTP from</span>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Bildirimler</h2>
        <div className="grid gap-3">
          <input className="rounded border border-gray-300 px-3 py-2" value={settings.notifications?.adminEmail || ""} onChange={(e) => setSettings({ ...settings, notifications: { ...(settings.notifications || {}), adminEmail: e.target.value } })} placeholder="Admin e-posta (sipariş bildirimi)" />
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Ödeme Entegrasyonları (Placeholder)</h2>
        <div className="grid gap-3">
          <input className="rounded border border-gray-300 px-3 py-2" value={settings.payments.ziraatPos.merchantId || ""} onChange={(e) => setSettings({ ...settings, payments: { ziraatPos: { ...settings.payments.ziraatPos, merchantId: e.target.value } } })} placeholder="Ziraat Merchant ID" />
          <input className="rounded border border-gray-300 px-3 py-2" value={settings.payments.ziraatPos.terminalId || ""} onChange={(e) => setSettings({ ...settings, payments: { ziraatPos: { ...settings.payments.ziraatPos, terminalId: e.target.value } } })} placeholder="Ziraat Terminal ID" />
          <input className="rounded border border-gray-300 px-3 py-2" value={settings.payments.ziraatPos.posUrl || ""} onChange={(e) => setSettings({ ...settings, payments: { ziraatPos: { ...settings.payments.ziraatPos, posUrl: e.target.value } } })} placeholder="Ziraat POS URL" />
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving} className="rounded-md bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800 disabled:opacity-60 transition-transform active:scale-95">
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
        {message && <span className={`text-sm ${message === "Kaydedildi" ? "text-emerald-700" : "text-red-700"}`}>{message}</span>}
      </div>
    </div>
  );
}


