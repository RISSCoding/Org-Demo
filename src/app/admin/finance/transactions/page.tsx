import { FilterForm } from "@/components/filter-form";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Paperclip, Plus, Receipt } from "lucide-react";
import { verifyTransaction, deleteTransaction } from "@/actions/finance";
import { Badge } from "@/components/badge";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { SubmitButton } from "@/components/submit-button";
import { formatDate } from "@/lib/datetime";
import { CATEGORY_LABEL, hasFinanceWrite, MONTH_RE, monthLabel, monthOptions, monthRange, num, rupiah } from "@/lib/finance";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { btnGhost, btnPrimary, cardCls, inputCls } from "@/lib/ui";

export const metadata = { title: "Transaksi — HIMMAN UKRI" };

type SP = { month?: string; type?: string; category?: string; status?: string };

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requirePermission("finance:read");
  const canWrite = hasFinanceWrite(user);
  const sp = await searchParams;

  const where: Prisma.FinancialTransactionWhereInput = {};
  if (sp.month && MONTH_RE.test(sp.month)) {
    const { start, end } = monthRange(sp.month);
    where.date = { gte: start, lt: end };
  }
  if (sp.type === "INCOME" || sp.type === "EXPENSE") where.type = sp.type;
  if (sp.category && sp.category in CATEGORY_LABEL) where.category = sp.category as keyof typeof CATEGORY_LABEL;
  if (sp.status === "unverified") where.verifiedBy = null;
  if (sp.status === "verified") where.verifiedBy = { not: null };

  const [rows, totals] = await Promise.all([
    prisma.financialTransaction.findMany({
      where,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 200,
      select: {
        id: true, date: true, title: true, note: true, type: true, category: true, amount: true,
        proofOfPaymentUrl: true, createdBy: true, verifiedBy: true,
        _count: { select: { dues: true } },
      },
    }),
    prisma.financialTransaction.groupBy({ by: ["type"], where, _sum: { amount: true } }),
  ]);
  const inc = num(totals.find((t) => t.type === "INCOME")?._sum.amount);
  const exp = num(totals.find((t) => t.type === "EXPENSE")?._sum.amount);

  const th = "px-4 py-3 text-left text-sm font-semibold text-foreground";
  const td = "px-4 py-3 text-sm align-top";
  const sel = `${inputCls} w-auto`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transaksi"
        description="Buku kas pemasukan dan pengeluaran."
        action={
          canWrite && (
            <Link href="/admin/finance/transactions/new" className={btnPrimary}>
              <Plus className="size-4" /> Tambah transaksi
            </Link>
          )
        }
      />

      <FilterForm action="/admin/finance/transactions" className="flex flex-wrap items-center gap-2">
        <select name="month" defaultValue={sp.month ?? ""} className={sel}>
          <option value="">Semua bulan</option>
          {monthOptions(11, 0).map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
        </select>
        <select name="type" defaultValue={sp.type ?? ""} className={sel}>
          <option value="">Semua jenis</option>
          <option value="INCOME">Pemasukan</option>
          <option value="EXPENSE">Pengeluaran</option>
        </select>
        <select name="category" defaultValue={sp.category ?? ""} className={sel}>
          <option value="">Semua kategori</option>
          {Object.entries(CATEGORY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select name="status" defaultValue={sp.status ?? ""} className={sel}>
          <option value="">Semua status</option>
          <option value="verified">Terverifikasi</option>
          <option value="unverified">Belum diverifikasi</option>
        </select>
      </FilterForm>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { l: "Pemasukan", v: rupiah(inc), c: "text-[var(--emerald)]" },
          { l: "Pengeluaran", v: rupiah(exp), c: "text-[var(--state-danger-fg)]" },
          { l: "Selisih", v: rupiah(inc - exp), c: "text-primary" },
        ].map((s) => (
          <div key={s.l} className={`${cardCls} p-4`}>
            <p className="text-sm text-muted-foreground">{s.l} (sesuai filter)</p>
            <p className={`s-display mt-1 text-xl ${s.c}`}>{s.v}</p>
          </div>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Tidak ada transaksi"
          description="Belum ada pemasukan atau pengeluaran pada filter ini. Tambahkan transaksi atau ubah filter bulan."
          action={
            canWrite && (
              <Link href="/admin/finance/transactions/new" className={btnPrimary}>
                <Plus className="size-4" /> Tambah transaksi
              </Link>
            )
          }
        />
      ) : (
      <div className={`${cardCls} overflow-x-auto`}>
        <table className="w-full min-w-[860px]">
          <thead className="border-b border-border">
            <tr>
              <th className={th}>Tanggal</th><th className={th}>Uraian</th><th className={th}>Kategori</th>
              <th className={`${th} text-right`}>Jumlah</th><th className={th}>Status</th><th className={`${th} text-right`}>Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => {
              const verified = !!r.verifiedBy;
              const mine = r.createdBy === user.id;
              const canVerify = canWrite && !verified && (!mine || user.role === "SUPER_ADMIN");
              const canDelete = canWrite && !verified && r._count.dues === 0 && (mine || user.role === "SUPER_ADMIN");
              return (
                <tr key={r.id}>
                  <td className={`${td} whitespace-nowrap`}>{formatDate(r.date)}</td>
                  <td className={td}>
                    <p className="font-medium">{r.title}</p>
                    {r.note && <p className="text-xs text-muted-foreground">{r.note}</p>}
                    {r.proofOfPaymentUrl && (
                      <a href={r.proofOfPaymentUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[var(--state-warning-fg)] underline underline-offset-4 hover:no-underline">
                        <Paperclip className="size-3" /> Bukti
                      </a>
                    )}
                  </td>
                  <td className={td}>{CATEGORY_LABEL[r.category]}</td>
                  <td className={`${td} whitespace-nowrap text-right font-medium ${r.type === "INCOME" ? "text-[var(--emerald)]" : "text-[var(--state-danger-fg)]"}`}>
                    {r.type === "INCOME" ? "+" : "−"}{rupiah(num(r.amount))}
                  </td>
                  <td className={td}>{verified ? <Badge tone="ok">Terverifikasi</Badge> : <Badge tone="warn">Belum</Badge>}</td>
                  <td className={`${td} text-right`}>
                    <div className="inline-flex gap-1">
                      {canVerify && (
                        <form action={verifyTransaction}>
                          <input type="hidden" name="id" value={r.id} />
                          <SubmitButton pendingLabel="Memverifikasi…" className={`${btnGhost} font-medium text-[var(--emerald)]`}>Verifikasi</SubmitButton>
                        </form>
                      )}
                      {canDelete && (
                        <form action={deleteTransaction}>
                          <input type="hidden" name="id" value={r.id} />
                          <ConfirmSubmit
                            title="Hapus transaksi ini?"
                            message={`“${r.title}” dihapus dari pembukuan. Tindakan ini tidak bisa dibatalkan.`}
                            confirmLabel="Hapus transaksi"
                            className={`${btnGhost} text-[var(--state-danger-fg)]`}
                          >
                            Hapus
                          </ConfirmSubmit>
                        </form>
                      )}
                    </div>
                    {!verified && mine && user.role !== "SUPER_ADMIN" && canWrite && (
                      <p className="mt-1 text-[11px] text-muted-foreground">Diverifikasi oleh pengurus lain</p>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}
      {rows.length === 200 && <p className="text-xs text-muted-foreground">Menampilkan 200 transaksi terbaru. Persempit dengan filter.</p>}
    </div>
  );
}
