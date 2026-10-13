-- Kepanitiaan event: pembukaan pendaftaran panitia, divisi per event, dan seleksi

-- CreateEnum
CREATE TYPE "CommitteeStatus" AS ENUM ('PENDING', 'ACCEPTED', 'WAITLIST', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "CommitteeRole" AS ENUM ('CHAIR', 'SECRETARY', 'TREASURER', 'COORDINATOR', 'MEMBER');

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "committee_deadline" TIMESTAMP(3),
ADD COLUMN     "committee_open" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "committee_divisions" (
    "id" SERIAL NOT NULL,
    "event_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quota" INTEGER,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "committee_divisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "committee_applications" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "first_choice_id" INTEGER NOT NULL,
    "second_choice_id" INTEGER,
    "motivation" TEXT NOT NULL,
    "experience" TEXT,
    "status" "CommitteeStatus" NOT NULL DEFAULT 'PENDING',
    "role" "CommitteeRole" NOT NULL DEFAULT 'MEMBER',
    "assigned_division_id" INTEGER,
    "decided_by" TEXT,
    "decided_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "committee_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "committee_divisions_event_id_name_key" ON "committee_divisions"("event_id", "name");

-- CreateIndex
CREATE INDEX "committee_applications_event_id_status_idx" ON "committee_applications"("event_id", "status");

-- CreateIndex
CREATE INDEX "committee_applications_user_id_idx" ON "committee_applications"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "committee_applications_event_id_user_id_key" ON "committee_applications"("event_id", "user_id");

-- AddForeignKey
ALTER TABLE "committee_divisions" ADD CONSTRAINT "committee_divisions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_applications" ADD CONSTRAINT "committee_applications_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_applications" ADD CONSTRAINT "committee_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_applications" ADD CONSTRAINT "committee_applications_first_choice_id_fkey" FOREIGN KEY ("first_choice_id") REFERENCES "committee_divisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_applications" ADD CONSTRAINT "committee_applications_second_choice_id_fkey" FOREIGN KEY ("second_choice_id") REFERENCES "committee_divisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_applications" ADD CONSTRAINT "committee_applications_assigned_division_id_fkey" FOREIGN KEY ("assigned_division_id") REFERENCES "committee_divisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
