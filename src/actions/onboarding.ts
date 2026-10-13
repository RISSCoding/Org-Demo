"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UnauthorizedError } from "@/lib/rbac";

/** Tandai tutorial awal sudah diselesaikan. Idempoten. */
export async function completeOnboardingAction(): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();

  await prisma.user.update({
    where: { id: session.user.id },
    data: { onboardedAt: new Date() },
  });
  await prisma.auditLog.create({
    data: { userId: session.user.id, action: "ONBOARDING_COMPLETE", entity: "users", entityId: session.user.id },
  });
  revalidatePath("/dashboard", "layout");
}
