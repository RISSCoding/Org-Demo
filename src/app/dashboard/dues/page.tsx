import { auth } from "@/auth";
import { Badge } from "@/components/badge";
import { DuesProofForm } from "@/components/dues-proof-form";
import { formatDate } from "@/lib/datetime";
import { duesState, monthLabel, num, rupiah } from "@/lib/finance";
import { syncOverdue } from "@/lib/finance-service";
import { prisma } from "@/lib/prisma";
import { cardCls } from "@/lib/ui";

export const metadata = { title: "Iuran Kas — HIMMAN UKRI" };

export default async function MemberDues() {
  const session = await auth();
  await syncOverdue();
  const dues = await prisma.memberDues.findMany({
    where: { userId: session!.user.id },
    orderBy: { monthYear: "desc" },
    select: { id: true, monthYear: true, amount: true, status: true, proofUrl: true, submittedAt: true, paidAt: true },
  });
  const unpaid = dues.filter((d) => d.status !== "PAID");
  const total = unpaid.reduce((a, d) => a + num(d.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="s-display s-title text-3xl text-[var(--s-head)]">Iuran kas</h1>
        <p className="text-sm text-muted-foreground">
          Transfer ke rekening bendahara, lalu unggah foto bukti transfer di tagihan terkait.
        </p>
      </div>

      {unpaid.length > 0 && (
        <div className="rounded-sm border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-4 py-3 text-sm">
          {unpaid.length} tagihan belum lunas, total <strong>{rupiah(total)}</strong>.
        </div>
      )}

      {dues.length === 0 ? (
        <p className={`${cardCls} p-6 text-sm text-muted-foreground`}>Belum ada tagihan iuran untukmu.</p>
      ) : (
        <div className={`${cardCls} divide-y divide-border`}>
          {dues.map((d) => {
            const st = duesState(d);
            return (
              <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{monthLabel(d.monthYear)}</p>
                  <p className="text-sm text-muted-foreground">{rupiah(num(d.amount))}</p>
                  {d.paidAt && <p className="text-xs text-muted-foreground">Dibayar {formatDate(d.paidAt)}</p>}
                </div>
                <div className="space-y-2 text-right">
                  <Badge tone={st.tone}>{st.label}</Badge>
                  {d.status !== "PAID" && !d.proofUrl && <DuesProofForm duesId={d.id} />}
                  {d.status !== "PAID" && d.proofUrl && d.submittedAt && (
                    <p className="text-xs text-muted-foreground">Bukti dikirim {formatDate(d.submittedAt)}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
