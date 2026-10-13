import type { AccountType, Prisma, TxCategory, TxType } from "@prisma/client";

// Modul ini sengaja tanpa impor `@/…` dan tanpa klien Prisma sendiri, supaya skrip di folder
// prisma/ (seed, backfill) bisa memakainya lewat tsx dan pemetaan akunnya hanya ada di satu tempat.

/** Bagan akun dasar. Dipakai seed, dan dibuat otomatis bila ada akun yang belum ada di database. */
export const CHART_OF_ACCOUNTS: { code: string; name: string; type: AccountType }[] = [
  // Harta
  { code: "1110", name: "Kas Tunai Himpunan", type: "ASSET" },
  { code: "1120", name: "Rekening Bank Organisasi", type: "ASSET" },
  { code: "1130", name: "Piutang Iuran Anggota", type: "ASSET" },
  { code: "1140", name: "Piutang Sponsorship", type: "ASSET" },
  // Kewajiban
  { code: "2110", name: "Utang Operasional / Pihak Ketiga", type: "LIABILITY" },
  { code: "2120", name: "Dana Titipan Kegiatan", type: "LIABILITY" },
  // Ekuitas
  { code: "3110", name: "Saldo Dana Awal / Ekuitas", type: "EQUITY" },
  // Pendapatan
  { code: "4110", name: "Pendapatan Iuran Anggota (Kas)", type: "REVENUE" },
  { code: "4120", name: "Pendapatan Kemahasiswaan Universitas", type: "REVENUE" },
  { code: "4130", name: "Pendapatan Sponsorship Event", type: "REVENUE" },
  { code: "4140", name: "Pendapatan Donasi / Alumni", type: "REVENUE" },
  { code: "4150", name: "Pendapatan Usaha Dana (Danus)", type: "REVENUE" },
  // Beban
  { code: "5110", name: "Beban Operasional Rutin", type: "EXPENSE" },
  { code: "5120", name: "Beban Pelaksanaan Kegiatan (Event)", type: "EXPENSE" },
  { code: "5130", name: "Beban Kesekretariatan & ATK", type: "EXPENSE" },
  { code: "5140", name: "Beban Konsumsi & Rapat", type: "EXPENSE" },
  { code: "5150", name: "Beban Pemeliharaan Inventaris", type: "EXPENSE" },
];

export const CASH_ACCOUNT = "1110";

// Pemetaan ini sama persis dengan skrip backfill lama, supaya jurnal yang sudah ada tetap konsisten.
const REVENUE_ACCOUNT: Record<TxCategory, string> = {
  DUES: "4110",
  UNIVERSITY_FUND: "4120",
  SPONSORSHIP: "4130",
  DONATION: "4140",
  BUSINESS: "4150",
  EVENT: "4150",
  OPERATIONAL: "4150",
};
const EXPENSE_ACCOUNT: Record<TxCategory, string> = {
  OPERATIONAL: "5110",
  EVENT: "5120",
  DUES: "5110",
  SPONSORSHIP: "5110",
  UNIVERSITY_FUND: "5110",
  DONATION: "5110",
  BUSINESS: "5110",
};

/** Pemasukan: Kas (D) / Pendapatan (K). Pengeluaran: Beban (D) / Kas (K). Dasar kas, satu baris debit dan satu kredit. */
export function journalCodesFor(type: TxType, category: TxCategory) {
  return type === "INCOME"
    ? { debit: CASH_ACCOUNT, credit: REVENUE_ACCOUNT[category] }
    : { debit: EXPENSE_ACCOUNT[category], credit: CASH_ACCOUNT };
}

export type JournalSource = {
  id: string;
  type: TxType;
  category: TxCategory;
  amount: Prisma.Decimal | number | string;
};

type Db = Pick<Prisma.TransactionClient, "account" | "journalLine">;

async function accountIdByCode(db: Db, code: string) {
  const def = CHART_OF_ACCOUNTS.find((a) => a.code === code);
  if (!def) throw new Error(`Akun ${code} tidak ada di bagan akun`);
  const acc = await db.account.upsert({ where: { code }, update: {}, create: def, select: { id: true } });
  return acc.id;
}

/** Menulis jurnal berpasangan (debit + kredit) untuk transaksi. Panggil di dalam transaksi database yang sama dengan pembuatan transaksinya. */
export async function writeJournals(db: Db, txs: JournalSource[]) {
  if (txs.length === 0) return;
  const ids = new Map<string, string>();
  for (const t of txs) {
    const { debit, credit } = journalCodesFor(t.type, t.category);
    for (const code of [debit, credit]) if (!ids.has(code)) ids.set(code, await accountIdByCode(db, code));
  }
  await db.journalLine.createMany({
    data: txs.flatMap((t) => {
      const { debit, credit } = journalCodesFor(t.type, t.category);
      return [
        { transactionId: t.id, accountId: ids.get(debit)!, amount: t.amount, isDebit: true },
        { transactionId: t.id, accountId: ids.get(credit)!, amount: t.amount, isDebit: false },
      ];
    }),
  });
}
