import { PrismaClient, AccountType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Memeriksa dan menyiapkan Bagan Akun (Chart of Accounts)...");

  // Pastikan akun-akun dasar sudah ada di database untuk mencegah gagal pencarian
  const defaultAccounts = [
    { code: "1110", name: "Kas Tunai Himpunan", type: AccountType.ASSET },
    { code: "4110", name: "Pendapatan Iuran Anggota (Kas)", type: AccountType.REVENUE },
    { code: "4120", name: "Pendapatan Kemahasiswaan Universitas", type: AccountType.REVENUE },
    { code: "4130", name: "Pendapatan Sponsorship Event", type: AccountType.REVENUE },
    { code: "4140", name: "Pendapatan Donasi / Alumni", type: AccountType.REVENUE },
    { code: "4150", name: "Pendapatan Usaha Dana (Danus)", type: AccountType.REVENUE },
    { code: "5110", name: "Beban Operasional Rutin", type: AccountType.EXPENSE },
    { code: "5120", name: "Beban Pelaksanaan Kegiatan (Event)", type: AccountType.EXPENSE },
  ];

  for (const acc of defaultAccounts) {
    await prisma.account.upsert({
      where: { code: acc.code },
      update: {},
      create: acc,
    });
  }

  console.log("Memulai proses migrasi jurnal untuk data lama...");

  // Ambil semua transaksi yang belum memiliki journal lines
  const oldTransactions = await prisma.financialTransaction.findMany({
    where: {
      journalLines: {
        none: {},
      },
    },
  });

  console.log(`Ditemukan ${oldTransactions.length} transaksi lama tanpa jurnal.`);

  for (const tx of oldTransactions) {
    let debitCode = "";
    let creditCode = "";

    if (tx.type === "INCOME") {
      debitCode = "1110";
      if (tx.category === "DUES") creditCode = "4110";
      else if (tx.category === "UNIVERSITY_FUND") creditCode = "4120";
      else if (tx.category === "SPONSORSHIP") creditCode = "4130";
      else if (tx.category === "DONATION") creditCode = "4140";
      else if (tx.category === "BUSINESS") creditCode = "4150";
      else creditCode = "4150";
    } else {
      creditCode = "1110";
      if (tx.category === "OPERATIONAL") debitCode = "5110";
      else if (tx.category === "EVENT") debitCode = "5120";
      else debitCode = "5110";
    }

    const debitAcc = await prisma.account.findUnique({ where: { code: debitCode } });
    const creditAcc = await prisma.account.findUnique({ where: { code: creditCode } });

    if (!debitAcc || !creditAcc) {
      console.warn(`[SKIP] Gagal menemukan akun untuk transaksi ID: ${tx.id} (Kategori: ${tx.category})`);
      continue;
    }

    await prisma.$transaction([
      prisma.journalLine.create({
        data: {
          transactionId: tx.id,
          accountId: debitAcc.id,
          amount: tx.amount,
          isDebit: true,
        },
      }),
      prisma.journalLine.create({
        data: {
          transactionId: tx.id,
          accountId: creditAcc.id,
          amount: tx.amount,
          isDebit: false,
        },
      }),
    ]);

    console.log(`[SUCCESS] Berhasil membuat jurnal untuk: "${tx.title}" (${tx.amount})`);
  }

  console.log("✅ Proses backfill data lama selesai sepenuhnya!");
}

main()
  .catch((e) => {
    console.error("❌ Terjadi kesalahan saat migrasi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
