import type { TxCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { monthLabel, monthRange, num } from "@/lib/finance";

export type ReportRow = {
  date: Date;
  title: string;
  category: TxCategory;
  income: number;
  expense: number;
};

export type MonthlyReport = {
  month: string;
  label: string;
  opening: number;
  income: number;
  expense: number;
  closing: number;
  rows: ReportRow[];
  unverifiedExcluded: number;
  dues: { paid: number; pending: number; overdue: number };
};

/** Official report: verified transactions only. */
export async function getMonthlyReport(month: string): Promise<MonthlyReport> {
  const { start, end } = monthRange(month);
  const verified = { verifiedBy: { not: null } };

  const [before, txs, unverified, duesAgg] = await Promise.all([
    prisma.financialTransaction.groupBy({
      by: ["type"],
      where: { ...verified, date: { lt: start } },
      _sum: { amount: true },
    }),
    prisma.financialTransaction.findMany({
      where: { ...verified, date: { gte: start, lt: end } },
      orderBy: { date: "asc" },
      select: { date: true, title: true, category: true, type: true, amount: true },
    }),
    prisma.financialTransaction.count({ where: { verifiedBy: null, date: { gte: start, lt: end } } }),
    prisma.memberDues.groupBy({ by: ["status"], where: { monthYear: month }, _count: true }),
  ]);

  const opening =
    num(before.find((b) => b.type === "INCOME")?._sum.amount) -
    num(before.find((b) => b.type === "EXPENSE")?._sum.amount);

  const rows: ReportRow[] = txs.map((t) => ({
    date: t.date,
    title: t.title,
    category: t.category,
    income: t.type === "INCOME" ? num(t.amount) : 0,
    expense: t.type === "EXPENSE" ? num(t.amount) : 0,
  }));
  const income = rows.reduce((a, r) => a + r.income, 0);
  const expense = rows.reduce((a, r) => a + r.expense, 0);
  const c = (s: string) => duesAgg.find((d) => d.status === s)?._count ?? 0;

  return {
    month,
    label: monthLabel(month),
    opening,
    income,
    expense,
    closing: opening + income - expense,
    rows,
    unverifiedExcluded: unverified,
    dues: { paid: c("PAID"), pending: c("PENDING"), overdue: c("OVERDUE") },
  };
}
