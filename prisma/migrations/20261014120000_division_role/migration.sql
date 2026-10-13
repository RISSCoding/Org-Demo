-- CreateEnum
CREATE TYPE "DivisionRole" AS ENUM ('STAFF', 'DEPT_SECRETARY', 'DEPT_HEAD');

-- AlterTable
ALTER TABLE "members" ADD COLUMN "division_role" "DivisionRole";

-- Backfill: pemegang Division.leaderId yang punya akun otomatis jadi DEPT_HEAD
UPDATE "members" m
SET "division_role" = 'DEPT_HEAD'
FROM "divisions" d
WHERE m."division_id" = d."id"
  AND m."user_id" = d."leader_id"
  AND d."leader_id" IS NOT NULL;

-- Sisanya yang sudah punya divisi tapi belum punya jabatan: STAFF
UPDATE "members"
SET "division_role" = 'STAFF'
WHERE "division_id" IS NOT NULL AND "division_role" IS NULL;
