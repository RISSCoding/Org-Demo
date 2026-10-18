"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { allocateKtaNumber } from "@/lib/kta";
import { notify } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { getTenantPrisma } from "@/lib/prisma-tenant";
import { requirePermission } from "@/lib/rbac";

const schema = z.object({
  userId: z.string().min(1),
  decision: z.enum(["APPROVED", "REJECTED"]),
});

/** Used directly as <form action={decideUser}>. */
export async function decideUser(formData: FormData): Promise<void> {
  const admin = await requirePermission("member:manage");
  const tenantPrisma = getTenantPrisma(admin.organizationId!);

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const { userId, decision } = parsed.data;

  await prisma.$transaction(async (tx) => {
    const u = await tx.user.update({ where: { id: userId }, data: { approvalStatus: decision } });
    if (decision === "APPROVED") {
      await tx.member.upsert({
        where: { userId: u.id },
        update: {},
        create: { userId: u.id, ktaNumber: await allocateKtaNumber(tx, u.nim, u.batchYear) },
      });
    }
    await tx.auditLog.create({
      data: { userId: admin.id, action: decision, entity: "users", entityId: u.id },
    });
  });
  // Kalau approved, kirim notifikasi selamat datang + arahkan ke KTA.
  if (decision === "APPROVED") {
    await notify({
      userId,
      type: "SYSTEM",
      title: "Selamat! KTA digital kamu sudah siap",
      body: "Akunmu sudah aktif. Buka KTA untuk lihat kartu anggota digital dan QR-mu.",
      link: "/dashboard/kta",
    });
  }

  revalidatePath("/admin/members");
  revalidatePath("/admin", "layout");
}
