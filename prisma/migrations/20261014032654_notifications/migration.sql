-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('DUES_DUE', 'DUES_VERIFIED', 'DUES_REJECTED', 'EVENT_REMINDER', 'EVENT_REGISTERED', 'COMMITTEE_DECIDED', 'COMMITTEE_MEETING', 'FEEDBACK_RESPONSE', 'ANNOUNCEMENT', 'SYSTEM');

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "link" TEXT,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "user_id" TEXT NOT NULL,
    "dues_due" BOOLEAN NOT NULL DEFAULT true,
    "event_reminder" BOOLEAN NOT NULL DEFAULT true,
    "committee_decided" BOOLEAN NOT NULL DEFAULT true,
    "feedback_response" BOOLEAN NOT NULL DEFAULT true,
    "announcement" BOOLEAN NOT NULL DEFAULT false,
    "inapp_enabled" BOOLEAN NOT NULL DEFAULT true,
    "email_enabled" BOOLEAN NOT NULL DEFAULT false,
    "whatsapp_enabled" BOOLEAN NOT NULL DEFAULT false,
    "digest_mode" TEXT NOT NULL DEFAULT 'instant',
    "quiet_hours_start" INTEGER,
    "quiet_hours_end" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "notification_consents" (
    "user_id" TEXT NOT NULL,
    "inapp_accepted_at" TIMESTAMP(3),
    "email_consent_at" TIMESTAMP(3),
    "email_revoked_at" TIMESTAMP(3),
    "whatsapp_consent_at" TIMESTAMP(3),
    "whatsapp_revoked_at" TIMESTAMP(3),
    "consent_version" TEXT NOT NULL,
    "accepted_ip" TEXT,
    "accepted_user_agent" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_consents_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE INDEX "notifications_user_id_read_at_created_at_idx" ON "notifications"("user_id", "read_at", "created_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_consents" ADD CONSTRAINT "notification_consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
