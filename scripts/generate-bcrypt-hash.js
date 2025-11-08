/**
 * Bcrypt hash oluşturucu
 * 
 * Kullanım: node scripts/generate-bcrypt-hash.js
 * 
 * Bu script, girdiğiniz şifrenin bcrypt hash'ini oluşturur.
 * Bu hash'i Neon database'deki User tablosunda password kolonuna yapıştırabilirsiniz.
 */

const bcrypt = require("bcryptjs");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  try {
    const password = await question("Hash'lenecek şifre: ");
    if (!password) {
      console.error("Şifre gerekli!");
      process.exit(1);
    }

    console.log("\nHash oluşturuluyor...");
    const hash = await bcrypt.hash(password, 12);
    
    console.log("\n✅ Bcrypt Hash:");
    console.log(hash);
    console.log("\nBu hash'i Neon database'deki User tablosunda password kolonuna yapıştırın.");
    console.log("Örnek SQL:");
    console.log(`UPDATE "User" SET password = '${hash}' WHERE email = 'admin@example.com';`);
  } catch (error) {
    console.error("Hata:", error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();

