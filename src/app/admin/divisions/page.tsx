import { createDivisionAction } from "@/actions/divisions";
import { DivisionsBoard } from "@/components/divisions-board";
import { OfficersBoard } from "@/components/officers-board";
import { DIVISION_ELIGIBLE_ROLES } from "@/lib/division-roles";
import { OFFICER_LABEL, OFFICER_SLOTS } from "@/lib/officer-meta";
import { getOfficers } from "@/lib/officers";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { PageHeader } from "@/components/ui/page-header";
import { alertErr, alertOk, btnPrimary, cardCls, inputCls } from "@/lib/ui";

export const metadata = { title: "Divisi — ORG" };
export const dynamic = "force-dynamic";

export default async function AdminDivisions({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  await requirePermission("member:manage");
  const { error, ok } = await searchParams;

  const [divisions, users, officers] = await Promise.all([
    prisma.division.findMany({
      orderBy: { name: "asc" },
      include: {
        members: {
          select: {
            user: { select: { id: true, fullName: true, nim: true } },
            divisionRole: true,
          },
        },
      },
    }),
    prisma.user.findMany({
      where: { approvalStatus: "APPROVED", role: { name: { in: [...DIVISION_ELIGIBLE_ROLES] } } },
      orderBy: { fullName: "asc" },
      select: { id: true, fullName: true, nim: true, signatureUrl: true, member: { select: { divisionId: true } } },
    }),
    getOfficers(),
  ]);

  const people = users.map((u) => ({
    id: u.id,
    fullName: u.fullName,
    nim: u.nim,
    isMember: u.member !== null,
    divisionId: u.member?.divisionId ?? null,
  }));
  const officerSlots = OFFICER_SLOTS.map((position) => ({
    position,
    label: OFFICER_LABEL[position],
    officerId: officers.slots[position]?.id ?? null,
    userId: officers.slots[position]?.userId ?? null,
    name: officers.slots[position]?.name ?? null,
    signatureUrl: officers.slots[position]?.signatureUrl ?? null,
  }));
  const signedUserIds = users.filter((u) => u.signatureUrl).map((u) => u.id);
  const officerOptions = people.map((p) => ({ value: p.id, label: p.fullName, hint: p.nim }));
  const rows = divisions.map((d) => ({
    id: d.id,
    name: d.name,
    leaderId: d.leaderId,
    members: d.members
      .map((m) => ({
        userId: m.user.id,
        fullName: m.user.fullName,
        nim: m.user.nim,
        divisionRole: m.divisionRole,
      }))
      .sort((a, b) => a.fullName.localeCompare(b.fullName, "id")),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengurus & Divisi"
        description="Atur pengurus inti, penandatangan eksternal, dan Dewan Pembina beserta tanda tangannya, lalu kelola departemen/divisi, ketuanya, dan anggotanya. Anggota juga masih bisa ditempatkan dari halaman Anggota."
      />

      {error && <p role="alert" className={alertErr}>{error}</p>}
      {ok && <p role="status" className={alertOk}>{ok}</p>}

      <OfficersBoard slots={officerSlots} advisors={officers.advisors.map((a) => ({ id: a.id, name: a.name }))} options={officerOptions} />

      <h2 className="pt-2 text-lg font-semibold">Divisi</h2>

      <form action={createDivisionAction} className={`${cardCls} flex flex-wrap items-end gap-3 p-4`}>
        <div className="min-w-56 flex-1 space-y-1.5">
          <label htmlFor="new-name" className="text-sm font-medium">Divisi baru</label>
          <input id="new-name" name="name" required minLength={2} maxLength={60} className={inputCls} placeholder="mis. Kewirausahaan" />
        </div>
        <button type="submit" className={btnPrimary}>Tambah</button>
      </form>

      <DivisionsBoard divisions={rows} people={people} signedUserIds={signedUserIds} />
    </div>
  );
}
