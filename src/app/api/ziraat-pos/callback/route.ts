import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSettings } from "@/lib/data";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const data: Record<string, string> = {};
    for (const [k, v] of form.entries()) data[String(k)] = String(v);

    const settings = await getSettings();
    const storeKey = settings.payments.ziraatPos.storeKey || "";

    // mdStatus 1,2,3,4 bazı bankalarda başarılı sayılır; burada en sık kullanılan '1' e bakıyoruz
    const mdStatus = data["mdStatus"] || data["MdStatus"] || "";
    const response = data["Response"] || data["response"] || "";
    const prc = data["ProcReturnCode"] || data["procReturnCode"] || "";

    // HASH doğrulama (NestPay dönüşünde HASHSTR + storeKey -> SHA1 base64)
    const incomingHash = data["HASH"] || data["hash"] || "";
    const hashStr = data["HASHSTR"] || data["hashstr"] || "";
    let verified = false;
    if (hashStr && storeKey) {
      const calc = crypto.createHash("sha1").update(hashStr + storeKey).digest("base64");
      verified = calc === incomingHash;
    }

    const oid = data["oid"] || data["OID"] || data["OrderId"] || "";

    if (verified && (mdStatus === "1") && (response.toLowerCase() === "approved")) {
      if (oid) {
        await prisma.order.updateMany({ where: { id: oid }, data: { status: "paid" } });
      }
      return NextResponse.redirect((process.env.NEXT_PUBLIC_SITE_URL || "https://www.caycihursitefendi.com") + `/tesekkurler?oid=${encodeURIComponent(oid)}&paid=1&mdStatus=${encodeURIComponent(mdStatus)}&resp=${encodeURIComponent(response)}&prc=${encodeURIComponent(prc)}`, 303);
    }

    // Başarısız ise beklenen redirect
    const msg = data["ErrMsg"] || data["errmsg"] || "Ödeme doğrulanamadı";
    return NextResponse.redirect((process.env.NEXT_PUBLIC_SITE_URL || "https://www.caycihursitefendi.com") + `/tesekkurler?oid=${encodeURIComponent(oid)}&paid=0&msg=${encodeURIComponent(msg)}&mdStatus=${encodeURIComponent(mdStatus)}&resp=${encodeURIComponent(response)}&prc=${encodeURIComponent(prc)}`, 303);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Callback error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const data: Record<string, string> = {};
    url.searchParams.forEach((v, k) => (data[k] = v));

    const settings = await getSettings();
    const storeKey = settings.payments.ziraatPos.storeKey || "";

    const mdStatus = data["mdStatus"] || data["MdStatus"] || "";
    const response = data["Response"] || data["response"] || "";
    const prc = data["ProcReturnCode"] || data["procReturnCode"] || "";
    const incomingHash = data["HASH"] || data["hash"] || "";
    const hashStr = data["HASHSTR"] || data["hashstr"] || "";
    let verified = false;
    if (hashStr && storeKey) {
      const calc = crypto.createHash("sha1").update(hashStr + storeKey).digest("base64");
      verified = calc === incomingHash;
    }
    const oid = data["oid"] || data["OID"] || data["OrderId"] || "";

    if (verified && (mdStatus === "1") && (response.toLowerCase() === "approved")) {
      if (oid) {
        await prisma.order.updateMany({ where: { id: oid }, data: { status: "paid" } });
      }
      return NextResponse.redirect((process.env.NEXT_PUBLIC_SITE_URL || "https://www.caycihursitefendi.com") + `/tesekkurler?oid=${encodeURIComponent(oid)}&paid=1&mdStatus=${encodeURIComponent(mdStatus)}&resp=${encodeURIComponent(response)}&prc=${encodeURIComponent(prc)}`, 303);
    }

    const msg = data["ErrMsg"] || data["errmsg"] || "Ödeme doğrulanamadı";
    return NextResponse.redirect((process.env.NEXT_PUBLIC_SITE_URL || "https://www.caycihursitefendi.com") + `/tesekkurler?oid=${encodeURIComponent(oid)}&paid=0&msg=${encodeURIComponent(msg)}&mdStatus=${encodeURIComponent(mdStatus)}&resp=${encodeURIComponent(response)}&prc=${encodeURIComponent(prc)}`, 303);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Callback error" }, { status: 500 });
  }
}


