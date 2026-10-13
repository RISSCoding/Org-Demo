-- AlterTable: tandai kapan user menyelesaikan tutorial awal.
-- Null = belum, dan akan diarahkan ke /onboarding saat membuka dashboard.
ALTER TABLE "users" ADD COLUMN "onboarded_at" TIMESTAMP(3);
