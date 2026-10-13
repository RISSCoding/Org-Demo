import { DuesAmountForm } from "@/components/settings-form";
import { PageHeader } from "@/components/ui/page-header";
import { getDuesAmount } from "@/lib/finance-service";
import { requirePermission } from "@/lib/rbac";
import { cardCls } from "@/lib/ui";

export const metadata = { title: "Pengaturan — ORG" };
export const dynamic = "force-dynamic";

export default async function AdminSettings() {
  await requirePermission("finance:write");
  const amount = await getDuesAmount();
  return (
    <div className="space-y-6">
      <PageHeader title="Pengaturan" description="Pengaturan umum aplikasi." />
      <section className={`${cardCls} space-y-4 p-5`}>
        <h2 className="text-lg font-semibold">Iuran kas</h2>
        <DuesAmountForm amount={amount} />
      </section>
    </div>
  );
}
