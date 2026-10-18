"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getTenantPrisma } from "@/lib/prisma-tenant";
import { requirePermission } from "@/lib/rbac";
import type { FormState } from "@/types/forms";

const schema = z.object({
  amount: z.number("Isi nominal").int("Harus bilangan bulat").min(1000, "Minimal Rp1.000").max(10_000_000),
});

export async function saveDuesAmountAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requirePermission("finance:write");
  const tenantPrisma = getTenantPrisma(user.organizationId!);

  const raw = String(fd.get("amount") ?? "").trim();
  const parsed = schema.safeParse({ amount: raw === "" ? undefined : Number(raw) });
  if (!parsed.success) return { error: "Periksa kembali isian.", fieldErrors: parsed.error.flatten().fieldErrors };

  const value = String(parsed.data.amount);
  await tenantPrisma.appSetting.upsert({ where: { key: "dues_amount" }, create: { key: "dues_amount", value }, update: { value } });
  await tenantPrisma.auditLog.create({
    data: { userId: user.id, action: "UPDATE_SETTING", entity: "app_settings", entityId: "dues_amount", meta: { value } },
  });
  revalidatePath("/admin/settings");
  revalidatePath("/admin/finance/dues");
  return { success: "Nominal iuran default disimpan. Berlaku untuk tagihan yang dibuat berikutnya." };
}
