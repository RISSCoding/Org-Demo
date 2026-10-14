-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "NotificationJobStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED');

-- CreateTable
CREATE TABLE "notification_jobs" (
    "id" TEXT NOT NULL,
    "notification_id" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "status" "NotificationJobStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "scheduled_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sent_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notification_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_jobs_status_scheduled_at_idx"
  ON "notification_jobs"("status", "scheduled_at");

-- CreateIndex
CREATE INDEX "notification_jobs_notification_id_idx"
  ON "notification_jobs"("notification_id");

-- AddForeignKey
ALTER TABLE "notification_jobs"
  ADD CONSTRAINT "notification_jobs_notification_id_fkey"
  FOREIGN KEY ("notification_id") REFERENCES "notifications"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
