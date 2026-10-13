"use server";

import { z } from "zod";
import type { OfficerPosition, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { DIVISION_ELIGIBLE_ROLES } from "@/lib/division-roles";
import { OFFICER_LABEL, isOfficerSlot } from "@/lib/officer-meta";
import { discardSignature } from "@/lib/signatures";
import type { FormState } from "@/types/forms";

const nameSchema = z.string().trim().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter");

/**
 * Jabatan inti yang otomatis mengangkat role akunnya ke ADMIN_EXECUTIVE
 * supaya bisa masuk /admin. Bukan SUPER_ADMIN — kekuatan "pemilik sistem"
 * (bypass four-eyes, hapus surat, angkat Super Admin lain) tetap terkunci.
 */
const CORE_SLOTS: ReadonlySet<OfficerPosition> = new Set([
  "CHAIR",
  "VICE_CHAIR",
  "SECRETARY",
  "TREASURER",
]);

/**
 * Sinkronkan role akun dengan jabatan intinya. Upgrade MEMBER/ALUMNI → ADMIN_EXECUTIVE
 * bila diangkat ke jabatan inti. Tidak ada auto-downgrade: Super Admin yang memutuskan
 * turun role-nya saat pejabat tersebut melepas jabatan.
 */
async function syncCoreRole(tx: Prisma.TransactionClient, userId: string | null) {
  if (!userId) return;
  const u = await tx.user.findUnique({
    where: { id: userId },
    select: { roleId: true, role: { select: { name: true } } },
  });
  if (!u) return;

  const coreSlots = await tx.orgOfficer.count({
    where: { userId, position: { in: [...CORE_SLOTS] } },
  });

  if (coreSlots > 0 && (u.role.name === "MEMBER" || u.role.name === "ALUMNI")) {
    const target = await tx.role.findUniqueOrThrow({ where: { name: "ADMIN_EXECUTIVE" } });
    await tx.user.update({ where: { id: userId }, data: { roleId: target.id } });
  }
}

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

  // Orang yang sama disimpan ulang: baris dan tanda tangannya dipertahankan.
  // Orang berbeda atau jabatan dikosongkan: baris lama dihapus beserta tanda tangannya.
  const existing = await prisma.orgOfficer.findMany({
    where: { position },
    select: { id: true, userId: true, name: true, signatureUrl: true },
  });
  const sameHolder =
    !!name &&
    existing.length === 1 &&
    existing[0].userId === userId &&
    (userId !== null || existing[0].name === name);

  await prisma.$transaction(async (tx) => {
    if (sameHolder) {
      await tx.orgOfficer.update({ where: { id: existing[0].id }, data: { name } });
    } else {
      await tx.orgOfficer.deleteMany({ where: { position } });
      if (name) await tx.orgOfficer.create({ data: { position, userId, name } });
    }
    // Sinkronkan role pemegang baru (dan pemegang lama bila berbeda).
    if (!sameHolder) {
      for (const row of existing) {
        if (row.userId && row.userId !== userId) await syncCoreRole(tx, row.userId);
      }
    }
    await syncCoreRole(tx, userId);
    await tx.auditLog.create({
      data: {
        userId: admin.id,
        action: "UPDATE",
        entity: "org_officers",
        entityId: position,
        meta: { holderUserId: userId, holderName: name },
      },
    });
  });
  if (!sameHolder) for (const row of existing) await discardSignature(row.signatureUrl);

  revalidatePath("/admin/divisions");
  revalidatePath("/admin/members");
  return {
    success: name
      ? `${OFFICER_LABEL[position]}: ${name}.${CORE_SLOTS.has(position as OfficerPosition) ? " Role akunnya disesuaikan ke ADMIN_EXECUTIVE bila masih MEMBER." : ""}`
      : `${OFFICER_LABEL[position]} dikosongkan.`,
  };
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
    data: {
      userId: admin.id,
      action: "CREATE",
      entity: "org_officers",
      entityId: String(row.id),
      meta: { position: "ADVISOR", holderName: parsed.data },
    },
  });
  revalidatePath("/admin/divisions");
  return { success: `${parsed.data} ditambahkan ke Dewan Pembina.` };
}

export async function removeAdvisorAction(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await requirePermission("member:manage");
  const id = Number(fd.get("id"));
  if (!Number.isInteger(id)) return { error: "Data tidak valid." };

  const row = await prisma.orgOfficer.findFirst({
    where: { id, position: "ADVISOR" },
    select: { signatureUrl: true },
  });
  const res = await prisma.orgOfficer.deleteMany({ where: { id, position: "ADVISOR" } });
  if (res.count === 0) return { error: "Anggota Dewan Pembina ini sudah tidak ada." };
  await discardSignature(row?.signatureUrl);
  await prisma.auditLog.create({
    data: { userId: admin.id, action: "DELETE", entity: "org_officers", entityId: String(id) },
  });
  revalidatePath("/admin/divisions");
  return { success: "Dikeluarkan dari Dewan Pembina." };
}
