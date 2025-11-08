/**
 * Admin şifre sıfırlama scripti
 * 
 * Kullanım:
 * 1. Bu dosyayı çalıştırmadan önce DATABASE_URL environment variable'ını ayarlayın
 * 2. Terminal'de: npx tsx scripts/reset-admin-password.ts
 * 
 * Veya doğrudan Node.js ile:
 * DATABASE_URL="postgresql://..." npx tsx scripts/reset-admin-password.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import readline from "readline";

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  try {
    console.log("=== Admin Şifre Sıfırlama ===\n");

    // Komut satırı parametrelerini kontrol et
    const args = process.argv.slice(2);
    let email: string;
    let newPassword: string;

    if (args.length >= 2) {
      // Parametrelerle çalıştırıldı
      email = args[0];
      newPassword = args[1];
      console.log(`E-posta: ${email}`);
      console.log(`Şifre: ${"*".repeat(newPassword.length)}\n`);
    } else {
      // İnteraktif mod
      email = await question("Admin e-posta adresi: ");
      if (!email) {
        console.error("E-posta adresi gerekli!");
        process.exit(1);
      }

      newPassword = await question("Yeni şifre: ");
      if (!newPassword || newPassword.length < 6) {
        console.error("Şifre en az 6 karakter olmalı!");
        process.exit(1);
      }

      const confirm = await question("Şifreyi güncellemek istediğinizden emin misiniz? (evet/hayır): ");
      if (confirm.toLowerCase() !== "evet") {
        console.log("İşlem iptal edildi.");
        process.exit(0);
      }
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error(`Kullanıcı bulunamadı: ${email}`);
      process.exit(1);
    }

    if (user.role !== "admin") {
      console.error(`Bu kullanıcı admin değil: ${email}`);
      process.exit(1);
    }

    if (!newPassword || newPassword.length < 6) {
      console.error("Şifre en az 6 karakter olmalı!");
      process.exit(1);
    }

    console.log("\nŞifre hash'leniyor...");
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    console.log("Veritabanı güncelleniyor...");
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    console.log(`\n✅ Şifre başarıyla güncellendi!`);
    console.log(`E-posta: ${email}`);
    console.log(`\nArtık yeni şifrenizle giriş yapabilirsiniz.`);
  } catch (error: any) {
    console.error("\n❌ Hata:", error.message);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main();

