"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTenantPrisma } from "@/lib/prisma-tenant";
import { UnauthorizedError } from "@/lib/rbac";

/** Tandai tutorial awal sudah diselesaikan. Idempoten. */
export async function completeOnboardingAction(): Promise<void> {
  const session = await auth();

  if (!session?.user) throw new UnauthorizedError();

  const tenantPrisma = getTenantPrisma(session!.user.organizationId!);

  await tenantPrisma.user.update({
    where: { id: session.user.id },
    data: { onboardedAt: new Date() },
  });
  await tenantPrisma.auditLog.create({
    data: { userId: session.user.id, action: "ONBOARDING_COMPLETE", entity: "users", entityId: session.user.id },
  });
  revalidatePath("/dashboard", "layout");
}
