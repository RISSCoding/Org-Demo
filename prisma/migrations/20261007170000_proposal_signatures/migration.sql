-- AlterTable
ALTER TABLE "official_letters" ADD COLUMN     "campus_funds" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "signed_by" TEXT[] DEFAULT ARRAY[]::TEXT[];
