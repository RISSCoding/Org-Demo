/*
  Warnings:

  - The primary key for the `app_settings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `letter_counters` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[organization_id,slug]` on the table `cms_posts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organization_id,slug]` on the table `events` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organization_id,kta_number]` on the table `members` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organization_id,letter_number]` on the table `official_letters` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "cms_posts_slug_key";

-- DropIndex
DROP INDEX "divisions_name_key";

-- DropIndex
DROP INDEX "events_slug_key";

-- DropIndex
DROP INDEX "members_kta_number_key";

-- DropIndex
DROP INDEX "official_letters_letter_number_key";

-- AlterTable
ALTER TABLE "app_settings" DROP CONSTRAINT "app_settings_pkey",
ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true),
ADD CONSTRAINT "app_settings_pkey" PRIMARY KEY ("organization_id", "key");

-- AlterTable
ALTER TABLE "audit_logs" ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);

-- AlterTable
ALTER TABLE "certificates" ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);

-- AlterTable
ALTER TABLE "cms_posts" ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);

-- AlterTable
ALTER TABLE "committee_applications" ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);

-- AlterTable
ALTER TABLE "committee_divisions" ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);

-- AlterTable
ALTER TABLE "committee_meetings" ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);

-- AlterTable
ALTER TABLE "divisions" ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);

-- AlterTable
ALTER TABLE "event_registrations" ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);

-- AlterTable
ALTER TABLE "events" ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);

-- AlterTable
ALTER TABLE "feedbacks" ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);

-- AlterTable
ALTER TABLE "financial_transactions" ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);

-- AlterTable
ALTER TABLE "letter_counters" DROP CONSTRAINT "letter_counters_pkey",
ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true),
ADD CONSTRAINT "letter_counters_pkey" PRIMARY KEY ("organization_id", "year", "type");

-- AlterTable
ALTER TABLE "member_dues" ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);

-- AlterTable
ALTER TABLE "members" ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);

-- AlterTable
ALTER TABLE "notification_consents" ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);

-- AlterTable
ALTER TABLE "notification_preferences" ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);

-- AlterTable
ALTER TABLE "notifications" ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);

-- AlterTable
ALTER TABLE "official_letters" ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);

-- AlterTable
ALTER TABLE "org_officers" ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);

-- AlterTable
ALTER TABLE "password_reset_tokens" ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);

-- AlterTable
ALTER TABLE "resources" ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);

-- CreateIndex
CREATE UNIQUE INDEX "cms_posts_organization_id_slug_key" ON "cms_posts"("organization_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "events_organization_id_slug_key" ON "events"("organization_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "members_organization_id_kta_number_key" ON "members"("organization_id", "kta_number");

-- CreateIndex
CREATE UNIQUE INDEX "official_letters_organization_id_letter_number_key" ON "official_letters"("organization_id", "letter_number");
