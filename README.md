Bu proje, Next.js App Router, Auth.js (NextAuth v5), Tailwind v4 ve dosya-sistemi tabanlı JSON depolama kullanır.

## Hızlı Başlangıç

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Ortam Değişkenleri

`.env.local` örneği için `env.example` dosyasına bakın.

- `NEXTAUTH_URL`, `NEXTAUTH_SECRET` zorunlu.
- `NEXT_PUBLIC_SITE_URL` SEO ve link üretimi için önerilir.
- `DATABASE_URL` (SQLite için `file:./dev.db` önerilir).
- Google OAuth opsiyoneldir: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` sağlanırsa aktif olur.
- SMTP ayarları e-posta bildirimleri için.
- Ziraat POS alanları opsiyoneldir.

## Güvenlik ve Yetkilendirme

- Yönetim paneli ve admin API’leri, sadece `role=admin` kullanıcılar için erişilebilir.
- Orta katmanda (middleware) doğrulanmış JWT zorunludur; cookie fallback kaldırılmıştır.
- Admin UI ayrıca sunucu tarafında `auth()` ile tekrar kontrol eder.

## Bilinen Sınırlamalar

- Veriler `data/*.json` klasöründe saklanır. Serverless/production ortamlarında kalıcılık garantisi olmayabilir. Kalıcı DB (Postgres/SQLite) önerilir.

## Ek Bilgiler

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Vercel’e Deploy

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
