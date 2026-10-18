"use server";

import { revalidatePath } from "next/cache";
import { buildCertificatePdf, createCertificateRecord } from "@/lib/certificate-service";
import { certificateTitle } from "@/lib/committee-meta";
import { requireEventManager } from "@/lib/committee";
import { prisma } from "@/lib/prisma";
import { getTenantPrisma } from "@/lib/prisma-tenant";
import { requirePermission } from "@/lib/rbac";
import type { FormState } from "@/types/forms";

/** Issues a certificate to every ATTENDED participant that doesn't have one yet. Idempotent. */
export async function issueCertificatesAction(_: FormState, fd: FormData): Promise<FormState> {
  const staff = await requirePermission("event:manage");
  const tenantPrisma = getTenantPrisma(staff.organizationId!);

  const eventId = String(fd.get("eventId") ?? "");

  const event = await tenantPrisma.event.findUnique({ where: { id: eventId }, select: { id: true } });
  if (!event) return { error: "Event tidak ditemukan." };

  const [attended, existing] = await Promise.all([
    tenantPrisma.eventRegistration.findMany({ where: { eventId, status: "ATTENDED" }, select: { userId: true } }),
    tenantPrisma.certificate.findMany({ where: { eventId }, select: { userId: true } }),
  ]);
  if (attended.length === 0) return { error: "Belum ada peserta yang hadir." };

  const have = new Set(existing.map((c) => c.userId));
  const todo = attended.filter((a) => !have.has(a.userId));
  if (todo.length === 0) return { success: "Semua peserta yang hadir sudah memiliki sertifikat." };

  let issued = 0;
  let failed = 0;
  for (const a of todo) {
    try {
      const cert = await createCertificateRecord(eventId, a.userId);
      issued++;
      // Pre-render the PDF; if it fails it is regenerated lazily on first download.
      await buildCertificatePdf(cert.certificateNumber).catch((e) => console.error("PDF build failed", e));
    } catch (e) {
      console.error("Certificate issue failed", e);
      failed++;
    }
  }

  await tenantPrisma.auditLog.create({
    data: { userId: staff.id, action: "ISSUE_CERTIFICATES", entity: "events", entityId: eventId, meta: { issued, failed } },
  });
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/dashboard/certificates");

  if (failed > 0) return { error: `${issued} sertifikat diterbitkan, ${failed} gagal. Jalankan lagi untuk sisanya.` };
  return { success: `${issued} sertifikat berhasil diterbitkan.` };
}

/**
 * Menerbitkan sertifikat panitia untuk panitia terpilih. Syarat: diterima dan tercatat hadir di hari-H,
 * dan belum punya sertifikat di event ini. Ketua atau pengurus boleh mengecualikan orang tertentu
 * dengan tidak mencentangnya.
 */
/**
 * Terbitkan sertifikat untuk user tertentu saja. Kalau `force` = true,
 * terbitkan meski user tidak check-in (mis. kasus QR bermasalah).
 * Tetap tercatat di audit log dengan flag force.
 */
export async function issueForUsersAction(_: FormState, fd: FormData): Promise<FormState> {
  const staff = await requirePermission("event:manage");
  const eventId = String(fd.get("eventId") ?? "");
  const userIds = fd.getAll("userId").map(String).filter(Boolean);
  const force = fd.get("force") === "1";

  if (!eventId) return { error: "Event tidak ditemukan." };
  if (userIds.length === 0) return { error: "Pilih minimal satu peserta." };
  if (userIds.length > 200) return { error: "Maksimal 200 peserta sekali terbit." };

  const event = await tenantPrisma.event.findUnique({ where: { id: eventId }, select: { id: true } });
  if (!event) return { error: "Event tidak ditemukan." };

  // Kalau tidak force: hanya user yang sudah ATTENDED.
  const eligible = force
    ? userIds
    : (
        await tenantPrisma.eventRegistration.findMany({
          where: { eventId, userId: { in: userIds }, status: "ATTENDED" },
          select: { userId: true },
        })
      ).map((r) => r.userId);

  const existing = await tenantPrisma.certificate.findMany({
    where: { eventId, userId: { in: eligible } },
    select: { userId: true },
  });
  const have = new Set(existing.map((c) => c.userId));
  const todo = eligible.filter((id) => !have.has(id));

  if (todo.length === 0) {
    return { error: "Semua peserta yang dipilih sudah punya sertifikat." };
  }

  let issued = 0;
  let failed = 0;
  for (const userId of todo) {
    try {
      const cert = await createCertificateRecord(eventId, userId);
      issued++;
      await buildCertificatePdf(cert.certificateNumber).catch((e) => console.error("PDF build failed", e));
    } catch (e) {
      console.error("Certificate issue failed", e);
      failed++;
    }
  }

  await tenantPrisma.auditLog.create({
    data: {
      userId: staff.id,
      action: "ISSUE_CERTIFICATES",
      entity: "events",
      entityId: eventId,
      meta: { issued, failed, force, requested: userIds.length },
    },
  });
  revalidatePath(`/admin/events/${eventId}`, "layout");
  revalidatePath(`/admin/events/${eventId}/certificates`);
  revalidatePath("/dashboard/certificates");

  if (failed > 0) return { error: `${issued} sertifikat diterbitkan, ${failed} gagal.` };
  return { success: `${issued} sertifikat berhasil diterbitkan${force ? " (mode paksa)" : ""}.` };
}

export async function issueCommitteeCertificatesAction(_: FormState, fd: FormData): Promise<FormState> {
  const eventId = String(fd.get("eventId") ?? "");
  const actor = await requireEventManager(eventId);
  const ids = fd.getAll("applicationId").map(String).filter(Boolean);
  if (ids.length === 0) return { error: "Pilih minimal satu panitia." };

  const apps = await tenantPrisma.committeeApplication.findMany({
    where: { id: { in: ids }, eventId, status: "ACCEPTED", attendedAt: { not: null } },
    select: { userId: true, role: true, assignedDivision: { select: { name: true } } },
  });
  const existing = await tenantPrisma.certificate.findMany({ where: { eventId, userId: { in: apps.map((a) => a.userId) } }, select: { userId: true } });
  const have = new Set(existing.map((c) => c.userId));
  const todo = apps.filter((a) => !have.has(a.userId));
  if (todo.length === 0) return { error: "Tidak ada panitia yang memenuhi syarat untuk diterbitkan (harus hadir hari-H dan belum punya sertifikat)." };

  let issued = 0;
  let failed = 0;
  for (const a of todo) {
    try {
      const cert = await createCertificateRecord(eventId, a.userId, { roleTitle: certificateTitle(a.role, a.assignedDivision?.name) });
      issued++;
      await buildCertificatePdf(cert.certificateNumber).catch((e) => console.error("PDF build failed", e));
    } catch (e) {
      console.error("Committee certificate issue failed", e);
      failed++;
    }
  }

  await tenantPrisma.auditLog.create({ data: { userId: actor.user.id, action: "ISSUE_COMMITTEE_CERTIFICATES", entity: "events", entityId: eventId, meta: { issued, failed } } });
  revalidatePath(`/admin/events/${eventId}`, "layout");
  revalidatePath("/dashboard", "layout");
  if (failed > 0) return { error: `${issued} sertifikat diterbitkan, ${failed} gagal. Jalankan lagi untuk sisanya.` };
  return { success: `${issued} sertifikat panitia berhasil diterbitkan.` };
}
