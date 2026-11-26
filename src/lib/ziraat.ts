import crypto from "crypto";
import { getSettings } from "@/lib/data";
import { prisma } from "@/lib/db";

// Ziraat Bankası (Nestpay / EST) 3D Pay Hosting – hash ver3 yardımcıları.
// Kart bilgileri sitemize hiç gelmez; müşteri kartını bankanın sayfasında girer.

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://www.caycihursitefendi.com").replace(/\/+$/, "");
}

function esc(v: string) {
  return String(v ?? "").replace(/\\/g, "\\\\").replace(/\|/g, "\\|");
}

function sortKeys(keys: string[]) {
  return keys.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase(), undefined, { numeric: true, sensitivity: "base" }));
}

/** ver3: alanlar (hash/encoding hariç) doğal, büyük-küçük harf duyarsız sıralanır, '|' ile birleştirilir, storeKey eklenir → SHA512 → base64 */
export function ver3Hash(fields: Record<string, string>, storeKey: string, exclude: string[] = ["hash", "encoding"]) {
  const keys = sortKeys(Object.keys(fields).filter((k) => !exclude.includes(k.toLowerCase())));
  const plain = keys.map((k) => esc(fields[k])).join("|") + "|" + esc(storeKey);
  return crypto.createHash("sha512").update(plain, "utf8").digest("base64");
}

export async function getZiraatConfig() {
  const settings = await getSettings();
  const z = (settings.payments?.ziraatPos || {}) as any;
  return {
    merchantId: String(z.merchantId || ""),
    posUrl: String(z.posUrl || ""),
    storeKey: String(z.storeKey || ""),
    storeType: String(z.storeType || "3d_pay_hosting"),
  };
}

export async function buildPaymentForm(opts: { orderId: string; amount: number }) {
  const cfg = await getZiraatConfig();
  if (!cfg.merchantId || !cfg.posUrl || !cfg.storeKey) {
    throw new Error("Ödeme altyapısı yapılandırılmamış");
  }
  const callbackUrl = `${siteUrl()}/api/ziraat-pos/callback`;
  const action = cfg.posUrl.startsWith("http") ? cfg.posUrl : `https://${cfg.posUrl}`;
  const amount = opts.amount.toFixed(2);
  const base: Record<string, string> = {
    amount,
    callbackUrl,
    clientid: cfg.merchantId,
    currency: "949",
    failUrl: callbackUrl,
    hashAlgorithm: "ver3",
    Instalment: "",
    lang: "tr",
    okurl: callbackUrl,
    oid: opts.orderId,
    rnd: String(Date.now()),
    storetype: cfg.storeType,
    TranType: "Auth",
    encoding: "utf-8",
  };
  const hash = ver3Hash(base, cfg.storeKey);
  const params = { ...base, hash, HASH: hash };

  // Teşhis için son 50 istek (storeKey ve hash içermez)
  await appendLog("ziraatPosInitLogs", { ts: Date.now(), oid: opts.orderId, amount, action, hashAlgo: "ver3" });

  return { action, params };
}

export function verifyCallbackHash(data: Record<string, string>, storeKey: string) {
  const incoming = data["HASH"] || data["hash"] || "";
  if (!incoming || !storeKey) return false;
  const calc = ver3Hash(data, storeKey, ["hash", "encoding", "countdown"]);
  const a = Buffer.from(incoming);
  const b = Buffer.from(calc);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const PROC_MESSAGES: Record<string, string> = {
  "05": "Bankanız işlemi onaylamadı. Lütfen bankanızla görüşün veya başka bir kart deneyin.",
  "12": "Geçersiz işlem. Lütfen kart bilgilerinizi kontrol edip tekrar deneyin.",
  "13": "Geçersiz tutar.",
  "14": "Kart numarası geçersiz. Lütfen kart bilgilerinizi kontrol edin.",
  "15": "Kartınızın bankası bulunamadı.",
  "33": "Kartınızın son kullanma tarihi geçmiş.",
  "41": "Kartınız bankanız tarafından reddedildi.",
  "43": "Kartınız bankanız tarafından reddedildi.",
  "51": "Kartınızın limiti veya bakiyesi yetersiz.",
  "54": "Kartınızın son kullanma tarihi geçmiş.",
  "55": "Kart şifresi hatalı.",
  "57": "Kartınız bu işleme kapalı. İnternet alışverişi izninizi bankanızdan kontrol edin.",
  "58": "Kartınız bu işleme kapalı. İnternet alışverişi izninizi bankanızdan kontrol edin.",
  "61": "Kartınızın işlem limiti aşıldı.",
  "62": "Kartınız kısıtlı. Lütfen bankanızla görüşün.",
  "65": "Günlük işlem limitiniz aşıldı.",
  "82": "CVV/güvenlik kodu hatalı.",
  "91": "Bankanıza şu anda ulaşılamıyor. Lütfen birkaç dakika sonra tekrar deneyin.",
  "96": "Banka sisteminde geçici bir sorun oluştu. Lütfen tekrar deneyin.",
  "99": "Banka sisteminde geçici bir sorun oluştu. Lütfen tekrar deneyin.",
};

/** Bankadan gelen cevabı müşterinin anlayacağı bir açıklamaya çevirir */
export function describeFailure(data: Record<string, string>) {
  const prc = data["ProcReturnCode"] || data["procReturnCode"] || "";
  const md = data["mdStatus"] || data["MdStatus"] || "";
  if (prc && PROC_MESSAGES[prc]) return PROC_MESSAGES[prc];
  if (md === "0") return "3D Secure doğrulaması tamamlanamadı. SMS şifresi hatalı girilmiş veya işlem iptal edilmiş olabilir.";
  if (["5", "6", "7", "8"].includes(md)) return "Kartınız için 3D Secure doğrulaması yapılamadı. Lütfen başka bir kart deneyin veya bankanızla görüşün.";
  const err = (data["ErrMsg"] || data["errmsg"] || data["mdErrorMsg"] || "").trim();
  if (err) return err;
  return "Ödeme işlemi tamamlanamadı.";
}

export async function appendLog(key: string, entry: any) {
  try {
    const row = await prisma.settingKV.findUnique({ where: { key } });
    const arr = Array.isArray((row as any)?.value) ? ((row as any).value as any[]) : [];
    arr.unshift(entry);
    const trimmed = arr.slice(0, 100);
    await prisma.settingKV.upsert({ where: { key }, update: { value: trimmed as any }, create: { key, value: trimmed as any } });
  } catch {
    // log hatası akışı bozmasın
  }
}
