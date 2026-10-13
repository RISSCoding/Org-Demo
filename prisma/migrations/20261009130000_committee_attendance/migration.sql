-- Absensi panitia (rapat dan hari-H) dan sertifikat kepanitiaan

-- CreateEnum
CREATE TYPE "CertificateKind" AS ENUM ('PARTICIPANT', 'COMMITTEE');

-- CreateEnum
CREATE TYPE "SessionKind" AS ENUM ('MEETING', 'EVENT_DAY');

-- CreateEnum
CREATE TYPE "AttendanceMethod" AS ENUM ('SELF_QR', 'SCANNED', 'MANUAL');

-- AlterTable
ALTER TABLE "certificates" ADD COLUMN     "kind" "CertificateKind" NOT NULL DEFAULT 'PARTICIPANT',
ADD COLUMN     "role_title" TEXT;

-- CreateTable
CREATE TABLE "committee_sessions" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" "SessionKind" NOT NULL DEFAULT 'MEETING',
    "starts_at" TIMESTAMP(3) NOT NULL,
    "is_open" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "committee_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "committee_attendances" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "checked_in_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" "AttendanceMethod" NOT NULL,
    "recorded_by" TEXT,

    CONSTRAINT "committee_attendances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "committee_sessions_event_id_starts_at_idx" ON "committee_sessions"("event_id", "starts_at");

-- CreateIndex
CREATE INDEX "committee_attendances_user_id_idx" ON "committee_attendances"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "committee_attendances_session_id_user_id_key" ON "committee_attendances"("session_id", "user_id");

-- AddForeignKey
ALTER TABLE "committee_sessions" ADD CONSTRAINT "committee_sessions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_attendances" ADD CONSTRAINT "committee_attendances_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "committee_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_attendances" ADD CONSTRAINT "committee_attendances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
