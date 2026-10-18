-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- AlterTable
ALTER TABLE "app_settings" ADD COLUMN     "organization_id" TEXT;

-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN     "organization_id" TEXT;

-- AlterTable
ALTER TABLE "certificates" ADD COLUMN     "organization_id" TEXT;

-- AlterTable
ALTER TABLE "cms_posts" ADD COLUMN     "organization_id" TEXT;

-- AlterTable
ALTER TABLE "committee_applications" ADD COLUMN     "organization_id" TEXT;

-- AlterTable
ALTER TABLE "committee_divisions" ADD COLUMN     "organization_id" TEXT;

-- AlterTable
ALTER TABLE "committee_meetings" ADD COLUMN     "organization_id" TEXT;

-- AlterTable
ALTER TABLE "divisions" ADD COLUMN     "organization_id" TEXT;

-- AlterTable
ALTER TABLE "event_registrations" ADD COLUMN     "organization_id" TEXT;

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "organization_id" TEXT;

-- AlterTable
ALTER TABLE "feedbacks" ADD COLUMN     "organization_id" TEXT;

-- AlterTable
ALTER TABLE "financial_transactions" ADD COLUMN     "organization_id" TEXT;

-- AlterTable
ALTER TABLE "letter_counters" ADD COLUMN     "organization_id" TEXT;

-- AlterTable
ALTER TABLE "member_dues" ADD COLUMN     "organization_id" TEXT;

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "organization_id" TEXT;

-- AlterTable
ALTER TABLE "notification_consents" ADD COLUMN     "organization_id" TEXT;

-- AlterTable
ALTER TABLE "notification_preferences" ADD COLUMN     "organization_id" TEXT;

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "organization_id" TEXT;

-- AlterTable
ALTER TABLE "official_letters" ADD COLUMN     "organization_id" TEXT;

-- AlterTable
ALTER TABLE "org_officers" ADD COLUMN     "organization_id" TEXT;

-- AlterTable
ALTER TABLE "password_reset_tokens" ADD COLUMN     "organization_id" TEXT;

-- AlterTable
ALTER TABLE "resources" ADD COLUMN     "organization_id" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "organization_id" TEXT;

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "status" "OrganizationStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_subdomain_key" ON "organizations"("subdomain");

-- CreateIndex
CREATE INDEX "app_settings_organization_id_idx" ON "app_settings"("organization_id");

-- CreateIndex
CREATE INDEX "audit_logs_organization_id_idx" ON "audit_logs"("organization_id");

-- CreateIndex
CREATE INDEX "certificates_organization_id_idx" ON "certificates"("organization_id");

-- CreateIndex
CREATE INDEX "cms_posts_organization_id_idx" ON "cms_posts"("organization_id");

-- CreateIndex
CREATE INDEX "committee_applications_organization_id_idx" ON "committee_applications"("organization_id");

-- CreateIndex
CREATE INDEX "committee_divisions_organization_id_idx" ON "committee_divisions"("organization_id");

-- CreateIndex
CREATE INDEX "committee_meetings_organization_id_idx" ON "committee_meetings"("organization_id");

-- CreateIndex
CREATE INDEX "divisions_organization_id_idx" ON "divisions"("organization_id");

-- CreateIndex
CREATE INDEX "event_registrations_organization_id_idx" ON "event_registrations"("organization_id");

-- CreateIndex
CREATE INDEX "events_organization_id_idx" ON "events"("organization_id");

-- CreateIndex
CREATE INDEX "feedbacks_organization_id_idx" ON "feedbacks"("organization_id");

-- CreateIndex
CREATE INDEX "financial_transactions_organization_id_idx" ON "financial_transactions"("organization_id");

-- CreateIndex
CREATE INDEX "letter_counters_organization_id_idx" ON "letter_counters"("organization_id");

-- CreateIndex
CREATE INDEX "member_dues_organization_id_idx" ON "member_dues"("organization_id");

-- CreateIndex
CREATE INDEX "members_organization_id_idx" ON "members"("organization_id");

-- CreateIndex
CREATE INDEX "notification_consents_organization_id_idx" ON "notification_consents"("organization_id");

-- CreateIndex
CREATE INDEX "notification_preferences_organization_id_idx" ON "notification_preferences"("organization_id");

-- CreateIndex
CREATE INDEX "notifications_organization_id_idx" ON "notifications"("organization_id");

-- CreateIndex
CREATE INDEX "official_letters_organization_id_idx" ON "official_letters"("organization_id");

-- CreateIndex
CREATE INDEX "org_officers_organization_id_idx" ON "org_officers"("organization_id");

-- CreateIndex
CREATE INDEX "password_reset_tokens_organization_id_idx" ON "password_reset_tokens"("organization_id");

-- CreateIndex
CREATE INDEX "resources_organization_id_idx" ON "resources"("organization_id");

-- CreateIndex
CREATE INDEX "users_organization_id_idx" ON "users"("organization_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "divisions" ADD CONSTRAINT "divisions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_officers" ADD CONSTRAINT "org_officers_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_divisions" ADD CONSTRAINT "committee_divisions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_applications" ADD CONSTRAINT "committee_applications_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_meetings" ADD CONSTRAINT "committee_meetings_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_dues" ADD CONSTRAINT "member_dues_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "official_letters" ADD CONSTRAINT "official_letters_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "letter_counters" ADD CONSTRAINT "letter_counters_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_posts" ADD CONSTRAINT "cms_posts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_settings" ADD CONSTRAINT "app_settings_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_consents" ADD CONSTRAINT "notification_consents_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
