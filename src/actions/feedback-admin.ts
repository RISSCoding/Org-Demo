"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { FEEDBACK_STATUSES } from "@/lib/feedback";
import { prisma } from "@/lib/prisma";
import { ForbiddenError, requirePermission, UnauthorizedError } from "@/lib/rbac";
import type { FormState } from "@/types/forms";

const schema = z.object({
  id: z.string().min(1),
  status: z.enum(FEEDBACK_STATUSES, { message: "Pilih status." }),
  response: z.string().trim().max(2000, "Tanggapan maksimal 2000 karakter."),
});

/** Ubah status dan tulis tanggapan untuk satu pesan. Hanya pemegang izin aspirasi:manage. */
export async function updateFeedbackAction(_: FormState, fd: FormData): Promise<FormState> {
  let user;
  try {
    user = await requirePermission("aspirasi:manage");
  } catch (e) {
    if (e instanceof ForbiddenError || e instanceof UnauthorizedError) {
      return { error: "Kamu tidak punya izin untuk mengelola aspirasi." };
    }
    throw e;
  }

  const parsed = schema.safeParse({
    id: fd.get("id"),
    status: fd.get("status"),
    response: String(fd.get("response") ?? ""),
  });
  if (!parsed.success) {
    return { error: "Periksa kembali isian di bawah.", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const d = parsed.data;

  const current = await prisma.feedback.findUnique({
    where: { id: d.id },
    select: { status: true, response: true },
  });
  if (!current) return { error: "Pesan tidak ditemukan." };

  const response = d.response === "" ? null : d.response;
  const responseChanged = response !== current.response;

  await prisma.$transaction([
    prisma.feedback.update({
      where: { id: d.id },
      data: {
        status: d.status,
        response,
        ...(responseChanged ? { respondedAt: response ? new Date() : null } : {}),
      },
    }),
    // Isi pesan tidak dicatat di log; cukup siapa mengubah apa.
    prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "UPDATE",
        entity: "feedbacks",
        entityId: d.id,
        meta: { from: current.status, to: d.status, responseChanged },
      },
    }),
  ]);

  revalidatePath("/admin/feedback");
  revalidatePath(`/admin/feedback/${d.id}`);
  revalidatePath("/dashboard/feedback");
  return { success: "Perubahan disimpan." };
}
