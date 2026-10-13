import { Badge } from "@/components/badge";
import { FinanceCharts } from "@/components/finance-charts";
import { FinanceReports, type ReportSearchParams } from "@/components/finance-reports";
import { formatDate } from "@/lib/datetime";
import { CATEGORY_LABEL, currentMonthKey, monthLabel, num, rupiah } from "@/lib/finance";
import { getOverview } from "@/lib/finance-service";
import { prisma } from "@/lib/prisma";
import { cardCls } from "@/lib/ui";

export const metadata = { title: "Transparansi Kas — HIMMAN UKRI" };

export default async function PublicFinance({ searchParams }: { searchParams: Promise<ReportSearchParams> }) {
  const sp = await searchParams;
  const [ov, recent] = await Promise.all([
    getOverview({ verifiedOnly: true }),
    prisma.financialTransaction.findMany({
      where: { verifiedBy: { not: null } },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 15,
      select: { id: true, date: true, title: true, type: true, category: true, amount: true }, // never note/proof/creator
    }),
  ]);
  const key = currentMonthKey();

  const stats = [
    { l: "Saldo kas", v: rupiah(ov.balance), c: "text-primary" },
    { l: `Pemasukan ${monthLabel(key)}`, v: rupiah(ov.thisMonth.income), c: "text-[var(--emerald)]" },
    { l: `Pengeluaran ${monthLabel(key)}`, v: rupiah(ov.thisMonth.expense), c: "text-[var(--state-danger-fg)]" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="s-display s-title text-3xl text-[var(--s-head)]">Transparansi kas</h1>
        <p className="text-sm text-muted-foreground">Ringkasan keuangan himpunan. Hanya transaksi yang sudah diverifikasi.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.l} className={`${cardCls} p-5`}>
            <p className="text-sm text-muted-foreground">{s.l}</p>
            <p className={`s-display mt-2 text-2xl ${s.c}`}>{s.v}</p>
          </div>
        ))}
      </div>

      <FinanceCharts monthly={ov.monthly} expenseByCategory={ov.expenseByCategory} />

      <FinanceReports staff={false} basePath="/dashboard/finance" sp={sp} />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--s-head)]">Transaksi terbaru</h2>
        <div className={`${cardCls} divide-y divide-border`}>
          {recent.length === 0 && <p className="p-4 text-sm text-muted-foreground">Belum ada transaksi terverifikasi.</p>}
          {recent.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate font-medium">{t.title}</p>
                <p className="text-xs text-muted-foreground">{formatDate(t.date)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Badge>{CATEGORY_LABEL[t.category]}</Badge>
                <span className={`text-sm font-medium ${t.type === "INCOME" ? "text-[var(--emerald)]" : "text-[var(--state-danger-fg)]"}`}>
                  {t.type === "INCOME" ? "+" : "−"}{rupiah(num(t.amount))}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
