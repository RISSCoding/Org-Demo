import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MemberForm, ResetPasswordForm } from "@/components/member-form";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

export const metadata = { title: "Edit Anggota — HIMMAN UKRI" };

export default async function EditMember({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const me = await requirePermission("member:manage");
  if (me.role !== "SUPER_ADMIN") redirect("/admin/members");

  const { id } = await params;
  const { created } = await searchParams;
  const [u, divisions] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        member: true,
        extraPerms: { include: { permission: true } },
      },
    }),
    prisma.division.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!u) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-2">
        <Link href="/admin/members" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Kembali ke daftar anggota
        </Link>
        <h1 className="s-display s-title text-3xl text-[var(--s-head)]">{u.fullName}</h1>
        <p className="text-sm text-muted-foreground">
          {u.nim}{u.member ? ` · ${u.member.ktaNumber}` : ""}
        </p>
      </div>

      {created && (
        <p role="status" className="rounded-sm bg-[var(--emerald)]/10 px-3 py-2 text-sm text-[var(--emerald)]">
          Anggota berhasil dibuat. Sampaikan NPM dan password sementara ke yang bersangkutan.
        </p>
      )}

      <MemberForm
        divisions={divisions}
        m={{
          id: u.id,
          fullName: u.fullName,
          email: u.email,
          nim: u.nim,
          phoneNumber: u.phoneNumber ?? "",
          batchYear: u.batchYear,
          roleName: u.role.name,
          approvalStatus: u.approvalStatus,
          memberStatus: u.member?.status ?? "ACTIVE",
          divisionId: u.member?.divisionId ?? null,
          department: u.member?.department ?? "",
          perms: u.extraPerms.map((p) => p.permission.code),
          isSelf: u.id === me.id,
          hasMember: !!u.member,
        }}
      />

      <ResetPasswordForm id={u.id} />
    </div>
  );
}
