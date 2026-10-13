import { DuesAmountForm } from "@/components/settings-form";
import { getDuesAmount } from "@/lib/finance-service";
import { requirePermission } from "@/lib/rbac";
import { cardCls } from "@/lib/ui";

export const metadata = { title: "Pengaturan — HIMMAN UKRI" };
export const dynamic = "force-dynamic";

export default async function AdminSettings() {
  await requirePermission("finance:write");
  const amount = await getDuesAmount();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="s-display s-title text-3xl text-[var(--s-head)]">Pengaturan</h1>
        <p className="text-sm text-muted-foreground">Pengaturan umum aplikasi.</p>
      </div>
      <section className={`${cardCls} space-y-4 p-5`}>
        <h2 className="text-lg font-semibold">Iuran kas</h2>
        <DuesAmountForm amount={amount} />
      </section>
    </div>
  );
}
