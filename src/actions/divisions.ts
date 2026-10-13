"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { DIVISION_ELIGIBLE_ROLES } from "@/lib/division-roles";
import type { FormState } from "@/types/forms";

const back = (kind: "error" | "ok", msg: string): never =>
  redirect(`/admin/divisions?${kind}=${encodeURIComponent(msg)}`);

const nameSchema = z.string().trim().min(2, "Nama divisi minimal 2 karakter").max(60, "Nama divisi maksimal 60 karakter");

export async function createDivisionAction(fd: FormData): Promise<void> {
  const user = await requirePermission("member:manage");
  const name = nameSchema.safeParse(fd.get("name"));
  if (!name.success) return back("error", name.error.issues[0].message);

  if (await prisma.division.findUnique({ where: { name: name.data }, select: { id: true } })) {
    return back("error", "Nama divisi sudah dipakai.");
  }
  const d = await prisma.division.create({ data: { name: name.data } });
  await prisma.auditLog.create({ data: { userId: user.id, action: "CREATE", entity: "divisions", entityId: String(d.id) } });
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
  if (leaderId && !(await prisma.user.findUnique({ where: { id: leaderId }, select: { id: true } }))) {
    return back("error", "Ketua divisi tidak ditemukan.");
  }
  const clash = await prisma.division.findFirst({ where: { name: name.data, NOT: { id } }, select: { id: true } });
  if (clash) return back("error", "Nama divisi sudah dipakai.");

  await prisma.division.update({ where: { id }, data: { name: name.data, leaderId } });
  await prisma.auditLog.create({ data: { userId: user.id, action: "UPDATE", entity: "divisions", entityId: String(id) } });
  revalidatePath("/admin/divisions");
  revalidatePath("/admin/members");
  return back("ok", "Divisi disimpan.");
}

export async function deleteDivisionAction(fd: FormData): Promise<void> {
  const user = await requirePermission("member:manage");
  const id = Number(fd.get("id"));
  if (!Number.isInteger(id)) return back("error", "Divisi tidak valid.");

  const count = await prisma.member.count({ where: { divisionId: id } });
  if (count > 0) return back("error", `Divisi masih punya ${count} anggota. Keluarkan dulu semuanya lewat panel Anggota sebelum menghapus.`);

  await prisma.division.delete({ where: { id } });
  await prisma.auditLog.create({ data: { userId: user.id, action: "DELETE", entity: "divisions", entityId: String(id) } });
  revalidatePath("/admin/divisions");
  return back("ok", "Divisi dihapus.");
}

export async function addDivisionMembersAction(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await requirePermission("member:manage");
  const divisionId = Number(fd.get("divisionId"));
  if (!Number.isInteger(divisionId)) return { error: "Divisi tidak valid." };

  const userIds = [...new Set(fd.getAll("userId").map(String).filter(Boolean))];
  if (userIds.length === 0) return { error: "Pilih minimal satu anggota." };
  if (userIds.length > 200) return { error: "Maksimal 200 anggota sekali tambah." };

  const division = await prisma.division.findUnique({ where: { id: divisionId }, select: { id: true, name: true } });
  if (!division) return { error: "Divisi tidak ditemukan." };

  const users = await prisma.user.findMany({
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
    prisma.member.updateMany({ where: { userId: { in: toAdd.map((u) => u.id) } }, data: { divisionId } }),
    prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "UPDATE",
        entity: "divisions",
        entityId: String(divisionId),
        meta: { addedMembers: toAdd.map((u) => u.id), movedFromOtherDivision: moved },
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

  const res = await prisma.member.updateMany({ where: { userId, divisionId }, data: { divisionId: null } });
  if (res.count === 0) return { error: "Anggota ini sudah tidak ada di divisi tersebut." };

  await prisma.auditLog.create({
    data: { userId: admin.id, action: "UPDATE", entity: "divisions", entityId: String(divisionId), meta: { removedMember: userId } },
  });
  revalidatePath("/admin/divisions");
  revalidatePath("/admin/members");
  return { success: "Anggota dikeluarkan dari divisi." };
}
