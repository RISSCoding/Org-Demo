-- Penyesuaian dengan AD/ART, GBHO, dan PO HIMMAN UKRI 2026

-- CreateEnum
CREATE TYPE "LetterKind" AS ENUM ('SK', 'SP', 'SU', 'SPM', 'SPB', 'SPP', 'SM', 'ST', 'SKET', 'SR', 'SB', 'SRT', 'SPENG');

-- CreateEnum
CREATE TYPE "LetterNature" AS ENUM ('KEBIJAKAN', 'TEKNIS_KEGIATAN', 'RUTIN');

-- AlterEnum (AD Pasal 20: dana universitas, sumbangan, usaha)
ALTER TYPE "TxCategory" ADD VALUE 'UNIVERSITY_FUND';
ALTER TYPE "TxCategory" ADD VALUE 'DONATION';
ALTER TYPE "TxCategory" ADD VALUE 'BUSINESS';

-- AlterTable
ALTER TABLE "official_letters" ADD COLUMN     "activity_name" TEXT,
ADD COLUMN     "forwarded_at" TIMESTAMP(3),
ADD COLUMN     "kind" "LetterKind",
ADD COLUMN     "letter_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "nature" "LetterNature",
ADD COLUMN     "received_at" TIMESTAMP(3),
ADD COLUMN     "summary" TEXT;

-- Surat yang sudah tercatat: tanggal surat = tanggal pencatatan
UPDATE "official_letters" SET "letter_date" = "created_at";

-- CreateIndex
CREATE INDEX "official_letters_letter_date_idx" ON "official_letters"("letter_date");

-- Departemen sesuai PO Pasal 14: Humas, MedFo, PSDMO, Pendidikan, Kewirausahaan (+ BPH)
UPDATE "divisions" SET "name" = 'MedFo'
  WHERE "name" = 'Kominfo' AND NOT EXISTS (SELECT 1 FROM "divisions" WHERE "name" = 'MedFo');
INSERT INTO "divisions" ("name") VALUES ('Humas'), ('MedFo'), ('PSDMO') ON CONFLICT ("name") DO NOTHING;
-- "Pengabdian Masyarakat" tidak ada di PO; dihapus hanya bila belum punya anggota
DELETE FROM "divisions" d WHERE d."name" = 'Pengabdian Masyarakat'
  AND NOT EXISTS (SELECT 1 FROM "members" m WHERE m."division_id" = d."id");
