"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getTenantPrisma } from "@/lib/prisma-tenant";
import { requirePermission } from "@/lib/rbac";
import { DIVISION_ELIGIBLE_ROLES } from "@/lib/division-roles";
import { divisionRoleLabel } from "@/lib/member-title";
import type { FormState } from "@/types/forms";

const back = (kind: "error" | "ok", msg: string): never =>
  redirect(`/admin/divisions?${kind}=${encodeURIComponent(msg)}`);

const nameSchema = z.string().trim().min(2, "Nama divisi minimal 2 karakter").max(60, "Nama divisi maksimal 60 karakter");
const divisionRoleSchema = z.enum(["STAFF", "DEPT_SECRETARY", "DEPT_HEAD"]);

export async function createDivisionAction(fd: FormData): Promise<void> {
  const user = await requirePermission("member:manage");
  const tenantPrisma = getTenantPrisma(user.organizationId!);

  const name = nameSchema.safeParse(fd.get("name"));
  if (!name.success) return back("error", name.error.issues[0].message);

  if (await tenantPrisma.division.findUnique({ where: { name: name.data }, select: { id: true } })) {
    return back("error", "Nama divisi sudah dipakai.");
  }
  const d = await tenantPrisma.division.create({ data: { name: name.data } });
  await tenantPrisma.auditLog.create({ data: { userId: user.id, action: "CREATE", entity: "divisions", entityId: String(d.id) } });
  revalidatePath("/admin/divisions");
  return back("ok", "Divisi ditambahkan.");
}

export async function updateDivisionAction(fd: FormData): Promise<void> {
  const user = await requirePermission("member:manage");
  const id = Number(fd.get("id"));
  const name = nameSchema.safeParse(fd.get("name"));
  if (!Number.isInteger(id)) return back("error", "Divisi tidak valid.");
  if (!name.success) return back("error", name.error.issues[0].message);

  const leaderRaw = String(fd.get("leaderId") ?? "");
  const leaderId = leaderRaw === "" ? null : leaderRaw;
  if (leaderId && !(await tenantPrisma.user.findUnique({ where: { id: leaderId }, select: { id: true } }))) {
    return back("error", "Ketua divisi tidak ditemukan.");
  }
  const clash = await tenantPrisma.division.findFirst({ where: { name: name.data, NOT: { id } }, select: { id: true } });
  if (clash) return back("error", "Nama divisi sudah dipakai.");

  await tenantPrisma.division.update({ where: { id }, data: { name: name.data, leaderId } });
  await tenantPrisma.auditLog.create({ data: { userId: user.id, action: "UPDATE", entity: "divisions", entityId: String(id) } });
  revalidatePath("/admin/divisions");
  revalidatePath("/admin/members");
  return back("ok", "Divisi disimpan.");
}

export async function deleteDivisionAction(fd: FormData): Promise<void> {
  const user = await requirePermission("member:manage");
  const id = Number(fd.get("id"));
  if (!Number.isInteger(id)) return back("error", "Divisi tidak valid.");

  const count = await tenantPrisma.member.count({ where: { divisionId: id } });
  if (count > 0) return back("error", `Divisi masih punya ${count} anggota. Keluarkan dulu semuanya lewat panel Anggota sebelum menghapus.`);

  await tenantPrisma.division.delete({ where: { id } });
  await tenantPrisma.auditLog.create({ data: { userId: user.id, action: "DELETE", entity: "divisions", entityId: String(id) } });
  revalidatePath("/admin/divisions");
  return back("ok", "Divisi dihapus.");
}

/** Cek apakah divisi sudah punya Ketua Departemen lain (selain userId yang dikecualikan). */
async function findOtherHead(divisionId: number, exceptUserId: string) {
  return tenantPrisma.member.findFirst({
    where: { divisionId, divisionRole: "DEPT_HEAD", NOT: { userId: exceptUserId } },
    select: { user: { select: { fullName: true } } },
  });
}

export async function addDivisionMembersAction(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await requirePermission("member:manage");
  const divisionId = Number(fd.get("divisionId"));
  if (!Number.isInteger(divisionId)) return { error: "Divisi tidak valid." };

  const roleParsed = divisionRoleSchema.safeParse(fd.get("divisionRole") ?? "STAFF");
  if (!roleParsed.success) return { error: "Jabatan tidak valid." };
  const divisionRole = roleParsed.data;

  const userIds = [...new Set(fd.getAll("userId").map(String).filter(Boolean))];
  if (userIds.length === 0) return { error: "Pilih minimal satu anggota." };
  if (userIds.length > 200) return { error: "Maksimal 200 anggota sekali tambah." };
  if (divisionRole === "DEPT_HEAD" && userIds.length > 1) {
    return { error: "Ketua Departemen hanya boleh satu orang per divisi." };
  }

  const division = await tenantPrisma.division.findUnique({ where: { id: divisionId }, select: { id: true, name: true } });
  if (!division) return { error: "Divisi tidak ditemukan." };

  if (divisionRole === "DEPT_HEAD") {
    const other = await findOtherHead(divisionId, "");
    if (other) return { error: `${division.name} sudah punya Ketua Departemen (${other.user.fullName}). Turunkan dulu yang lama.` };
  }

  const users = await tenantPrisma.user.findMany({
    where: {
      id: { in: userIds },
      approvalStatus: "APPROVED",
      role: { name: { in: [...DIVISION_ELIGIBLE_ROLES] } },
      member: { isNot: null },
    },
    select: { id: true, member: { select: { divisionId: true } } },
  });
  if (users.length === 0) return { error: "Anggota yang dipilih tidak valid atau belum disetujui." };

  const toAdd = users.filter((u) => u.member?.divisionId !== divisionId);
  if (toAdd.length === 0) return { error: "Semua yang dipilih sudah menjadi anggota divisi ini." };
  const moved = toAdd.filter((u) => u.member?.divisionId != null).length;

  await prisma.$transaction([
    tenantPrisma.member.updateMany({
      where: { userId: { in: toAdd.map((u) => u.id) } },
      data: { divisionId, divisionRole },
    }),
    tenantPrisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "UPDATE",
        entity: "divisions",
        entityId: String(divisionId),
        meta: { addedMembers: toAdd.map((u) => u.id), divisionRole, movedFromOtherDivision: moved },
      },
    }),
  ]);

  revalidatePath("/admin/divisions");
  revalidatePath("/admin/members");
  return {
    success: `${toAdd.length} anggota ditambahkan ke ${division.name}${moved > 0 ? ` (${moved} dipindahkan dari divisi lain)` : ""}.`,
  };
}

export async function removeDivisionMemberAction(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await requirePermission("member:manage");
  const divisionId = Number(fd.get("divisionId"));
  const userId = String(fd.get("userId") ?? "");
  if (!Number.isInteger(divisionId) || !userId) return { error: "Data tidak valid." };

  const res = await tenantPrisma.member.updateMany({
    where: { userId, divisionId },
    data: { divisionId: null, divisionRole: null },
  });
  if (res.count === 0) return { error: "Anggota ini sudah tidak ada di divisi tersebut." };

  await tenantPrisma.auditLog.create({
    data: { userId: admin.id, action: "UPDATE", entity: "divisions", entityId: String(divisionId), meta: { removedMember: userId } },
  });
  revalidatePath("/admin/divisions");
  revalidatePath("/admin/members");
  return { success: "Anggota dikeluarkan dari divisi." };
}

/** Ubah jabatan satu anggota di divisinya sekarang. */
export async function setMemberDivisionRoleAction(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await requirePermission("member:manage");
  const userId = String(fd.get("userId") ?? "");
  const divisionId = Number(fd.get("divisionId"));
  const roleParsed = divisionRoleSchema.safeParse(fd.get("divisionRole"));
  if (!userId || !Number.isInteger(divisionId) || !roleParsed.success) {
    return { error: "Data tidak valid." };
  }
  const divisionRole = roleParsed.data;

  const member = await tenantPrisma.member.findUnique({
    where: { userId },
    select: {
      divisionId: true,
      divisionRole: true,
      user: { select: { fullName: true } },
      division: { select: { name: true } },
    },
  });
  if (!member || member.divisionId !== divisionId) {
    return { error: "Anggota ini bukan bagian dari divisi tersebut." };
  }
  if (member.divisionRole === divisionRole) return { success: "Tidak ada perubahan." };

  if (divisionRole === "DEPT_HEAD") {
    const other = await findOtherHead(divisionId, userId);
    if (other) {
      return { error: `Divisi ${member.division?.name ?? ""} sudah punya Ketua Departemen (${other.user.fullName}). Turunkan dulu yang lama.` };
    }
  }

  await prisma.$transaction([
    tenantPrisma.member.update({ where: { userId }, data: { divisionRole } }),
    tenantPrisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "UPDATE",
        entity: "members",
        entityId: userId,
        meta: { divisionId, from: member.divisionRole, to: divisionRole },
      },
    }),
  ]);
  revalidatePath("/admin/divisions");
  revalidatePath("/admin/members");
  return { success: `${member.user.fullName}: ${divisionRoleLabel(divisionRole)}.` };
}
