"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { saveProofImage } from "@/lib/private-files";
import { requirePermission } from "@/lib/rbac";
import { UploadError } from "@/lib/storage";
import type { FormState } from "@/types/forms";

/** Member uploads a transfer receipt; the treasurer verifies it later. */
export async function submitDuesProofAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requirePermission();
  const duesId = String(fd.get("duesId") ?? "");
  const proof = fd.get("proof");
  if (!(proof instanceof File) || proof.size === 0) return { error: "Pilih foto bukti transfer." };

  const dues = await prisma.memberDues.findUnique({ where: { id: duesId } });
  if (!dues || dues.userId !== user.id) return { error: "Tagihan tidak ditemukan." };
  if (dues.status === "PAID") return { error: "Tagihan ini sudah lunas." };

  let url: string;
  try {
    url = await saveProofImage(proof);
  } catch (e) {
    if (e instanceof UploadError) return { error: e.message };
    throw e;
  }
  await prisma.memberDues.update({ where: { id: duesId }, data: { proofUrl: url, submittedAt: new Date() } });
  revalidatePath("/dashboard/dues");
  revalidatePath("/admin/finance/dues");
  return { success: "Bukti terkirim. Menunggu verifikasi bendahara." };
}
