import { PrismaClient } from "@prisma/client";
import { writeJournals } from "../src/lib/finance-journal";

const prisma = new PrismaClient();

// Sejak jurnal ditulis otomatis saat transaksi dibuat, skrip ini hanya perlu untuk data lama.
// Laporan keuangan di aplikasi juga menjalankan hal yang sama sendiri (syncJournals), jadi
// menjalankan skrip ini bersifat opsional dan aman diulang.
async function main() {
  const missing = await prisma.financialTransaction.findMany({
    where: { journalLines: { none: {} } },
    select: { id: true, type: true, category: true, amount: true },
  });
  console.log(`Ditemukan ${missing.length} transaksi tanpa jurnal.`);
  await prisma.$transaction((db) => writeJournals(db, missing), { timeout: 60_000 });
  console.log("✅ Backfill jurnal selesai.");
}

main()
  .catch((e) => {
    console.error("❌ Terjadi kesalahan saat migrasi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
