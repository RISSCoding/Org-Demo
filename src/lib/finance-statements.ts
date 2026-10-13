import type { Prisma } from "@prisma/client";
import { num } from "@/lib/finance";
import { writeJournals } from "@/lib/finance-journal";
import { periodDates, type Book, type PeriodKeys, type Scope } from "@/lib/finance-ledger";
import { prisma } from "@/lib/prisma";

/**
 * Staf keuangan boleh memilih cakupan (default: termasuk yang belum diverifikasi, sama seperti
 * Ringkasan kas selama ini). Anggota biasa selalu hanya melihat transaksi terverifikasi.
 */
export function resolveScope(isStaff: boolean, requested: string | undefined): Scope {
  if (!isStaff) return "verified";
  return requested === "verified" ? "verified" : "all";
}

/** Dipakai route unduhan: tanpa parameter eksplisit "all", cakupannya terverifikasi saja. */
export function resolveExportScope(isStaff: boolean, requested: string | null): Scope {
  return isStaff && requested === "all" ? "all" : "verified";
}

export const hasFinanceRead = (u: { role: string; permissions: string[] }) =>
  u.role === "SUPER_ADMIN" || u.permissions.includes("finance:read");

/**
 * Idempotent: transaksi yang belum punya jurnal (data lama, atau dibuat sebelum jurnal otomatis
 * ada) dibuatkan jurnalnya. Kunci advisory mencegah dua permintaan serentak membuat jurnal ganda.
 */
export async function syncJournals() {
  const missing = await prisma.financialTransaction.count({ where: { journalLines: { none: {} } } });
  if (missing === 0) return;
  await prisma.$transaction(
    async (db) => {
      await db.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('finance:journal-sync'))`;
      const rows = await db.financialTransaction.findMany({
        where: { journalLines: { none: {} } },
        select: { id: true, type: true, category: true, amount: true },
      });
      await writeJournals(db, rows);
    },
    { timeout: 20_000 },
  );
}

export async function loadBook({ keys, scope }: { keys: PeriodKeys; scope: Scope }): Promise<Book> {
  await syncJournals();
  const period = periodDates(keys);

  const verifiedOnly = scope === "verified";
  const txWhere: Prisma.FinancialTransactionWhereInput = {
    ...(verifiedOnly ? { verifiedBy: { not: null } } : {}),
    ...(period.end ? { date: { lt: period.end } } : {}),
  };

  const [accounts, rows, unverifiedExcluded] = await Promise.all([
    prisma.account.findMany({ orderBy: { code: "asc" }, select: { id: true, code: true, name: true, type: true } }),
    prisma.journalLine.findMany({
      where: { transaction: txWhere },
      select: {
        id: true,
        accountId: true,
        isDebit: true,
        amount: true,
        transaction: { select: { id: true, date: true, createdAt: true, title: true, verifiedBy: true } },
      },
    }),
    verifiedOnly
      ? prisma.financialTransaction.count({
          where: {
            verifiedBy: null,
            date: {
              ...(period.start ? { gte: period.start } : {}),
              ...(period.end ? { lt: period.end } : {}),
            },
          },
        })
      : Promise.resolve(0),
  ]);

  return {
    accounts,
    lines: rows.map((r) => ({
      id: r.id,
      txId: r.transaction.id,
      accountId: r.accountId,
      isDebit: r.isDebit,
      amount: num(r.amount),
      date: r.transaction.date,
      createdAt: r.transaction.createdAt,
      title: r.transaction.title,
      verified: r.transaction.verifiedBy !== null,
    })),
    keys,
    period,
    scope,
    unverifiedExcluded,
  };
}

/** Daftar transaksi untuk lembar "Transaksi" pada unduhan Excel. Catatan hanya untuk staf. */
export async function loadTransactionsForExport({ keys, scope }: { keys: PeriodKeys; scope: Scope }) {
  const period = periodDates(keys);
  const rows = await prisma.financialTransaction.findMany({
    where: {
      ...(scope === "verified" ? { verifiedBy: { not: null } } : {}),
      date: {
        ...(period.start ? { gte: period.start } : {}),
        ...(period.end ? { lt: period.end } : {}),
      },
    },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    select: { date: true, title: true, category: true, type: true, amount: true, note: true, verifiedBy: true },
  });
  return rows.map((r) => ({
    date: r.date,
    title: r.title,
    category: r.category,
    type: r.type,
    amount: num(r.amount),
    note: r.note,
    verified: r.verifiedBy !== null,
  }));
}

export type ExportTransaction = Awaited<ReturnType<typeof loadTransactionsForExport>>[number];
