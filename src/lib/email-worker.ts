import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { renderNotificationEmail } from "@/lib/email-templates";

const BATCH_SIZE = 60;      // maks 60 email per run (cron tiap menit)
const THROTTLE_MS = 900;    // jeda antar kirim, ~1 detik
const MAX_ATTEMPTS = 3;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

/**
 * Proses antrean email sekali jalan. Dipanggil oleh systemd timer setiap menit.
 * Idempoten: job yang sudah SENT tidak diproses lagi.
 */
export async function runEmailWorker(): Promise<{ processed: number; sent: number; failed: number; skipped: number }> {
  const jobs = await prisma.notificationJob.findMany({
    where: {
      status: "PENDING",
      channel: "EMAIL",
      scheduledAt: { lte: new Date() },
      attempts: { lt: MAX_ATTEMPTS },
    },
    take: BATCH_SIZE,
    orderBy: { scheduledAt: "asc" },
    include: {
      notification: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              approvalStatus: true,
              notificationPreference: { select: { emailEnabled: true } },
              notificationConsent: { select: { emailConsentAt: true, emailRevokedAt: true } },
            },
          },
        },
      },
    },
  });

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const job of jobs) {
    const user = job.notification.user;

    // Guard 1: user harus masih approved.
    if (user.approvalStatus !== "APPROVED") {
      await markSkipped(job.id, "user tidak lagi aktif");
      skipped++;
      continue;
    }

    // Guard 2: consent masih berlaku.
    const consent = user.notificationConsent;
    const consentActive = !!consent?.emailConsentAt && !consent.emailRevokedAt;
    if (!consentActive || !user.notificationPreference?.emailEnabled) {
      await markSkipped(job.id, "consent email tidak aktif");
      skipped++;
      continue;
    }

    // Kirim
    try {
      const { html, text, subject } = renderNotificationEmail({
        recipientName: user.fullName,
        title: job.notification.title,
        body: job.notification.body ?? undefined,
        link: job.notification.link ?? undefined,
        appUrl: appUrl(),
      });

      await sendEmail({ to: user.email, subject, html, text });

      await prisma.notificationJob.update({
        where: { id: job.id },
        data: { status: "SENT", sentAt: new Date(), attempts: { increment: 1 } },
      });
      sent++;
      await sleep(THROTTLE_MS);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const newAttempts = job.attempts + 1;
      await prisma.notificationJob.update({
        where: { id: job.id },
        data: {
          status: newAttempts >= MAX_ATTEMPTS ? "FAILED" : "PENDING",
          attempts: newAttempts,
          lastError: msg.slice(0, 500),
          // Retry dengan backoff: menit ke-n = 2^attempts
          scheduledAt: new Date(Date.now() + Math.pow(2, newAttempts) * 60_000),
        },
      });
      failed++;
      console.error(`[email-worker] job ${job.id} gagal (attempt ${newAttempts}):`, msg);
    }
  }

  return { processed: jobs.length, sent, failed, skipped };
}

async function markSkipped(id: string, reason: string) {
  await prisma.notificationJob.update({
    where: { id },
    data: { status: "SKIPPED", lastError: reason, sentAt: new Date() },
  });
}
