"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTenantPrisma } from "@/lib/prisma-tenant";
import { UnauthorizedError } from "@/lib/rbac";

const CONSENT_VERSION = "v1-2026-10";

async function me() {
  const session = await auth();

  if (!session?.user) throw new UnauthorizedError();

  const tenantPrisma = getTenantPrisma(session!.user.organizationId!);
  return session.user.id;
}

export async function markNotificationRead(id: string): Promise<void> {
  const userId = await me();
  await tenantPrisma.notification.updateMany({
    where: { id, userId, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/dashboard", "layout");
}

export async function markAllNotificationsRead(): Promise<void> {
  const userId = await me();
  await tenantPrisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/dashboard", "layout");
}

export async function deleteNotification(id: string): Promise<void> {
  const userId = await me();
  await tenantPrisma.notification.deleteMany({ where: { id, userId } });
  revalidatePath("/dashboard", "layout");
}

const prefsSchema = z.object({
  duesDue: z.boolean(),
  eventReminder: z.boolean(),
  committeeDecided: z.boolean(),
  feedbackResponse: z.boolean(),
  announcement: z.boolean(),
  digestMode: z.enum(["instant", "daily"]),
  quietHoursStart: z.number().int().min(0).max(23).nullable(),
  quietHoursEnd: z.number().int().min(0).max(23).nullable(),
});

export async function saveNotificationPreferences(input: z.input<typeof prefsSchema>): Promise<void> {
  const userId = await me();
  const d = prefsSchema.parse(input);
  await tenantPrisma.notificationPreference.upsert({
    where: { userId },
    create: { userId, ...d },
    update: d,
  });
  revalidatePath("/dashboard/settings/notifications");
}

const consentSchema = z.object({
  inapp: z.boolean(),
  email: z.boolean(),
  whatsapp: z.boolean(),
  whatsappNumber: z.string().min(8).optional(),
});

export async function saveNotificationConsent(input: z.input<typeof consentSchema>): Promise<void> {
  const userId = await me();
  const d = consentSchema.parse(input);
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const ua = h.get("user-agent") ?? null;
  const now = new Date();

  const existing = await tenantPrisma.notificationConsent.findUnique({ where: { userId } });

  await tenantPrisma.notificationConsent.upsert({
    where: { userId },
    create: {
      userId,
      consentVersion: CONSENT_VERSION,
      inappAcceptedAt: d.inapp ? now : null,
      emailConsentAt: d.email ? now : null,
      whatsappConsentAt: d.whatsapp ? now : null,
      acceptedIp: ip,
      acceptedUserAgent: ua,
    },
    update: {
      consentVersion: CONSENT_VERSION,
      inappAcceptedAt: d.inapp ? (existing?.inappAcceptedAt ?? now) : existing?.inappAcceptedAt,
      emailConsentAt: d.email ? (existing?.emailConsentAt ?? now) : existing?.emailConsentAt,
      emailRevokedAt: !d.email && existing?.emailConsentAt ? now : existing?.emailRevokedAt,
      whatsappConsentAt: d.whatsapp ? (existing?.whatsappConsentAt ?? now) : existing?.whatsappConsentAt,
      whatsappRevokedAt: !d.whatsapp && existing?.whatsappConsentAt ? now : existing?.whatsappRevokedAt,
    },
  });

  await tenantPrisma.notificationPreference.upsert({
    where: { userId },
    create: { userId, emailEnabled: d.email, whatsappEnabled: d.whatsapp },
    update: { emailEnabled: d.email, whatsappEnabled: d.whatsapp },
  });

  if (d.whatsappNumber) {
    await tenantPrisma.user.update({ where: { id: userId }, data: { phoneNumber: d.whatsappNumber } });
  }

  revalidatePath("/dashboard", "layout");
  revalidatePath("/onboarding");
}

export async function revokeEmailConsent(): Promise<void> {
  const userId = await me();
  const now = new Date();
  await tenantPrisma.notificationConsent.upsert({
    where: { userId },
    create: { userId, consentVersion: CONSENT_VERSION, emailRevokedAt: now },
    update: { emailRevokedAt: now },
  });
  await tenantPrisma.notificationPreference.upsert({
    where: { userId },
    create: { userId, emailEnabled: false },
    update: { emailEnabled: false },
  });
  revalidatePath("/dashboard/settings/notifications");
}

export async function revokeWhatsappConsent(): Promise<void> {
  const userId = await me();
  const now = new Date();
  await tenantPrisma.notificationConsent.upsert({
    where: { userId },
    create: { userId, consentVersion: CONSENT_VERSION, whatsappRevokedAt: now },
    update: { whatsappRevokedAt: now },
  });
  await tenantPrisma.notificationPreference.upsert({
    where: { userId },
    create: { userId, whatsappEnabled: false },
    update: { whatsappEnabled: false },
  });
  revalidatePath("/dashboard/settings/notifications");
}
