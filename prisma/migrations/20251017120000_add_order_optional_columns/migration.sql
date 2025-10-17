-- Add optional/guest-related columns to Order table for compatibility with current Prisma schema
-- This migration is idempotent for columns and index creation.

ALTER TABLE "Order"
  ADD COLUMN IF NOT EXISTS "isGuest" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "contactEmail" TEXT,
  ADD COLUMN IF NOT EXISTS "trackingToken" TEXT,
  ADD COLUMN IF NOT EXISTS "shippingJson" JSONB,
  ADD COLUMN IF NOT EXISTS "billingJson" JSONB,
  ADD COLUMN IF NOT EXISTS "clientIp" TEXT,
  ADD COLUMN IF NOT EXISTS "userAgent" TEXT,
  ADD COLUMN IF NOT EXISTS "userId" TEXT;

-- Unique index for tracking tokens used in guest order tracking links
CREATE UNIQUE INDEX IF NOT EXISTS "Order_trackingToken_key" ON "Order"("trackingToken");


