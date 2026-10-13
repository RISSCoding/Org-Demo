import { TxForm } from "@/components/tx-form";
import { dateKey } from "@/lib/finance";
import { requirePermission } from "@/lib/rbac";

export const metadata = { title: "Tambah Transaksi — ORG" };

export default async function NewTransaction() {
  await requirePermission("finance:write");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="s-display s-title text-3xl text-[var(--s-head)]">Tambah transaksi</h1>
        <p className="text-sm text-muted-foreground">Transaksi baru perlu diverifikasi pengurus lain sebelum masuk laporan resmi.</p>
      </div>
      <TxForm today={dateKey(new Date())} />
    </div>
  );
}
