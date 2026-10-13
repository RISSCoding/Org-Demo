"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

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
  if (count > 0) return back("error", `Divisi masih punya ${count} anggota. Pindahkan dulu sebelum menghapus.`);

  await prisma.division.delete({ where: { id } });
  await prisma.auditLog.create({ data: { userId: user.id, action: "DELETE", entity: "divisions", entityId: String(id) } });
  revalidatePath("/admin/divisions");
  return back("ok", "Divisi dihapus.");
}
