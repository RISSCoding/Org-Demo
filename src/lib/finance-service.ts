import { prisma } from "@/lib/prisma";
import { currentMonthKey, dateKey, lastMonths, monthLabel, monthRange, num } from "@/lib/finance";

/** Idempotent: dues of past months that are still PENDING become OVERDUE. */
export async function syncOverdue() {
  await prisma.memberDues.updateMany({
    where: { status: "PENDING", monthYear: { lt: currentMonthKey() } },
    data: { status: "OVERDUE" },
  });
}

export async function getDuesAmount() {
  const s = await prisma.appSetting.findUnique({ where: { key: "dues_amount" } });
  const n = Number(s?.value);
  return Number.isFinite(n) && n > 0 ? n : 10000;
}

export async function getOverview({ verifiedOnly }: { verifiedOnly: boolean }) {
  const where = verifiedOnly ? { verifiedBy: { not: null } } : {};
  const months = lastMonths(6);
  const { start } = monthRange(months[0]);

  const [totals, rows] = await Promise.all([
    prisma.financialTransaction.groupBy({ by: ["type"], where, _sum: { amount: true } }),
    prisma.financialTransaction.findMany({
      where: { ...where, date: { gte: start } },
      select: { type: true, amount: true, category: true, date: true },
    }),
  ]);

  const income = num(totals.find((t) => t.type === "INCOME")?._sum.amount);
  const expense = num(totals.find((t) => t.type === "EXPENSE")?._sum.amount);

  const monthly = months.map((key) => ({ key, label: monthLabel(key, "short"), income: 0, expense: 0 }));
  const byCat = new Map<string, number>();
  for (const r of rows) {
    const bucket = monthly.find((m) => m.key === dateKey(r.date).slice(0, 7));
    const v = num(r.amount);
    if (bucket) {
      if (r.type === "INCOME") bucket.income += v;
      else bucket.expense += v;
    }
    if (r.type === "EXPENSE") byCat.set(r.category, (byCat.get(r.category) ?? 0) + v);
  }

  return {
    income,
    expense,
    balance: income - expense,
    monthly,
    thisMonth: monthly[monthly.length - 1],
    expenseByCategory: [...byCat.entries()].map(([name, value]) => ({ name, value })),
  };
}
