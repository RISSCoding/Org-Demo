import type { NotificationType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type NotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
};

export type Prefs = {
  duesDue: boolean;
  eventReminder: boolean;
  committeeDecided: boolean;
  feedbackResponse: boolean;
  announcement: boolean;
  inappEnabled: boolean;
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  digestMode: string;
  quietHoursStart: number | null;
  quietHoursEnd: number | null;
};

const DEFAULTS: Prefs = {
  duesDue: true,
  eventReminder: true,
  committeeDecided: true,
  feedbackResponse: true,
  announcement: false,
  inappEnabled: true,
  emailEnabled: false,
  whatsappEnabled: false,
  digestMode: "instant",
  quietHoursStart: null,
  quietHoursEnd: null,
};

/** Ambil hanya field Prefs dari baris DB (abaikan userId, updatedAt). */
function rowToPrefs(row: {
  duesDue: boolean;
  eventReminder: boolean;
  committeeDecided: boolean;
  feedbackResponse: boolean;
  announcement: boolean;
  inappEnabled: boolean;
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  digestMode: string;
  quietHoursStart: number | null;
  quietHoursEnd: number | null;
}): Prefs {
  return {
    duesDue: row.duesDue,
    eventReminder: row.eventReminder,
    committeeDecided: row.committeeDecided,
    feedbackResponse: row.feedbackResponse,
    announcement: row.announcement,
    inappEnabled: row.inappEnabled,
    emailEnabled: row.emailEnabled,
    whatsappEnabled: row.whatsappEnabled,
    digestMode: row.digestMode,
    quietHoursStart: row.quietHoursStart,
    quietHoursEnd: row.quietHoursEnd,
  };
}

export async function getPreferences(userId: string): Promise<Prefs> {
  const row = await prisma.notificationPreference.findUnique({ where: { userId } });
  if (!row) return DEFAULTS;
  return rowToPrefs(row);
}

function allowsInapp(prefs: Prefs, type: NotificationType): boolean {
  if (!prefs.inappEnabled) return false;
  switch (type) {
    case "DUES_DUE":
    case "DUES_VERIFIED":
    case "DUES_REJECTED":
      return prefs.duesDue;
    case "EVENT_REMINDER":
    case "EVENT_REGISTERED":
      return prefs.eventReminder;
    case "COMMITTEE_DECIDED":
    case "COMMITTEE_MEETING":
      return prefs.committeeDecided;
    case "FEEDBACK_RESPONSE":
      return prefs.feedbackResponse;
    case "ANNOUNCEMENT":
      return prefs.announcement;
    case "SYSTEM":
      return true;
    default:
      return true;
  }
}

export async function notify(input: NotificationInput): Promise<void> {
  const prefs = await getPreferences(input.userId);
  if (!allowsInapp(prefs, input.type)) return;

  const notif = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      link: input.link ?? null,
    },
  });

  // Email tidak dikirim di sini — masuk antrean. Worker yang mengirim.
  if (prefs.emailEnabled) {
    await prisma.notificationJob.create({
      data: {
        notificationId: notif.id,
        channel: "EMAIL",
        scheduledAt: new Date(),
      },
    });
  }
}

export async function notifyMany(
  userIds: string[],
  input: Omit<NotificationInput, "userId">,
): Promise<number> {
  if (userIds.length === 0) return 0;

  const prefs = await prisma.notificationPreference.findMany({
    where: { userId: { in: userIds } },
  });
  const prefMap = new Map(prefs.map((p) => [p.userId, p]));

  const target = userIds.filter((id) => {
    const p = prefMap.get(id);
    if (!p) return allowsInapp(DEFAULTS, input.type);
    return allowsInapp(rowToPrefs(p), input.type);
  });

  if (target.length === 0) return 0;

  // Insert notifikasi in-app satu per satu (createMany tidak return id).
  // Untuk 1.000 user, ini masih < 1 detik karena insert kecil.
  const created = await Promise.all(
    target.map((userId) =>
      prisma.notification.create({
        data: {
          userId,
          type: input.type,
          title: input.title,
          body: input.body ?? null,
          link: input.link ?? null,
        },
        select: { id: true, userId: true },
      }),
    ),
  );

  // Queue email untuk user yang centang.
  const emailTargets = target.filter((id) => {
    const p = prefMap.get(id);
    return p?.emailEnabled === true;
  });
  if (emailTargets.length > 0) {
    const idMap = new Map(created.map((c) => [c.userId, c.id]));
    await prisma.notificationJob.createMany({
      data: emailTargets.map((userId) => ({
        notificationId: idMap.get(userId)!,
        channel: "EMAIL" as const,
        scheduledAt: new Date(),
      })),
    });
  }

  return target.length;
}

export function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, readAt: null } });
}

export function getRecent(userId: string, limit = 5) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, type: true, title: true, body: true, link: true, readAt: true, createdAt: true },
  });
}

export function getList(userId: string, opts: { unreadOnly?: boolean; limit?: number } = {}) {
  const where: Prisma.NotificationWhereInput = { userId };
  if (opts.unreadOnly) where.readAt = null;
  return prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: opts.limit ?? 100,
    select: { id: true, type: true, title: true, body: true, link: true, readAt: true, createdAt: true },
  });
}

export function getConsent(userId: string) {
  return prisma.notificationConsent.findUnique({ where: { userId } });
}
