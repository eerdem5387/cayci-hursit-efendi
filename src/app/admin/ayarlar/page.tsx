"use client";
import { useEffect, useState } from "react";

type Settings = {
  site: { title: string; description: string };
  smtp: { host: string; port: number; user: string; pass: string; from: string };
  notifications?: { adminEmail?: string };
  payments: { ziraatPos: { merchantId?: string; terminalId?: string; posUrl?: string; apiUrl?: string; storeKey?: string; username?: string; password?: string; storeType?: string } };
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [testing, setTesting] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [initLogs, setInitLogs] = useState<any[]>([]);
  const [loadingInit, setLoadingInit] = useState(false);

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

  const loadLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch("/api/admin/ziraat-pos/logs", { cache: "no-store" });
      const data = await res.json();
      setLogs(Array.isArray(data?.logs) ? data.logs : []);
    } catch {}
    setLoadingLogs(false);
  };

  const clearLogs = async () => {
    await fetch("/api/admin/ziraat-pos/logs", { method: "DELETE" });
    setLogs([]);
  };

  const loadInitLogs = async () => {
    setLoadingInit(true);
    try {
      const res = await fetch("/api/admin/ziraat-pos/init-logs", { cache: "no-store" });
      const data = await res.json();
      setInitLogs(Array.isArray(data?.logs) ? data.logs : []);
    } catch {}
    setLoadingInit(false);
  };
  const clearInitLogs = async () => {
    await fetch("/api/admin/ziraat-pos/init-logs", { method: "DELETE" });
    setInitLogs([]);
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
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Ziraat POS Debug</h2>
          <div className="flex items-center gap-2">
            <button onClick={loadLogs} className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50" disabled={loadingLogs}>{loadingLogs ? "Yükleniyor…" : "Yenile"}</button>
            <button onClick={clearLogs} className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50">Temizle</button>
          </div>
        </div>
        {logs.length === 0 ? (
          <div className="text-sm text-gray-500">Kayıt yok. Callback gelince burada görünecek.</div>
        ) : (
          <div className="max-h-80 overflow-auto text-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-600">
                  <th className="py-1 pr-2">Zaman</th>
                  <th className="py-1 pr-2">Yöntem</th>
                  <th className="py-1 pr-2">Oid</th>
                  <th className="py-1 pr-2">mdStatus</th>
                  <th className="py-1 pr-2">Response</th>
                  <th className="py-1 pr-2">ProcCode</th>
                  <th className="py-1">Mesaj</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-1 pr-2">{new Date(l.ts).toLocaleString("tr-TR")}</td>
                    <td className="py-1 pr-2">{l.method}</td>
                    <td className="py-1 pr-2">{l.oid}</td>
                    <td className="py-1 pr-2">{l.mdStatus || l.data?.mdStatus || l.data?.MdStatus || ""}</td>
                    <td className="py-1 pr-2">{l.response || l.data?.Response || l.data?.response || ""}</td>
                    <td className="py-1 pr-2">{l.data?.ProcReturnCode || l.data?.procReturnCode || ""}</td>
                    <td className="py-1">{l.data?.ErrMsg || l.data?.errmsg || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Ziraat POS Init (Gönderilen Form)</h2>
          <div className="flex items-center gap-2">
            <button onClick={loadInitLogs} className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50" disabled={loadingInit}>{loadingInit ? "Yükleniyor…" : "Yenile"}</button>
            <button onClick={clearInitLogs} className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50">Temizle</button>
          </div>
        </div>
        {initLogs.length === 0 ? (
          <div className="text-sm text-gray-500">Kayıt yok.</div>
        ) : (
          <div className="max-h-80 overflow-auto text-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-600">
                  <th className="py-1 pr-2">Zaman</th>
                  <th className="py-1 pr-2">Oid</th>
                  <th className="py-1 pr-2">Tutar</th>
                  <th className="py-1 pr-2">Algoritma</th>
                  <th className="py-1 pr-2">Plain</th>
                </tr>
              </thead>
              <tbody>
                {initLogs.map((l, i) => (
                  <tr key={i} className="border-t align-top">
                    <td className="py-1 pr-2">{new Date(l.ts).toLocaleString("tr-TR")}</td>
                    <td className="py-1 pr-2">{l.oid}</td>
                    <td className="py-1 pr-2">{l.amount}</td>
                    <td className="py-1 pr-2">{l.hashAlgo}</td>
                    <td className="py-1 pr-2 break-all whitespace-pre-wrap">{l.plain}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
        <h2 className="mb-3 text-lg font-semibold">Ziraat POS (3D Pay Hosting)</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <input className="rounded border border-gray-300 px-3 py-2" value={settings.payments.ziraatPos.merchantId || ""} onChange={(e) => setSettings({ ...settings, payments: { ziraatPos: { ...settings.payments.ziraatPos, merchantId: e.target.value } } })} placeholder="Merchant ID (ClientId)" />
          <input className="rounded border border-gray-300 px-3 py-2" value={settings.payments.ziraatPos.terminalId || ""} onChange={(e) => setSettings({ ...settings, payments: { ziraatPos: { ...settings.payments.ziraatPos, terminalId: e.target.value } } })} placeholder="Terminal ID" />
          <input className="rounded border border-gray-300 px-3 py-2" value={settings.payments.ziraatPos.posUrl || ""} onChange={(e) => setSettings({ ...settings, payments: { ziraatPos: { ...settings.payments.ziraatPos, posUrl: e.target.value } } })} placeholder="3D URL (est3Dgate)" />
          <input className="rounded border border-gray-300 px-3 py-2" value={settings.payments.ziraatPos.apiUrl || ""} onChange={(e) => setSettings({ ...settings, payments: { ziraatPos: { ...settings.payments.ziraatPos, apiUrl: e.target.value } } })} placeholder="API URL (/fim/api)" />
          <input className="rounded border border-gray-300 px-3 py-2" value={settings.payments.ziraatPos.username || ""} onChange={(e) => setSettings({ ...settings, payments: { ziraatPos: { ...settings.payments.ziraatPos, username: e.target.value } } })} placeholder="Prov Kullanıcı Adı" />
          <input className="rounded border border-gray-300 px-3 py-2" type="password" value={settings.payments.ziraatPos.password || ""} onChange={(e) => setSettings({ ...settings, payments: { ziraatPos: { ...settings.payments.ziraatPos, password: e.target.value } } })} placeholder="Prov Şifre" />
          <input className="rounded border border-gray-300 px-3 py-2 md:col-span-2" value={settings.payments.ziraatPos.storeKey || ""} onChange={(e) => setSettings({ ...settings, payments: { ziraatPos: { ...settings.payments.ziraatPos, storeKey: e.target.value } } })} placeholder="Store Key (Mağaza Anahtarı)" />
          <input className="rounded border border-gray-300 px-3 py-2" value={settings.payments.ziraatPos.storeType || ""} onChange={(e) => setSettings({ ...settings, payments: { ziraatPos: { ...settings.payments.ziraatPos, storeType: e.target.value } } })} placeholder="Store Type (örn: 3d_pay_hosting)" />
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


