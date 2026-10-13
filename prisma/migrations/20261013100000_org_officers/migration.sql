-- CreateEnum
CREATE TYPE "OfficerPosition" AS ENUM ('CHAIR', 'VICE_CHAIR', 'SECRETARY', 'TREASURER', 'ADVISOR');

-- CreateTable: pengurus inti dan Dewan Pembina
CREATE TABLE "org_officers" (
    "id" SERIAL NOT NULL,
    "position" "OfficerPosition" NOT NULL,
    "user_id" TEXT,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "org_officers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "org_officers_position_idx" ON "org_officers"("position");

-- AddForeignKey
ALTER TABLE "org_officers" ADD CONSTRAINT "org_officers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
