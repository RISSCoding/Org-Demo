import { FilterForm } from "@/components/filter-form";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Pencil, Plus, Search } from "lucide-react";
import { decideUser } from "@/actions/members";
import { Badge } from "@/components/badge";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { SubmitButton } from "@/components/submit-button";
import { APPROVAL_OPTIONS, MEMBER_STATUS_OPTIONS, ROLE_OPTIONS, roleLabel } from "@/lib/permissions-meta";
import { prisma } from "@/lib/prisma";
import { getTenantPrisma } from "@/lib/prisma-tenant";
import { requirePermission } from "@/lib/rbac";
import { btnGhost, btnPrimary, cardCls, inputCls } from "@/lib/ui";

export const metadata = { title: "Anggota — ORG" };

const PAGE_SIZE = 25;
type SP = { q?: string; role?: string; status?: string; approval?: string; page?: string };

const inList = (v: string | undefined, list: readonly { value: string }[]) => list.find((o) => o.value === v)?.value;

const roleTone = { SUPER_ADMIN: "warn", ADMIN_EXECUTIVE: "ok", MEMBER: "muted", ALUMNI: "muted" } as const;
const statusTone = { ACTIVE: "ok", INACTIVE: "bad", ALUMNI: "warn" } as const;
const statusLabel = { ACTIVE: "Aktif", INACTIVE: "Nonaktif", ALUMNI: "Alumni" } as const;

export default async function MembersPage({ searchParams }: { searchParams: Promise<SP> }) {
  const me = await requirePermission("member:manage");
  const tenantPrisma = getTenantPrisma(me.organizationId!);

  const canEdit = me.role === "SUPER_ADMIN";
  const sp = await searchParams;

  const q = sp.q?.trim() ?? "";
  const role = inList(sp.role, ROLE_OPTIONS);
  const status = inList(sp.status, MEMBER_STATUS_OPTIONS);
  const approval = inList(sp.approval, APPROVAL_OPTIONS);
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.UserWhereInput = {};
  if (q) {
    where.OR = [
      { fullName: { contains: q, mode: "insensitive" } },
      { nim: { contains: q } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }
  if (role) where.role = { name: role as "SUPER_ADMIN" | "ADMIN_EXECUTIVE" | "MEMBER" | "ALUMNI" };
  if (approval) where.approvalStatus = approval as "APPROVED" | "PENDING" | "REJECTED";
  if (status) where.member = { status: status as "ACTIVE" | "INACTIVE" | "ALUMNI" };

  const [pending, total, users] = await Promise.all([
    tenantPrisma.user.findMany({
      where: { approvalStatus: "PENDING" },
      orderBy: { createdAt: "asc" },
      select: { id: true, nim: true, fullName: true, email: true, batchYear: true },
    }),
    tenantPrisma.user.count({ where }),
    tenantPrisma.user.findMany({
      where,
      orderBy: { fullName: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true, nim: true, fullName: true, email: true, batchYear: true, approvalStatus: true,
        role: { select: { name: true } },
        member: { select: { status: true, ktaNumber: true, division: { select: { name: true } } } },
      },
    }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const href = (p: number) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (role) u.set("role", role);
    if (status) u.set("status", status);
    if (approval) u.set("approval", approval);
    if (p > 1) u.set("page", String(p));
    const s = u.toString();
    return s ? `/admin/members?${s}` : "/admin/members";
  };

  const th = "px-4 py-3 text-left text-sm font-semibold text-foreground";
  const td = "px-4 py-3 text-sm align-top";
  const sel = `${inputCls} w-auto`;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Anggota"
        description={
          canEdit
            ? "Tambah anggota, setujui pendaftaran, ubah data, peran, dan izin."
            : "Setujui pendaftaran dan lihat daftar anggota."
        }
        action={
          canEdit && (
            <Link href="/admin/members/new" className={btnPrimary}>
              <Plus className="size-4" /> Tambah anggota
            </Link>
          )
        }
      />

      {pending.length > 0 && (
        <section id="menunggu" className="scroll-mt-24 space-y-3">
          <h2 className="text-lg font-semibold text-[var(--s-head)]">
            Menunggu persetujuan <span className="text-[var(--state-warning-fg)]">({pending.length})</span>
          </h2>
          <div className={`${cardCls} overflow-x-auto`}>
            <table className="w-full min-w-[640px]">
              <thead className="border-b border-border">
                <tr>
                  <th className={th}>NPM</th><th className={th}>Nama</th><th className={th}>Email</th>
                  <th className={th}>Angkatan</th><th className={`${th} text-right`}>Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pending.map((u) => (
                  <tr key={u.id}>
                    <td className={td}>{u.nim}</td>
                    <td className={td}>{u.fullName}</td>
                    <td className={td}>{u.email}</td>
                    <td className={td}>{u.batchYear}</td>
                    <td className={`${td} text-right`}>
                      <form action={decideUser} className="inline-flex gap-2">
                        <input type="hidden" name="userId" value={u.id} />
                        <SubmitButton name="decision" value="APPROVED" pendingLabel="Menyetujui…" className={`${btnGhost} font-medium text-[var(--emerald)]`}>Setujui</SubmitButton>
                        <ConfirmSubmit
                          name="decision"
                          value="REJECTED"
                          title={`Tolak pendaftaran ${u.fullName}?`}
                          message="Pendaftar ini tidak akan bisa masuk ke portal. Hanya Super Admin yang bisa mengubah keputusan ini nanti."
                          confirmLabel="Tolak pendaftaran"
                          className={`${btnGhost} text-[var(--state-danger-fg)]`}
                        >
                          Tolak
                        </ConfirmSubmit>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--s-head)]">Semua anggota <span className="text-muted-foreground">({total})</span></h2>

        <FilterForm action="/admin/members" className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <label htmlFor="q" className="sr-only">Cari anggota</label>
            <input id="q" name="q" type="search" defaultValue={q} placeholder="Cari nama, NPM, email" className={`${inputCls} w-64 pl-9`} />
          </div>
          <select name="role" defaultValue={role ?? ""} className={sel}>
            <option value="">Semua peran</option>
            {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{roleLabel(o.value)}</option>)}
          </select>
          <select name="status" defaultValue={status ?? ""} className={sel}>
            <option value="">Semua status</option>
            {MEMBER_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select name="approval" defaultValue={approval ?? ""} className={sel}>
            <option value="">Semua persetujuan</option>
            {APPROVAL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label.split(" (")[0]}</option>)}
          </select>
          {(q || role || status || approval) && (
            <Link href="/admin/members" className={btnGhost}>Reset</Link>
          )}
        </FilterForm>

        {users.length === 0 ? (
          <EmptyState
            icon={Search}
            title={q || role || status || approval ? "Tidak ada anggota yang cocok" : "Belum ada anggota"}
            description={
              q || role || status || approval
                ? "Coba ubah filter atau kosongkan pencarian."
                : canEdit
                  ? "Tambahkan anggota pertama lewat tombol di atas."
                  : "Anggota akan muncul di sini setelah disetujui."
            }
            action={
              (q || role || status || approval) && (
                <Link href="/admin/members" className={btnGhost}>Hapus semua filter</Link>
              )
            }
          />
        ) : (
        <div className={`${cardCls} overflow-x-auto`}>
          <table className="w-full min-w-[820px]">
            <thead className="border-b border-border">
              <tr>
                <th className={th}>Nama</th><th className={th}>NPM</th><th className={th}>Angkatan</th>
                <th className={th}>Peran</th><th className={th}>Status</th><th className={th}>Divisi</th>
                {canEdit && <th className={`${th} text-right`}>Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-muted/50">
                  <td className={td}>
                    <p className="font-medium">{u.fullName}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </td>
                  <td className={td}>{u.nim}</td>
                  <td className={td}>{u.batchYear}</td>
                  <td className={td}><Badge tone={roleTone[u.role.name]}>{roleLabel(u.role.name)}</Badge></td>
                  <td className={`${td} space-y-1`}>
                    {u.approvalStatus !== "APPROVED" ? (
                      <Badge tone={u.approvalStatus === "PENDING" ? "warn" : "bad"}>
                        {u.approvalStatus === "PENDING" ? "Menunggu" : "Ditolak"}
                      </Badge>
                    ) : u.member ? (
                      <Badge tone={statusTone[u.member.status]}>{statusLabel[u.member.status]}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className={td}>{u.member?.division?.name ?? "—"}</td>
                  {canEdit && (
                    <td className={`${td} text-right`}>
                      <Link href={`/admin/members/${u.id}`} className={`${btnGhost} border border-border`}>
                        <Pencil className="size-3.5" /> Edit
                      </Link>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Halaman {page} dari {pages}</span>
            <div className="flex gap-2">
              {page > 1 && <Link href={href(page - 1)} className={`${btnGhost} border border-border`}>Sebelumnya</Link>}
              {page < pages && <Link href={href(page + 1)} className={`${btnGhost} border border-border`}>Berikutnya</Link>}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
