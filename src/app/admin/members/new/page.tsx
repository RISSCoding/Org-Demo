import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { NewMemberForm } from "@/components/new-member-form";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

export const metadata = { title: "Tambah Anggota — ORG" };

export default async function NewMemberPage() {
  const me = await requirePermission("member:manage");
  if (me.role !== "SUPER_ADMIN") redirect("/admin/members");

  const divisions = await prisma.division.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });

  return (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-2">
        <Link href="/admin/members" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Kembali ke daftar anggota
        </Link>
        <h1 className="s-display s-title text-3xl text-[var(--s-head)]">Tambah anggota</h1>
        <p className="text-sm text-muted-foreground">
          Akun langsung berstatus disetujui dan nomor KTA diterbitkan otomatis, tanpa melalui pendaftaran mandiri.
        </p>
      </div>
      <NewMemberForm divisions={divisions} thisYear={new Date().getFullYear()} />
    </div>
  );
}
