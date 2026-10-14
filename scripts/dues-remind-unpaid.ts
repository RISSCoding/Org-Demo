/**
 * Reminder untuk anggota yang belum bayar iuran bulan ini.
 * Dijalankan tanggal 10, 20, 25 jam 08:00 WIB.
 *
 *   bun run scripts/dues-remind-unpaid.ts
 *   bun run scripts/dues-remind-unpaid.ts 2026-12
 *
 * Idempoten: cek notifikasi yang sudah dikirim bulan ini.
 */
import { PrismaClient } from "@prisma/client";
import { notifyMany } from "../src/lib/notifications";
import { currentMonthKey, monthLabel } from "../src/lib/finance";

const prisma = new PrismaClient();

async function main() {
  const targetMonth = process.argv[2] ?? currentMonthKey();
  const label = monthLabel(targetMonth);
  const today = new Date();
  const dayOfMonth = today.getDate();
  // Hari ke berapa di bulan ini — dipakai untuk pesan yang berbeda.
  const tier = dayOfMonth <= 12 ? "H+10" : dayOfMonth <= 22 ? "H+20" : "H+25";

  // Cari user yang belum bayar bulan ini
  const unpaid = await prisma.memberDues.findMany({
    where: {
      monthYear: targetMonth,
      status: { not: "PAID" },
      user: { approvalStatus: "APPROVED", member: { status: "ACTIVE" } },
    },
    select: { userId: true },
  });

  if (unpaid.length === 0) {
    console.log(`${label}: semua sudah bayar. Tidak ada reminder dikirim.`);
    return;
  }

  const body =
    tier === "H+10"
      ? `Nominal: sesuai tagihan. Buka Iuran Kas untuk unggah bukti transfer.`
      : tier === "H+20"
        ? `Batas akhir bulan semakin dekat. Yuk segera dibayar.`
        : `Batas akhir bulan tinggal beberapa hari lagi. Mohon diselesaikan.`;

  const sent = await notifyMany(
    unpaid.map((d) => d.userId),
    {
      type: "DUES_DUE",
      title: `Pengingat iuran ${label}`,
      body,
      link: "/dashboard/dues",
    },
  );
  console.log(`${label} (${tier}): ${sent} reminder dikirim.`);
}

main()
  .catch((e) => {
    console.error("Gagal:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
