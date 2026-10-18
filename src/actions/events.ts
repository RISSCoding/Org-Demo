"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getTenantPrisma } from "@/lib/prisma-tenant";
import { parseScan } from "@/lib/qr";
import { requireEventScanner } from "@/lib/committee";
import { requirePermission, type ActionResult } from "@/lib/rbac";
import { ticketHash } from "@/lib/security";

const activeCount = (eventId: string) =>
  tenantPrisma.eventRegistration.count({ where: { eventId, status: { not: "CANCELLED" } } });

export async function registerForEvent(eventId: string): Promise<ActionResult<{ hash: string }>> {
  const user = await requirePermission();
  const tenantPrisma = getTenantPrisma(user.organizationId!);

  const event = await tenantPrisma.event.findUnique({ where: { id: eventId } });
  if (!event) return { ok: false, error: "Event tidak ditemukan." };
  if (event.endDate < new Date()) return { ok: false, error: "Event ini sudah berakhir." };

  const existing = await tenantPrisma.eventRegistration.findUnique({
    where: { eventId_userId: { eventId, userId: user.id } },
  });
  if (existing && existing.status !== "CANCELLED") return { ok: true, data: { hash: existing.qrCodeHash } };

  if (event.quota !== null && (await activeCount(eventId)) >= event.quota) {
    return { ok: false, error: "Kuota event sudah penuh." };
  }

  const asCommittee = await tenantPrisma.committeeApplication.findUnique({
    where: { eventId_userId: { eventId, userId: user.id } },
    select: { status: true },
  });
  if (asCommittee && ["PENDING", "ACCEPTED", "WAITLIST"].includes(asCommittee.status)) {
    return { ok: false, error: "Kamu mendaftar sebagai panitia di event ini, jadi tidak perlu mendaftar sebagai peserta." };
  }

  const hash = ticketHash(eventId, user.id);
  await tenantPrisma.eventRegistration.upsert({
    where: { eventId_userId: { eventId, userId: user.id } },
    create: { eventId, userId: user.id, qrCodeHash: hash },
    update: { status: "REGISTERED" },
  });
  revalidatePath("/dashboard/events", "layout");
  return { ok: true, data: { hash } };
}

export async function cancelRegistration(eventId: string): Promise<ActionResult> {
  const user = await requirePermission();
  const reg = await tenantPrisma.eventRegistration.findUnique({
    where: { eventId_userId: { eventId, userId: user.id } },
  });
  if (!reg || reg.status === "CANCELLED") return { ok: true, data: undefined };
  if (reg.status === "ATTENDED") return { ok: false, error: "Kamu sudah check-in, pendaftaran tidak bisa dibatalkan." };
  await tenantPrisma.eventRegistration.update({ where: { id: reg.id }, data: { status: "CANCELLED" } });
  revalidatePath("/dashboard/events", "layout");
  return { ok: true, data: undefined };
}

const checkInSchema = z.object({
  eventId: z.string().min(1),
  payload: z.string().min(1).max(200),
});

export type CheckInData = { fullName: string; nim: string; alreadyCheckedIn: boolean; label?: string };

/** Staff scanner. Accepts event ticket QR, KTA QR, or a typed NPM. */
export async function checkInByQr(input: z.infer<typeof checkInSchema>): Promise<ActionResult<CheckInData>> {
  const parsed = checkInSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Data scan tidak valid." };
  const { eventId, payload } = parsed.data;
  // Pengurus, atau panitia yang sudah diterima di event ini.
  const { user: staff } = await requireEventScanner(eventId);

  const scan = parseScan(payload);
  if (!scan) return { ok: false, error: "QR tidak dikenali atau tanda tangannya tidak valid." };

  const include = { user: { select: { fullName: true, nim: true } } } as const;
  let reg;
  let person: { id: string; fullName: string; nim: string } | null = null;
  if (scan.kind === "ticket") {
    reg = await tenantPrisma.eventRegistration.findUnique({ where: { qrCodeHash: scan.hash }, include });
    if (reg && reg.eventId !== eventId) return { ok: false, error: "Tiket ini untuk event lain." };
  } else if (scan.kind === "ktaNumber") {
    // QR KTA format baru: cari user lewat nomor anggota.
    person = await tenantPrisma.user.findFirst({
      where: { member: { ktaNumber: scan.number } },
      select: { id: true, fullName: true, nim: true },
    });
    if (!person) return { ok: false, error: "Nomor KTA tidak terdaftar." };
    reg = await tenantPrisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId, userId: person.id } },
      include,
    });
  } else {
    // QR KTA format lama (nim tertanda tangan) atau NPM yang diketik petugas.
    person = await tenantPrisma.user.findUnique({ where: { nim: scan.nim }, select: { id: true, fullName: true, nim: true } });
    if (!person) return { ok: false, error: "NPM tidak ditemukan." };
    reg = await tenantPrisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId, userId: person.id } },
      include,
    });
  }

  // Bukan peserta: mungkin panitia event ini. Satu scanner untuk keduanya, tanpa ganti mode.
  if (!reg && person) {
    const app = await tenantPrisma.committeeApplication.findUnique({
      where: { eventId_userId: { eventId, userId: person.id } },
      select: { id: true, status: true, attendedAt: true, role: true, assignedDivision: { select: { name: true } } },
    });
    if (app?.status === "ACCEPTED") {
      const already = !!app.attendedAt;
      if (!already) {
        await prisma.$transaction([
          tenantPrisma.committeeApplication.update({ where: { id: app.id }, data: { attendedAt: new Date() } }),
          tenantPrisma.auditLog.create({ data: { userId: staff.id, action: "COMMITTEE_CHECK_IN", entity: "committee_applications", entityId: app.id } }),
        ]);
        revalidatePath(`/admin/events/${eventId}`, "layout");
        revalidatePath("/dashboard/events", "layout");
      }
      const label = `Panitia${app.assignedDivision ? ` · ${app.assignedDivision.name}` : ""}`;
      return { ok: true, data: { fullName: person.fullName, nim: person.nim, alreadyCheckedIn: already, label } };
    }
  }

  if (!reg) return { ok: false, error: "Peserta belum terdaftar di event ini." };
  if (reg.status === "CANCELLED") return { ok: false, error: `${reg.user.fullName}: pendaftaran sudah dibatalkan.` };

  const already = reg.status === "ATTENDED";
  if (!already) {
    await prisma.$transaction([
      tenantPrisma.eventRegistration.update({
        where: { id: reg.id },
        data: { status: "ATTENDED", attendedAt: new Date() },
      }),
      tenantPrisma.auditLog.create({
        data: { userId: staff.id, action: "CHECK_IN", entity: "event_registrations", entityId: reg.id },
      }),
    ]);
    revalidatePath(`/admin/events/${eventId}`);
  }
  return { ok: true, data: { ...reg.user, alreadyCheckedIn: already } };
}
