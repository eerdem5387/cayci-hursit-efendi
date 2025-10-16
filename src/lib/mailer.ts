import nodemailer from "nodemailer";
import { getSettings } from "@/lib/data";

export async function createTransport() {
    const s = (await getSettings()).smtp;
    return nodemailer.createTransport({
        host: s.host,
        port: s.port,
        secure: s.port === 465,
        auth: s.user && s.pass ? { user: s.user, pass: s.pass } : undefined,
    });
}

export async function sendMail(to: string, subject: string, html: string) {
    const transport = await createTransport();
    const from = (await getSettings()).smtp.from || "no-reply@localhost";
    await transport.sendMail({ from, to, subject, html });
}


