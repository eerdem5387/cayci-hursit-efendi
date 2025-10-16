import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { sendMail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Yetkisiz" }, { status: 401 });
  }
  const { to } = await req.json().catch(() => ({ to: null }));
  const settings = await getSettings();
  const target = String(to || settings.notifications?.adminEmail || settings.smtp.from || "").trim();
  if (!target) return NextResponse.json({ ok: false, error: "Hedef e-posta bulunamadı" }, { status: 400 });
  const subject = `${settings.site?.title || "Site"} – Test E-postası`;
  const html = `<p>Bu bir test e-postasıdır.<br/>Gönderen: ${settings.smtp.from || "(tanımsız)"}</p>`;
  await sendMail(target, subject, html);
  return NextResponse.json({ ok: true });
}


