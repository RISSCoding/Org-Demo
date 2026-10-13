import { ConfirmSubmit } from "@/components/confirm-submit";
import { createDivisionAction, deleteDivisionAction, updateDivisionAction } from "@/actions/divisions";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { btnLine, btnPrimary, cardCls, inputCls } from "@/lib/ui";

export const metadata = { title: "Divisi — HIMMAN UKRI" };
export const dynamic = "force-dynamic";

export default async function AdminDivisions({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  await requirePermission("member:manage");
  const { error, ok } = await searchParams;

  const [divisions, people] = await Promise.all([
    prisma.division.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { members: true } } } }),
    prisma.user.findMany({
      where: { approvalStatus: "APPROVED", role: { name: { in: ["SUPER_ADMIN", "ADMIN_EXECUTIVE", "MEMBER"] } } },
      orderBy: { fullName: "asc" },
      select: { id: true, fullName: true, nim: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="s-display s-title text-3xl text-[var(--s-head)]">Divisi</h1>
        <p className="text-sm text-muted-foreground">Kelola departemen/divisi dan ketuanya. Anggota ditempatkan dari halaman Anggota.</p>
      </div>

      {error && <p role="alert" className="rounded-sm bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {ok && <p role="status" className="rounded-sm bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">{ok}</p>}

      <form action={createDivisionAction} className={`${cardCls} flex flex-wrap items-end gap-3 p-4`}>
        <div className="min-w-56 flex-1 space-y-1.5">
          <label htmlFor="new-name" className="text-sm font-medium">Divisi baru</label>
          <input id="new-name" name="name" required minLength={2} maxLength={60} className={inputCls} placeholder="mis. Kewirausahaan" />
        </div>
        <button type="submit" className={btnPrimary}>Tambah</button>
      </form>

      <div className={`${cardCls} divide-y divide-border`}>
        {divisions.length === 0 && <p className="p-4 text-sm text-muted-foreground">Belum ada divisi.</p>}
        {divisions.map((d) => (
          <div key={d.id} className="flex flex-wrap items-end gap-3 p-4">
            <form action={updateDivisionAction} className="flex flex-1 flex-wrap items-end gap-3">
              <input type="hidden" name="id" value={d.id} />
              <div className="min-w-48 flex-1 space-y-1.5">
                <label htmlFor={`n-${d.id}`} className="text-sm font-medium">Nama ({d._count.members} anggota)</label>
                <input id={`n-${d.id}`} name="name" defaultValue={d.name} required minLength={2} maxLength={60} className={inputCls} />
              </div>
              <div className="min-w-56 flex-1 space-y-1.5">
                <label htmlFor={`l-${d.id}`} className="text-sm font-medium">Ketua</label>
                <select id={`l-${d.id}`} name="leaderId" defaultValue={d.leaderId ?? ""} className={inputCls}>
                  <option value="">— belum ditentukan —</option>
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>{p.fullName} ({p.nim})</option>
                  ))}
                </select>
              </div>
              <button type="submit" className={btnLine}>Simpan</button>
            </form>
            <form action={deleteDivisionAction}>
              <input type="hidden" name="id" value={d.id} />
              <ConfirmSubmit message={`Hapus divisi ${d.name}?`} className={`${btnLine} text-red-600 dark:text-red-400`}>
                Hapus
              </ConfirmSubmit>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
