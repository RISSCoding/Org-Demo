import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ImportMembersForm } from "@/components/import-members-form";
import { requirePermission } from "@/lib/rbac";

export const metadata = { title: "Impor Anggota — HIMMAN UKRI" };

export default async function ImportMembersPage() {
  const me = await requirePermission("member:manage");
  if (me.role !== "SUPER_ADMIN") redirect("/admin/members");

  return (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-2">
        <Link href="/admin/members" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Kembali ke daftar anggota
        </Link>
        <h1 className="s-display s-title text-3xl text-[var(--s-head)]">Impor anggota dari spreadsheet</h1>
        <p className="text-sm text-muted-foreground">
          Unggah data mahasiswa baru dari universitas, pilih prodi, lalu semua mahasiswa di prodi itu dibuatkan akun sekaligus.
          Password awal: <code>NPM@ukri[2 digit angkatan]</code>, misalnya <code>20251610207@ukri25</code>.
        </p>
      </div>
      <ImportMembersForm />
    </div>
  );
}
