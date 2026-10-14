/**
 * Generate tagihan iuran bulanan + notifikasi "Iuran sudah bisa dibayar".
 * Dijalankan otomatis oleh cron pada tanggal 1 jam 03:00 WIB.
 *
 *   bun run scripts/dues-monthly-generate.ts           # bulan ini
 *   bun run scripts/dues-monthly-generate.ts 2026-12   # bulan tertentu
 *
 * Idempoten: kalau tagihan sudah ada, tidak diduplikasi.
 */
import { PrismaClient } from "@prisma/client";
import { notifyMany } from "../src/lib/notifications";
import { currentMonthKey, monthLabel } from "../src/lib/finance";

const prisma = new PrismaClient();

async function main() {
  const targetMonth = process.argv[2] ?? currentMonthKey();
  if (!/^\d{4}-\d{2}$/.test(targetMonth)) {
    console.error("Format bulan harus YYYY-MM");
    process.exit(1);
  }

  // 1. Baca nominal dari setting
  const setting = await prisma.appSetting.findUnique({ where: { key: "dues_amount" } });
  const amount = Number(setting?.value ?? 0);
  if (!amount || amount <= 0) {
    console.error("Nominal iuran belum diatur. Isi di /admin/settings.");
    process.exit(1);
  }

  // 2. Ambil semua anggota aktif
  const members = await prisma.member.findMany({
    where: { status: "ACTIVE", user: { approvalStatus: "APPROVED" } },
    select: { userId: true },
  });
  console.log(`Anggota aktif: ${members.length}`);

  // 3. Bulk insert tagihan (skip yang sudah ada)
  const created = await prisma.memberDues.createMany({
    data: members.map((m) => ({ userId: m.userId, monthYear: targetMonth, amount })),
    skipDuplicates: true,
  });
  console.log(`Tagihan dibuat: ${created.count}, sudah ada: ${members.length - created.count}`);

  // 4. Notifikasi hanya ke yang BARU dibuat (yang sudah punya tagihan tidak perlu notif lagi)
  const newDues = await prisma.memberDues.findMany({
    where: { monthYear: targetMonth },
    select: { userId: true },
  });
  const sent = await notifyMany(
    newDues.map((d) => d.userId),
    {
      type: "DUES_DUE",
      title: `Iuran ${monthLabel(targetMonth)} sudah bisa dibayar`,
      body: `Nominal: Rp${amount.toLocaleString("id-ID")}. Buka menu Iuran Kas untuk lihat detail dan unggah bukti transfer.`,
      link: "/dashboard/dues",
    },
  );
  console.log(`Notifikasi dikirim: ${sent}`);
}

main()
  .catch((e) => {
    console.error("Gagal:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
