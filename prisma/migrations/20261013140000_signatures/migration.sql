-- AlterEnum: penandatangan eksternal (Ketua Program Studi, Dekan, Wakil Rektor III)
-- Nilai baru belum dipakai di migrasi ini, jadi aman dijalankan di dalam transaksi (PostgreSQL 12+).
ALTER TYPE "OfficerPosition" ADD VALUE IF NOT EXISTS 'PRODI_HEAD';
ALTER TYPE "OfficerPosition" ADD VALUE IF NOT EXISTS 'DEAN';
ALTER TYPE "OfficerPosition" ADD VALUE IF NOT EXISTS 'VICE_RECTOR_3';

-- AlterTable: gambar tanda tangan (berkas privat, diakses lewat route aplikasi)
ALTER TABLE "users" ADD COLUMN "signature_url" TEXT;
ALTER TABLE "org_officers" ADD COLUMN "signature_url" TEXT;

-- AlterTable: proposal/LPJ tertaut ke kegiatan agar ketua pelaksana dan sekretaris kegiatan terbaca dari panitia
ALTER TABLE "official_letters" ADD COLUMN "event_id" TEXT;

-- CreateIndex
CREATE INDEX "official_letters_event_id_idx" ON "official_letters"("event_id");

-- AddForeignKey
ALTER TABLE "official_letters" ADD CONSTRAINT "official_letters_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
