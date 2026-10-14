"use server";

import { randomInt } from "node:crypto";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { parseWIB } from "@/lib/datetime";
import { getEventAccess, requireMeetingManager } from "@/lib/committee";
import { notifyMany } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import type { FormState } from "@/types/forms";

type Result = { ok: true } | { ok: false; error: string };
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // tanpa 0/O/1/I/L agar mudah dibaca
const newCode = () => Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
const fail = (error: string, fieldErrors?: FormState["fieldErrors"]): FormState => ({ error, fieldErrors });

async function meetingEvent(meetingId: string) {
  return prisma.committeeMeeting.findUnique({
    where: { id: meetingId },
    select: { id: true, eventId: true, title: true, code: true, attendanceOpen: true, event: { select: { slug: true } } },
  });
}
function refresh(slug: string) {
  revalidatePath(`/dashboard/events/${slug}/panitia`, "layout");
}

const meetingSchema = z.object({
  title: z.string().trim().min(3, "Minimal 3 karakter").max(120, "Maksimal 120 karakter"),
  startsAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Isi tanggal dan jam rapat"),
  location: z.string().trim().max(120, "Maksimal 120 karakter").optional(),
});

export async function createMeetingAction(_: FormState, fd: FormData): Promise<FormState> {
  const eventId = String(fd.get("eventId") ?? "");
  const actor = await requireMeetingManager(eventId);
  const parsed = meetingSchema.safeParse({
    title: fd.get("title"),
    startsAt: fd.get("startsAt"),
    location: String(fd.get("location") ?? "").trim() || undefined,
  });
  if (!parsed.success) return fail("Periksa kembali isian.", parsed.error.flatten().fieldErrors);

  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { slug: true } });
  if (!event) return fail("Event tidak ditemukan.");

  await prisma.$transaction([
    prisma.committeeMeeting.create({
      data: { eventId, title: parsed.data.title, startsAt: parseWIB(parsed.data.startsAt), location: parsed.data.location ?? null, code: newCode(), createdBy: actor.user.id },
    }),
    prisma.auditLog.create({ data: { userId: actor.user.id, action: "COMMITTEE_MEETING_CREATE", entity: "events", entityId: eventId, meta: { title: parsed.data.title } } }),
  ]);

  // Notifikasi ke semua panitia yang diterima di event ini.
  const committees = await prisma.committeeApplication.findMany({
    where: { eventId, status: "ACCEPTED" },
    select: { userId: true },
  });
  const startsAt = parseWIB(parsed.data.startsAt);
  const startsText = startsAt.toLocaleString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
  await notifyMany(committees.map((c) => c.userId), {
    type: "COMMITTEE_MEETING",
    title: `Rapat baru: ${parsed.data.title}`,
    body: `${startsText}${parsed.data.location ? ` · ${parsed.data.location}` : ""}`,
    link: `/dashboard/events/${event.slug}/panitia/rapat`,
  });

  refresh(event.slug);
  return { success: "Rapat dibuat. Buka absensi saat rapat dimulai." };
}

export async function setMeetingAttendanceOpenAction(meetingId: string, open: boolean): Promise<Result> {
  const m = await meetingEvent(meetingId);
  if (!m) return { ok: false, error: "Rapat tidak ditemukan." };
  const actor = await requireMeetingManager(m.eventId);
  await prisma.$transaction([
    prisma.committeeMeeting.update({ where: { id: m.id }, data: { attendanceOpen: open } }),
    prisma.auditLog.create({ data: { userId: actor.user.id, action: open ? "COMMITTEE_MEETING_OPEN" : "COMMITTEE_MEETING_CLOSE", entity: "committee_meetings", entityId: m.id } }),
  ]);
  refresh(m.event.slug);
  return { ok: true };
}

export async function deleteMeetingAction(meetingId: string): Promise<Result> {
  const m = await meetingEvent(meetingId);
  if (!m) return { ok: false, error: "Rapat tidak ditemukan." };
  const actor = await requireMeetingManager(m.eventId);
  await prisma.$transaction([
    prisma.committeeMeeting.delete({ where: { id: m.id } }),
    prisma.auditLog.create({ data: { userId: actor.user.id, action: "COMMITTEE_MEETING_DELETE", entity: "events", entityId: m.eventId, meta: { title: m.title } } }),
  ]);
  refresh(m.event.slug);
  return { ok: true };
}

/** Panitia absen sendiri dengan kode yang ditampilkan sekretaris. */
export async function selfCheckInMeetingAction(_: FormState, fd: FormData): Promise<FormState> {
  const meetingId = String(fd.get("meetingId") ?? "");
  const code = String(fd.get("code") ?? "").trim().toUpperCase();
  const m = await meetingEvent(meetingId);
  if (!m) return fail("Rapat tidak ditemukan.");

  const access = await getEventAccess(m.eventId);
  if (!access.committee) return fail("Hanya panitia yang sudah diterima di event ini yang bisa absen rapat.");
  if (!m.attendanceOpen) return fail("Absensi rapat ini belum dibuka atau sudah ditutup.");
  if (!code) return fail("Masukkan kode dari sekretaris.", { code: ["Kode wajib diisi"] });
  if (code !== m.code) return fail("Kode salah. Periksa kode yang tampil di layar sekretaris.", { code: ["Kode tidak cocok"] });

  const existing = await prisma.committeeMeetingAttendance.findUnique({ where: { meetingId_userId: { meetingId, userId: access.user.id } }, select: { id: true } });
  if (existing) return { success: "Kehadiranmu sudah tercatat." };

  await prisma.committeeMeetingAttendance.create({ data: { meetingId, userId: access.user.id, status: "PRESENT", method: "SELF" } });
  refresh(m.event.slug);
  return { success: `Hadir tercatat: ${m.title}.` };
}

/** Sekretaris/ketua mencatat atau mengoreksi kehadiran seseorang. status "NONE" menghapus catatan. */
export async function markMeetingAttendanceAction(meetingId: string, userId: string, status: "PRESENT" | "EXCUSED" | "NONE"): Promise<Result> {
  const m = await meetingEvent(meetingId);
  if (!m) return { ok: false, error: "Rapat tidak ditemukan." };
  const actor = await requireMeetingManager(m.eventId);

  const member = await prisma.committeeApplication.findUnique({ where: { eventId_userId: { eventId: m.eventId, userId } }, select: { status: true } });
  if (member?.status !== "ACCEPTED") return { ok: false, error: "Orang ini bukan panitia yang diterima di event ini." };

  if (status === "NONE") {
    await prisma.committeeMeetingAttendance.deleteMany({ where: { meetingId, userId } });
  } else {
    await prisma.committeeMeetingAttendance.upsert({
      where: { meetingId_userId: { meetingId, userId } },
      create: { meetingId, userId, status, method: "MANUAL", markedBy: actor.user.id },
      update: { status, method: "MANUAL", markedBy: actor.user.id, checkedInAt: new Date() },
    });
  }
  refresh(m.event.slug);
  return { ok: true };
}

/** Koreksi kehadiran hari-H panitia (mis. QR bermasalah). */
export async function markCommitteeDayAttendanceAction(applicationId: string, present: boolean): Promise<Result> {
  const app = await prisma.committeeApplication.findUnique({ where: { id: applicationId }, select: { id: true, eventId: true, status: true, event: { select: { slug: true } } } });
  if (!app || app.status !== "ACCEPTED") return { ok: false, error: "Panitia tidak ditemukan." };
  const actor = await requireMeetingManager(app.eventId);
  await prisma.$transaction([
    prisma.committeeApplication.update({ where: { id: app.id }, data: { attendedAt: present ? new Date() : null } }),
    prisma.auditLog.create({ data: { userId: actor.user.id, action: present ? "COMMITTEE_DAY_MARK" : "COMMITTEE_DAY_UNMARK", entity: "committee_applications", entityId: app.id } }),
  ]);
  refresh(app.event.slug);
  revalidatePath(`/admin/events/${app.eventId}`, "layout");
  return { ok: true };
}
