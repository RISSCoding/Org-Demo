#!/usr/bin/env bash
# Jalankan dari root proyek himman-ukri:  bash fix-absensi-panitia.sh
# Tujuan: satu sistem absensi panitia (rapat), bukan dua.
set -euo pipefail

MIG="prisma/migrations/20261010090000_committee_attendance_certificates"

[ -f prisma/schema.prisma ] || { echo "Bukan root proyek (prisma/schema.prisma tidak ada)."; exit 1; }
[ -d "$MIG" ] || { echo "Folder $MIG tidak ada, berhenti."; exit 1; }
grep -q "model CommitteeMeeting " prisma/schema.prisma || { echo "schema.prisma bukan versi rapat, berhenti."; exit 1; }

echo "== 1. Hapus kode sistem sesi lama (tidak ada yang memakainya di luar berkas ini)"
rm -v \
  src/actions/committee-sessions.ts \
  src/lib/committee-session.ts \
  src/components/committee/attendance-certificates.tsx \
  src/components/committee/attendance-toggle.tsx \
  src/components/committee/issue-committee-certificates-form.tsx \
  src/components/committee/self-check-in.tsx \
  src/components/committee/session-form.tsx \
  src/components/committee/session-open-toggle.tsx \
  src/components/committee/session-qr.tsx
rm -rv "src/app/api/committee-sessions"
rm -rv "src/app/dashboard/events/[slug]/panitia/rapat/[sessionId]"

echo "== 2. Tulis ulang migrasi yang gagal (nama folder tetap sama)"
cat > "$MIG/migration.sql" <<'SQL'
-- Absensi rapat panitia dan sertifikat panitia.
-- Menggantikan sistem sesi dari 20261009130000_committee_attendance.
-- CertificateKind, certificates.kind, dan certificates.role_title sudah dibuat migrasi itu.

-- Pengaman: hentikan migrasi kalau sistem sesi lama ternyata berisi data.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "committee_sessions")
     OR EXISTS (SELECT 1 FROM "committee_attendances") THEN
    RAISE EXCEPTION 'committee_sessions / committee_attendances berisi data; migrasi dihentikan';
  END IF;
END $$;

-- DropTable
DROP TABLE "committee_attendances";
DROP TABLE "committee_sessions";

-- DropEnum
DROP TYPE "AttendanceMethod";
DROP TYPE "SessionKind";

-- CreateEnum
CREATE TYPE "MeetingAttendanceStatus" AS ENUM ('PRESENT', 'EXCUSED');

-- AlterTable
ALTER TABLE "committee_applications" ADD COLUMN     "attended_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "committee_meetings" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "code" TEXT NOT NULL,
    "attendance_open" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "committee_meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "committee_meeting_attendances" (
    "id" TEXT NOT NULL,
    "meeting_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "MeetingAttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "method" TEXT NOT NULL DEFAULT 'SELF',
    "marked_by" TEXT,
    "checked_in_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "committee_meeting_attendances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "committee_meetings_event_id_starts_at_idx" ON "committee_meetings"("event_id", "starts_at");

-- CreateIndex
CREATE INDEX "committee_meeting_attendances_user_id_idx" ON "committee_meeting_attendances"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "committee_meeting_attendances_meeting_id_user_id_key" ON "committee_meeting_attendances"("meeting_id", "user_id");

-- AddForeignKey
ALTER TABLE "committee_meetings" ADD CONSTRAINT "committee_meetings_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_meeting_attendances" ADD CONSTRAINT "committee_meeting_attendances_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "committee_meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_meeting_attendances" ADD CONSTRAINT "committee_meeting_attendances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
SQL

echo "== 3. Cek sisa referensi ke sistem lama (harus kosong)"
if grep -rnE "committee-session|committeeSession|committeeAttendance|SessionKind|AttendanceMethod" src prisma/schema.prisma; then
  echo "!! Masih ada referensi di atas, kirim ke saya."; exit 1
else
  echo "bersih"
fi
echo "Selesai. Lanjut ke langkah database di pesan saya."
