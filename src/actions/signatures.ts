"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { saveSignatureImage } from "@/lib/private-files";
import { requirePermission, UnauthorizedError } from "@/lib/rbac";
import { discardSignature } from "@/lib/signatures";
import { UploadError } from "@/lib/storage";
import type { FormState } from "@/types/forms";

const FIELD = "signature";

async function meId() {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  return session.user.id;
}

/** Berkas dari formulir -> URL tersimpan, atau pesan galat yang aman ditampilkan. */
async function readSignature(fd: FormData): Promise<{ url: string } | { error: string }> {
  const file = fd.get(FIELD);
  if (!(file instanceof File) || file.size === 0) return { error: "Pilih gambar tanda tangan (PNG atau JPG) terlebih dahulu." };
  try {
    return { url: await saveSignatureImage(file) };
  } catch (e) {
    if (e instanceof UploadError) return { error: e.message };
    throw e;
  }
}

const refresh = () => {
  revalidatePath("/dashboard/profile");
  revalidatePath("/admin/divisions");
  revalidatePath("/admin/secretariat", "layout");
};

// ---------------------------------------------------------------- tanda tangan sendiri (lewat Profil)

/** Siapa pun yang sudah login mengunggah tanda tangannya sendiri: ketua pelaksana, sekretaris kegiatan, ketua divisi, pengurus. */
export async function saveMySignatureAction(_: FormState, fd: FormData): Promise<FormState> {
  const userId = await meId();
  const read = await readSignature(fd);
  if ("error" in read) return { error: read.error };

  const before = await prisma.user.findUnique({ where: { id: userId }, select: { signatureUrl: true } });
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { signatureUrl: read.url } }),
    prisma.auditLog.create({ data: { userId, action: "SIGNATURE_SET", entity: "users", entityId: userId } }),
  ]);
  await discardSignature(before?.signatureUrl);

  refresh();
  return { success: "Tanda tangan disimpan." };
}

export async function removeMySignatureAction(): Promise<FormState> {
  const userId = await meId();
  const before = await prisma.user.findUnique({ where: { id: userId }, select: { signatureUrl: true } });
  if (!before?.signatureUrl) return { error: "Belum ada tanda tangan yang tersimpan." };

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { signatureUrl: null } }),
    prisma.auditLog.create({ data: { userId, action: "SIGNATURE_REMOVE", entity: "users", entityId: userId } }),
  ]);
  await discardSignature(before.signatureUrl);

  refresh();
  return { success: "Tanda tangan dihapus." };
}

// ---------------------------------------------------------------- pemegang jabatan tanpa akun (diunggah pengurus)

/**
 * Pihak kampus (Ketua Prodi, Dekan, WR III) dan pemegang jabatan lain yang tidak punya akun tidak bisa mengunggah sendiri,
 * jadi pengurus yang mengunggahnya atas nama mereka. Pemegang yang punya akun TIDAK bisa diunggahkan orang lain:
 * tanda tangan mereka hanya berasal dari akun mereka sendiri.
 */
async function manualHolder(fd: FormData) {
  const id = Number(fd.get("id"));
  if (!Number.isInteger(id)) return { error: "Data tidak valid." } as const;
  const officer = await prisma.orgOfficer.findUnique({ where: { id }, select: { id: true, userId: true, signatureUrl: true } });
  if (!officer) return { error: "Jabatan ini sudah tidak ada." } as const;
  if (officer.userId) {
    return { error: "Pemegang jabatan ini punya akun. Tanda tangannya diunggah sendiri lewat menu Profil." } as const;
  }
  return { officer } as const;
}

export async function saveOfficerSignatureAction(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await requirePermission("member:manage");
  const target = await manualHolder(fd);
  if ("error" in target) return { error: target.error };

  const read = await readSignature(fd);
  if ("error" in read) return { error: read.error };

  const { officer } = target;
  await prisma.$transaction([
    prisma.orgOfficer.update({ where: { id: officer.id }, data: { signatureUrl: read.url } }),
    prisma.auditLog.create({ data: { userId: admin.id, action: "SIGNATURE_SET", entity: "org_officers", entityId: String(officer.id) } }),
  ]);
  await discardSignature(officer.signatureUrl);

  refresh();
  return { success: "Tanda tangan disimpan." };
}

export async function removeOfficerSignatureAction(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await requirePermission("member:manage");
  const target = await manualHolder(fd);
  if ("error" in target) return { error: target.error };

  const { officer } = target;
  if (!officer.signatureUrl) return { error: "Belum ada tanda tangan yang tersimpan." };
  await prisma.$transaction([
    prisma.orgOfficer.update({ where: { id: officer.id }, data: { signatureUrl: null } }),
    prisma.auditLog.create({ data: { userId: admin.id, action: "SIGNATURE_REMOVE", entity: "org_officers", entityId: String(officer.id) } }),
  ]);
  await discardSignature(officer.signatureUrl);

  refresh();
  return { success: "Tanda tangan dihapus." };
}
