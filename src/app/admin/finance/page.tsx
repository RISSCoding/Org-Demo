import Link from "next/link";
import { FinanceCharts } from "@/components/finance-charts";
import { FinanceReports, type ReportSearchParams } from "@/components/finance-reports";
import { PageHeader } from "@/components/ui/page-header";
import { currentMonthKey, hasFinanceWrite, monthLabel, monthOptions, rupiah } from "@/lib/finance";
import { getOverview, syncOverdue } from "@/lib/finance-service";
import { resolveScope } from "@/lib/finance-statements";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { btnLine, btnPrimary, cardCls, inputCls } from "@/lib/ui";

export const metadata = { title: "Keuangan — HIMMAN UKRI" };

export default async function FinanceOverview({ searchParams }: { searchParams: Promise<ReportSearchParams> }) {
  const user = await requirePermission("finance:read");
  const sp = await searchParams;
  await syncOverdue();
  const key = currentMonthKey();
  const scope = resolveScope(true, sp.scope);

  const [ov, unverified, awaiting, duesAgg] = await Promise.all([
    getOverview({ verifiedOnly: scope === "verified" }),
    prisma.financialTransaction.count({ where: { verifiedBy: null } }),
    prisma.memberDues.count({ where: { proofUrl: { not: null }, status: { not: "PAID" } } }),
    prisma.memberDues.groupBy({ by: ["status"], where: { monthYear: key }, _count: true }),
  ]);
  const paid = duesAgg.find((d) => d.status === "PAID")?._count ?? 0;
  const totalDues = duesAgg.reduce((a, d) => a + d._count, 0);

  const stats = [
    { label: "Saldo kas", value: rupiah(ov.balance), accent: ov.balance < 0 ? "text-[var(--state-danger-fg)]" : "text-primary" },
    { label: `Pemasukan ${monthLabel(key)}`, value: rupiah(ov.thisMonth.income), accent: "text-[var(--state-success-fg)]" },
    { label: `Pengeluaran ${monthLabel(key)}`, value: rupiah(ov.thisMonth.expense), accent: "text-[var(--state-danger-fg)]" },
    { label: "Iuran bulan ini", value: totalDues ? `${paid} / ${totalDues} lunas` : "Belum ada tagihan", accent: "text-[var(--state-warning-fg)]" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Keuangan"
        description={
          scope === "verified"
            ? "Angka di sini hanya dari transaksi yang sudah diverifikasi."
            : "Angka di sini termasuk transaksi yang belum diverifikasi."
        }
        action={
          <>
            <Link href="/admin/finance/dues" className={btnLine}>Iuran kas</Link>
            <Link href="/admin/finance/transactions" className={btnLine}>Transaksi</Link>
            {hasFinanceWrite(user) && (
              <Link href="/admin/finance/transactions/new" className={btnPrimary}>Tambah transaksi</Link>
            )}
          </>
        }
      />

      {(unverified > 0 || awaiting > 0) && (
        <div className="space-y-2 border border-[var(--state-warning-border)] bg-[var(--state-warning-bg)] px-4 py-3 text-sm text-[var(--state-warning-fg)]">
          {unverified > 0 && (
            <p>
              <strong>{unverified}</strong> transaksi belum diverifikasi.{" "}
              <Link href="/admin/finance/transactions?status=unverified" className="font-medium underline underline-offset-4">Tinjau</Link>
            </p>
          )}
          {awaiting > 0 && (
            <p>
              <strong>{awaiting}</strong> bukti iuran menunggu persetujuan.{" "}
              <Link href="/admin/finance/dues" className="font-medium underline underline-offset-4">Tinjau</Link>
            </p>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`${cardCls} p-5`}>
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className={`s-display mt-2 text-2xl ${s.accent}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <FinanceCharts monthly={ov.monthly} expenseByCategory={ov.expenseByCategory} />

      <FinanceReports staff basePath="/admin/finance" sp={sp} />

      <section className={`${cardCls} space-y-3 p-5`}>
        <div>
          <h2 className="text-lg font-semibold text-[var(--s-head)]">Laporan bulanan resmi</h2>
          <p className="text-sm text-muted-foreground">PDF bertanda tangan dan Excel per bulan. Hanya memuat transaksi yang sudah diverifikasi.</p>
        </div>
        <form action="/api/finance/report" method="get" className="flex flex-wrap items-center gap-2">
          <select name="month" defaultValue={key} className={`${inputCls} w-44`}>
            {monthOptions(11, 0).map((m) => (
              <option key={m} value={m}>{monthLabel(m)}</option>
            ))}
          </select>
          <button type="submit" name="format" value="pdf" className={btnPrimary}>Unduh PDF</button>
          <button type="submit" name="format" value="xlsx" className={btnLine}>Unduh Excel</button>
        </form>
      </section>
    </div>
  );
}
