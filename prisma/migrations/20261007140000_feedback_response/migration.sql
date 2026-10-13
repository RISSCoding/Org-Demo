-- AlterTable: tanggapan Komisi III atas aspirasi
ALTER TABLE "feedbacks" ADD COLUMN     "response" TEXT,
ADD COLUMN     "responded_at" TIMESTAMP(3);

-- CreateIndex: kotak masuk admin diurutkan menurut status lalu waktu kirim
CREATE INDEX "feedbacks_status_created_at_idx" ON "feedbacks"("status", "created_at");
