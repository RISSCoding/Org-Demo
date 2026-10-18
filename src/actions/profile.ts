"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTenantPrisma } from "@/lib/prisma-tenant";
import { rateLimit } from "@/lib/rate-limit";
import { deletePublicImage, saveImage, UploadError } from "@/lib/storage";
import type { FormState } from "@/types/forms";

async function me() {
  const session = await auth();

  if (!session?.user) throw new Error("Unauthorized");

  const tenantPrisma = getTenantPrisma(session!.user.organizationId!);
  return session.user.id;
}

const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .refine((v) => v === "" || /^(\+62|62|0)8\d{7,12}$/.test(v), "Nomor HP tidak valid (contoh 081234567890)");

export async function updateProfileAction(_: FormState, fd: FormData): Promise<FormState> {
  const userId = await me();
  const phone = phoneSchema.safeParse(fd.get("phoneNumber") ?? "");
  if (!phone.success) return { error: "Periksa kembali isian.", fieldErrors: { phoneNumber: [phone.error.issues[0].message] } };

  let avatarUrl: string | undefined;
  const file = fd.get("avatar");
  if (file instanceof File && file.size > 0) {
    try {
      avatarUrl = await saveImage(file, "avatars");
    } catch (e) {
      if (e instanceof UploadError) return { error: "Foto gagal diunggah.", fieldErrors: { avatar: [e.message] } };
      throw e;
    }
  }

  const before = avatarUrl
    ? await tenantPrisma.user.findUnique({ where: { id: userId }, select: { avatarUrl: true } })
    : null;
  await tenantPrisma.user.update({
    where: { id: userId },
    data: { phoneNumber: phone.data === "" ? null : phone.data, ...(avatarUrl ? { avatarUrl } : {}) },
  });
  if (before?.avatarUrl) await deletePublicImage(before.avatarUrl); // foto lama tidak dipakai lagi
  revalidatePath("/dashboard/profile");
  return { success: "Profil disimpan." };
}

const passwordSchema = z
  .object({
    current: z.string().min(1, "Isi password saat ini"),
    next: z.string().min(8, "Minimal 8 karakter").max(72, "Maksimal 72 karakter"),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { path: ["confirm"], message: "Konfirmasi tidak sama" });

export async function changePasswordAction(_: FormState, fd: FormData): Promise<FormState> {
  const userId = await me();
  const parsed = passwordSchema.safeParse({
    current: fd.get("current"),
    next: fd.get("next"),
    confirm: fd.get("confirm"),
  });
  if (!parsed.success) return { error: "Periksa kembali isian.", fieldErrors: parsed.error.flatten().fieldErrors };

  // Sesi yang dicuri tidak boleh dipakai menebak password lama tanpa batas.
  const rl = await rateLimit(`pw:${userId}`, 5, 15 * 60);
  if (rl.limited) return { error: "Terlalu banyak percobaan. Coba lagi dalam beberapa menit." };

  const user = await tenantPrisma.user.findUniqueOrThrow({ where: { id: userId }, select: { passwordHash: true } });
  if (!(await bcrypt.compare(parsed.data.current, user.passwordHash))) {
    return { error: "Periksa kembali isian.", fieldErrors: { current: ["Password saat ini salah"] } };
  }
  if (parsed.data.current === parsed.data.next) {
    return { error: "Periksa kembali isian.", fieldErrors: { next: ["Password baru harus berbeda"] } };
  }

  await tenantPrisma.user.update({ where: { id: userId }, data: { passwordHash: await bcrypt.hash(parsed.data.next, 12) } });
  await tenantPrisma.auditLog.create({ data: { userId, action: "CHANGE_PASSWORD", entity: "users", entityId: userId } });
  return { success: "Password diganti." };
}
