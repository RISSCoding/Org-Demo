import type { PrismaClient } from "@prisma/client";
import { CHART_OF_ACCOUNTS } from "../src/lib/finance-journal";

export async function seedFinance(prisma: PrismaClient) {
  console.log("Memulai proses seeding Bagan Akun (Chart of Accounts)...");

  for (const acc of CHART_OF_ACCOUNTS) {
    await prisma.account.upsert({
      where: { code: acc.code },
      update: { name: acc.name, type: acc.type },
      create: acc,
    });
  }

  console.log(`✅ Seeding keuangan selesai! Berhasil menyiapkan ${CHART_OF_ACCOUNTS.length} akun dasar.`);
}
