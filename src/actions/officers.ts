"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { DIVISION_ELIGIBLE_ROLES } from "@/lib/division-roles";
import { OFFICER_LABEL, isOfficerSlot } from "@/lib/officer-meta";
import { discardSignature } from "@/lib/signatures";
import type { FormState } from "@/types/forms";

const nameSchema = z.string().trim().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter");

/** Mengisi, mengganti, atau mengosongkan satu jabatan pengurus inti (satu pemegang per jabatan). */
export async function saveOfficerSlotAction(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await requirePermission("member:manage");
  const position = String(fd.get("position") ?? "");
  if (!isOfficerSlot(position)) return { error: "Jabatan tidak valid." };

  const userRaw = String(fd.get("userId") ?? "");
  const nameRaw = String(fd.get("name") ?? "").trim();
  if (userRaw && nameRaw) return { error: "Pilih salah satu: anggota dari daftar atau nama manual." };

  let userId: string | null = null;
  let name: string | null = null;
  if (userRaw) {
    const user = await prisma.user.findFirst({
      where: { id: userRaw, approvalStatus: "APPROVED", role: { name: { in: [...DIVISION_ELIGIBLE_ROLES] } } },
      select: { id: true, fullName: true },
    });
    if (!user) return { error: "Akun tidak ditemukan atau belum disetujui." };
    userId = user.id;
    name = user.fullName;
  } else if (nameRaw) {
    const parsed = nameSchema.safeParse(nameRaw);
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    name = parsed.data;
  }

  // Orang yang sama disimpan ulang: baris dan tanda tangannya dipertahankan. Orang berbeda atau jabatan dikosongkan:
  // baris lama dihapus beserta tanda tangannya, karena tanda tangan itu milik pemegang sebelumnya.
  const existing = await prisma.orgOfficer.findMany({ where: { position }, select: { id: true, userId: true, name: true, signatureUrl: true } });
  const sameHolder = !!name && existing.length === 1 && existing[0].userId === userId && (userId !== null || existing[0].name === name);

  await prisma.$transaction(async (tx) => {
    if (sameHolder) {
      await tx.orgOfficer.update({ where: { id: existing[0].id }, data: { name } });
    } else {
      await tx.orgOfficer.deleteMany({ where: { position } });
      if (name) await tx.orgOfficer.create({ data: { position, userId, name } });
    }
    await tx.auditLog.create({
      data: { userId: admin.id, action: "UPDATE", entity: "org_officers", entityId: position, meta: { holderUserId: userId, holderName: name } },
    });
  });
  if (!sameHolder) for (const row of existing) await discardSignature(row.signatureUrl);

  revalidatePath("/admin/divisions");
  return { success: name ? `${OFFICER_LABEL[position]}: ${name}.` : `${OFFICER_LABEL[position]} dikosongkan.` };
}

export async function addAdvisorAction(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await requirePermission("member:manage");
  const parsed = nameSchema.safeParse(fd.get("name"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const dup = await prisma.orgOfficer.findFirst({
    where: { position: "ADVISOR", name: { equals: parsed.data, mode: "insensitive" } },
    select: { id: true },
  });
  if (dup) return { error: "Nama itu sudah ada di Dewan Pembina." };

  const row = await prisma.orgOfficer.create({ data: { position: "ADVISOR", name: parsed.data } });
  await prisma.auditLog.create({
    data: { userId: admin.id, action: "CREATE", entity: "org_officers", entityId: String(row.id), meta: { position: "ADVISOR", holderName: parsed.data } },
  });
  revalidatePath("/admin/divisions");
  return { success: `${parsed.data} ditambahkan ke Dewan Pembina.` };
}

export async function removeAdvisorAction(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await requirePermission("member:manage");
  const id = Number(fd.get("id"));
  if (!Number.isInteger(id)) return { error: "Data tidak valid." };

  const row = await prisma.orgOfficer.findFirst({ where: { id, position: "ADVISOR" }, select: { signatureUrl: true } });
  const res = await prisma.orgOfficer.deleteMany({ where: { id, position: "ADVISOR" } });
  if (res.count === 0) return { error: "Anggota Dewan Pembina ini sudah tidak ada." };
  await discardSignature(row?.signatureUrl);
  await prisma.auditLog.create({ data: { userId: admin.id, action: "DELETE", entity: "org_officers", entityId: String(id) } });
  revalidatePath("/admin/divisions");
  return { success: "Dikeluarkan dari Dewan Pembina." };
}
