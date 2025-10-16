-- CreateTable
CREATE TABLE "SettingKV" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "SettingKV_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "HomeContentKV" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "value" JSONB NOT NULL,

    CONSTRAINT "HomeContentKV_pkey" PRIMARY KEY ("id")
);
