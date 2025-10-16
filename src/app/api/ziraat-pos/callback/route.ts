import { NextRequest, NextResponse } from "next/server";

// Ziraat 3DS/ödeme dönüş callback stub'ı.
// Banka dönüş parametrelerini doğrulayıp ilgili siparişi güncellemek gerekir.
// Şimdilik sadece gelen parametreleri döner.
export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const data: Record<string, any> = {};
  if (form) {
    for (const [k, v] of form.entries()) data[k] = v;
  }
  return NextResponse.json({ ok: true, received: data });
}


