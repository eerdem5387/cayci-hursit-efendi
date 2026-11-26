-- Sipariş yönetimi: kargo bilgisi, iç not, işlem geçmişi
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "cargoCompany" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "cargoTrackingNo" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "adminNote" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "history" JSONB;
