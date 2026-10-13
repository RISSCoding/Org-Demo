import { ConfirmSubmit } from "@/components/confirm-submit";
import { SubmitButton } from "@/components/submit-button";
import { FilterForm } from "@/components/filter-form";
import { Paperclip } from "lucide-react";
import { approveDues, rejectDues } from "@/actions/finance";
import { Badge } from "@/components/badge";
import { GenerateDuesForm } from "@/components/generate-dues-form";
import { formatDate } from "@/lib/datetime";
import { currentMonthKey, duesState, hasFinanceWrite, MONTH_RE, monthLabel, monthOptions, num, rupiah } from "@/lib/finance";
import { getDuesAmount, syncOverdue } from "@/lib/finance-service";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { btnGhost, cardCls, inputCls } from "@/lib/ui";

export const metadata = { title: "Iuran Kas — ORG" };

export default async function DuesAdmin({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const user = await requirePermission("finance:read");
  const canWrite = hasFinanceWrite(user);
  await syncOverdue();

  const sp = await searchParams;
  const month = sp.month && MONTH_RE.test(sp.month) ? sp.month : currentMonthKey();

  const [dues, amount] = await Promise.all([
    prisma.memberDues.findMany({
      where: { monthYear: month },
      orderBy: { user: { fullName: "asc" } },
      select: {
        id: true, amount: true, status: true, proofUrl: true, submittedAt: true, paidAt: true,
        user: { select: { fullName: true, nim: true } },
      },
    }),
    getDuesAmount(),
  ]);

  const count = (f: (d: (typeof dues)[number]) => boolean) => dues.filter(f).length;
  const summary = [
    { l: "Lunas", v: count((d) => d.status === "PAID") },
    { l: "Menunggu verifikasi", v: count((d) => d.status !== "PAID" && !!d.proofUrl) },
    { l: "Belum bayar", v: count((d) => d.status === "PENDING" && !d.proofUrl) },
    { l: "Terlambat", v: count((d) => d.status === "OVERDUE" && !d.proofUrl) },
  ];
  const collected = dues.filter((d) => d.status === "PAID").reduce((a, d) => a + num(d.amount), 0);
  const expected = dues.reduce((a, d) => a + num(d.amount), 0);

  const th = "px-4 py-3 text-left text-sm font-semibold text-foreground";
  const td = "px-4 py-3 text-sm";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="s-display s-title text-3xl text-[var(--s-head)]">Iuran kas</h1>
        <p className="text-sm text-muted-foreground">Tagihan bulanan, verifikasi bukti transfer, dan pembayaran tunai.</p>
      </div>

      {canWrite && (
        <section className={`${cardCls} space-y-3 p-5`}>
          <h2 className="text-lg font-semibold text-[var(--s-head)]">Buat tagihan bulanan</h2>
          <p className="text-sm text-muted-foreground">Untuk semua anggota aktif. Tagihan yang sudah ada tidak diduplikasi.</p>
          <GenerateDuesForm months={monthOptions(5, 1)} defaultMonth={currentMonthKey()} defaultAmount={amount} />
        </section>
      )}

      <FilterForm action="/admin/finance/dues" className="flex items-center gap-2">
        <select name="month" defaultValue={month} className={`${inputCls} w-44`}>
          {monthOptions(11, 1).map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
        </select>
      </FilterForm>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((s) => (
          <div key={s.l} className={`${cardCls} p-4`}>
            <p className="text-sm text-muted-foreground">{s.l}</p>
            <p className="s-display mt-1 text-2xl">{s.v}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Terkumpul <strong className="text-foreground">{rupiah(collected)}</strong> dari target {rupiah(expected)}.
      </p>

      <div className={`${cardCls} overflow-x-auto`}>
        <table className="w-full min-w-[760px]">
          <thead className="border-b border-border">
            <tr>
              <th className={th}>Anggota</th><th className={th}>NPM</th><th className={th}>Nominal</th>
              <th className={th}>Status</th><th className={`${th} text-right`}>Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {dues.length === 0 && (
              <tr><td colSpan={5} className={`${td} text-muted-foreground`}>Belum ada tagihan untuk {monthLabel(month)}.</td></tr>
            )}
            {dues.map((d) => {
              const st = duesState(d);
              return (
                <tr key={d.id}>
                  <td className={td}>{d.user.fullName}</td>
                  <td className={td}>{d.user.nim}</td>
                  <td className={td}>{rupiah(num(d.amount))}</td>
                  <td className={td}>
                    <Badge tone={st.tone}>{st.label}</Badge>
                    {d.paidAt && <p className="mt-1 text-xs text-muted-foreground">{formatDate(d.paidAt)}</p>}
                    {d.proofUrl && (
                      <a href={d.proofUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[var(--state-warning-fg)] underline underline-offset-4 hover:no-underline">
                        <Paperclip className="size-3" /> Lihat bukti
                      </a>
                    )}
                  </td>
                  <td className={`${td} text-right`}>
                    {canWrite && d.status !== "PAID" && (
                      <div className="inline-flex gap-1">
                        <form action={approveDues}>
                          <input type="hidden" name="id" value={d.id} />
                          <SubmitButton pendingLabel="Menyimpan…" className={`${btnGhost} font-medium text-[var(--emerald)]`}>{d.proofUrl ? "Setujui" : "Tandai lunas (tunai)"}</SubmitButton>
                        </form>
                        {d.proofUrl && (
                          <form action={rejectDues}>
                            <input type="hidden" name="id" value={d.id} />
                            <ConfirmSubmit
                              title="Tolak bukti transfer ini?"
                              message="Bukti dihapus dari tagihan, dan anggota perlu mengunggah bukti yang baru."
                              confirmLabel="Tolak bukti"
                              className={`${btnGhost} text-[var(--state-danger-fg)]`}
                            >
                              Tolak bukti
                            </ConfirmSubmit>
                          </form>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
