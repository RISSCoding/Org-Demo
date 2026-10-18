"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { parseWIB } from "@/lib/datetime";
import { requireEventManager } from "@/lib/committee";
import { notify } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { getTenantPrisma } from "@/lib/prisma-tenant";
import { requirePermission } from "@/lib/rbac";
import type { FormState } from "@/types/forms";

const fail = (error: string, fieldErrors?: FormState["fieldErrors"]): FormState => ({ error, fieldErrors });

function refresh(eventId: string, slug?: string) {
  revalidatePath(`/admin/events/${eventId}`, "layout");
  revalidatePath("/dashboard/events", "layout");
  if (slug) revalidatePath(`/dashboard/events/${slug}`, "layout");
}

// ---------------------------------------------------------------- pengaturan & divisi (ketua / pengurus)

const dt = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Format tanggal tidak valid");

export async function saveCommitteeSettingsAction(_: FormState, fd: FormData): Promise<FormState> {
  const eventId = String(fd.get("eventId") ?? "");
  const actor = await requireEventManager(eventId);

  const event = await tenantPrisma.event.findUnique({
    where: { id: eventId },
    select: { slug: true, endDate: true, _count: { select: { committeeDivisions: true } } },
  });
  if (!event) return fail("Event tidak ditemukan.");

  const open = fd.get("committeeOpen") === "on";
  const raw = String(fd.get("committeeDeadline") ?? "").trim();
  let deadline: Date | null = null;
  if (raw) {
    const p = dt.safeParse(raw);
    if (!p.success) return fail("Periksa kembali isian.", { committeeDeadline: [p.error.issues[0].message] });
    deadline = parseWIB(p.data);
    if (deadline > event.endDate) {
      return fail("Periksa kembali isian.", { committeeDeadline: ["Batas pendaftaran tidak boleh setelah event berakhir."] });
    }
  }
  if (open && event._count.committeeDivisions === 0) {
    return fail("Tambahkan minimal satu divisi dulu sebelum membuka pendaftaran panitia.");
  }

  await prisma.$transaction([
    tenantPrisma.event.update({ where: { id: eventId }, data: { committeeOpen: open, committeeDeadline: deadline } }),
    tenantPrisma.auditLog.create({
      data: { userId: actor.user.id, action: "COMMITTEE_SETTINGS", entity: "events", entityId: eventId, meta: { open, deadline: deadline?.toISOString() ?? null } },
    }),
  ]);
  refresh(eventId, event.slug);
  return { success: open ? "Pendaftaran panitia dibuka." : "Pendaftaran panitia ditutup." };
}

const divisionSchema = z.object({
  name: z.string().trim().min(2, "Minimal 2 karakter").max(60, "Maksimal 60 karakter"),
  description: z.string().trim().max(300, "Maksimal 300 karakter").optional(),
  quota: z.number().int("Harus bilangan bulat").min(1, "Minimal 1").max(500).optional(),
});

export async function saveDivisionAction(_: FormState, fd: FormData): Promise<FormState> {
  const eventId = String(fd.get("eventId") ?? "");
  const actor = await requireEventManager(eventId);
  const id = Number(fd.get("id") ?? 0) || null;
  const quotaRaw = String(fd.get("quota") ?? "").trim();

  const parsed = divisionSchema.safeParse({
    name: fd.get("name"),
    description: String(fd.get("description") ?? "").trim() || undefined,
    quota: quotaRaw === "" ? undefined : Number(quotaRaw),
  });
  if (!parsed.success) return fail("Periksa kembali isian.", parsed.error.flatten().fieldErrors);
  const d = parsed.data;

  const clash = await tenantPrisma.committeeDivision.findFirst({
    where: { eventId, name: { equals: d.name, mode: "insensitive" }, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) return fail("Periksa kembali isian.", { name: ["Nama divisi ini sudah ada di event ini."] });

  if (id) {
    const own = await tenantPrisma.committeeDivision.findFirst({ where: { id, eventId }, select: { id: true } });
    if (!own) return fail("Divisi tidak ditemukan.");
    if (d.quota !== undefined) {
      const accepted = await tenantPrisma.committeeApplication.count({ where: { eventId, assignedDivisionId: id, status: "ACCEPTED" } });
      if (d.quota < accepted) return fail("Periksa kembali isian.", { quota: [`Sudah ada ${accepted} panitia diterima di divisi ini.`] });
    }
    await tenantPrisma.committeeDivision.update({ where: { id }, data: { name: d.name, description: d.description ?? null, quota: d.quota ?? null } });
  } else {
    const count = await tenantPrisma.committeeDivision.count({ where: { eventId } });
    await tenantPrisma.committeeDivision.create({
      data: { eventId, name: d.name, description: d.description ?? null, quota: d.quota ?? null, sortOrder: count },
    });
  }
  await tenantPrisma.auditLog.create({ data: { userId: actor.user.id, action: id ? "COMMITTEE_DIVISION_EDIT" : "COMMITTEE_DIVISION_ADD", entity: "events", entityId: eventId, meta: { name: d.name } } });
  refresh(eventId);
  return { success: id ? "Divisi diperbarui." : "Divisi ditambahkan." };
}

export async function deleteDivisionAction(_: FormState, fd: FormData): Promise<FormState> {
  const eventId = String(fd.get("eventId") ?? "");
  const actor = await requireEventManager(eventId);
  const id = Number(fd.get("id") ?? 0);

  const div = await tenantPrisma.committeeDivision.findFirst({ where: { id, eventId }, select: { id: true, name: true } });
  if (!div) return fail("Divisi tidak ditemukan.");
  const used = await tenantPrisma.committeeApplication.count({ where: { eventId, OR: [{ firstChoiceId: id }, { secondChoiceId: id }, { assignedDivisionId: id }] } });
  if (used > 0) return fail(`Divisi “${div.name}” sudah dipilih ${used} pendaftar, jadi tidak bisa dihapus.`);

  await prisma.$transaction([
    tenantPrisma.committeeDivision.delete({ where: { id } }),
    tenantPrisma.auditLog.create({ data: { userId: actor.user.id, action: "COMMITTEE_DIVISION_DELETE", entity: "events", entityId: eventId, meta: { name: div.name } } }),
  ]);
  refresh(eventId);
  return { success: "Divisi dihapus." };
}

// ---------------------------------------------------------------- pendaftaran oleh anggota

const applySchema = z.object({
  firstChoiceId: z.number().int().positive("Pilih divisi pilihan pertama"),
  secondChoiceId: z.number().int().positive().optional(),
  motivation: z.string().trim().min(30, "Tulis minimal 30 karakter agar seleksi punya bahan menilai").max(1000, "Maksimal 1000 karakter"),
  experience: z.string().trim().max(600, "Maksimal 600 karakter").optional(),
});

export async function applyCommitteeAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requirePermission();
  const tenantPrisma = getTenantPrisma(user.organizationId!);

  const eventId = String(fd.get("eventId") ?? "");
  const secondRaw = String(fd.get("secondChoiceId") ?? "");

  const parsed = applySchema.safeParse({
    firstChoiceId: Number(fd.get("firstChoiceId")),
    secondChoiceId: secondRaw ? Number(secondRaw) : undefined,
    motivation: fd.get("motivation"),
    experience: String(fd.get("experience") ?? "").trim() || undefined,
  });
  if (!parsed.success) return fail("Periksa kembali isian formulir.", parsed.error.flatten().fieldErrors);
  const d = parsed.data;

  const event = await tenantPrisma.event.findUnique({
    where: { id: eventId },
    select: { slug: true, endDate: true, committeeOpen: true, committeeDeadline: true, committeeDivisions: { select: { id: true } } },
  });
  if (!event) return fail("Event tidak ditemukan.");
  const now = new Date();
  if (!event.committeeOpen) return fail("Pendaftaran panitia untuk event ini belum dibuka atau sudah ditutup.");
  if (event.committeeDeadline && event.committeeDeadline < now) return fail("Batas pendaftaran panitia sudah lewat.");
  if (event.endDate < now) return fail("Event ini sudah berakhir.");

  const ids = new Set(event.committeeDivisions.map((x) => x.id));
  if (!ids.has(d.firstChoiceId)) return fail("Periksa kembali isian formulir.", { firstChoiceId: ["Divisi tidak valid."] });
  if (d.secondChoiceId !== undefined) {
    if (!ids.has(d.secondChoiceId)) return fail("Periksa kembali isian formulir.", { secondChoiceId: ["Divisi tidak valid."] });
    if (d.secondChoiceId === d.firstChoiceId) return fail("Periksa kembali isian formulir.", { secondChoiceId: ["Pilihan kedua harus berbeda dari pilihan pertama."] });
  }

  const member = await tenantPrisma.member.findUnique({ where: { userId: user.id }, select: { status: true } });
  if (!member || member.status !== "ACTIVE") return fail("Hanya anggota aktif yang bisa mendaftar sebagai panitia.");

  const asParticipant = await tenantPrisma.eventRegistration.findUnique({ where: { eventId_userId: { eventId, userId: user.id } }, select: { status: true } });
  if (asParticipant && asParticipant.status !== "CANCELLED") {
    return fail("Kamu sudah terdaftar sebagai peserta event ini. Batalkan pendaftaran peserta dulu kalau ingin menjadi panitia.");
  }

  const existing = await tenantPrisma.committeeApplication.findUnique({ where: { eventId_userId: { eventId, userId: user.id } }, select: { id: true, status: true } });
  if (existing && existing.status !== "WITHDRAWN") return fail("Kamu sudah mendaftar sebagai panitia di event ini.");

  const data = {
    firstChoiceId: d.firstChoiceId,
    secondChoiceId: d.secondChoiceId ?? null,
    motivation: d.motivation,
    experience: d.experience ?? null,
    status: "PENDING" as const,
    role: "MEMBER" as const,
    assignedDivisionId: null,
    decidedBy: null,
    decidedAt: null,
  };
  if (existing) await tenantPrisma.committeeApplication.update({ where: { id: existing.id }, data });
  else await tenantPrisma.committeeApplication.create({ data: { eventId, userId: user.id, ...data } });

  await tenantPrisma.auditLog.create({ data: { userId: user.id, action: "COMMITTEE_APPLY", entity: "events", entityId: eventId } });
  refresh(eventId, event.slug);
  return { success: "Pendaftaran panitia terkirim. Hasil seleksi akan tampil di halaman ini." };
}

export async function withdrawCommitteeAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requirePermission();
  const eventId = String(fd.get("eventId") ?? "");
  const app = await tenantPrisma.committeeApplication.findUnique({
    where: { eventId_userId: { eventId, userId: user.id } },
    select: { id: true, status: true, event: { select: { slug: true } } },
  });
  if (!app || app.status === "WITHDRAWN" || app.status === "REJECTED") return fail("Tidak ada pendaftaran yang bisa ditarik.");

  await prisma.$transaction([
    tenantPrisma.committeeApplication.update({ where: { id: app.id }, data: { status: "WITHDRAWN", assignedDivisionId: null, role: "MEMBER" } }),
    tenantPrisma.auditLog.create({ data: { userId: user.id, action: "COMMITTEE_WITHDRAW", entity: "events", entityId: eventId, meta: { from: app.status } } }),
  ]);
  refresh(eventId, app.event.slug);
  return { success: "Kamu sudah mengundurkan diri dari kepanitiaan." };
}

// ---------------------------------------------------------------- seleksi (ketua / pengurus)

const decisionSchema = z.object({
  applicationId: z.string().min(1),
  decision: z.enum(["PENDING", "ACCEPTED", "WAITLIST", "REJECTED"]),
  role: z.enum(["CHAIR", "SECRETARY", "TREASURER", "COORDINATOR", "MEMBER"]),
  divisionId: z.number().int().positive().optional(),
});

export async function decideApplicationAction(_: FormState, fd: FormData): Promise<FormState> {
  const divRaw = String(fd.get("divisionId") ?? "");
  const parsed = decisionSchema.safeParse({
    applicationId: fd.get("applicationId"),
    decision: fd.get("decision"),
    role: fd.get("role") || "MEMBER",
    divisionId: divRaw ? Number(divRaw) : undefined,
  });
  if (!parsed.success) return fail("Pilihan tidak valid.");
  const d = parsed.data;

  const app = await tenantPrisma.committeeApplication.findUnique({
    where: { id: d.applicationId },
    select: { id: true, eventId: true, userId: true, role: true, status: true, user: { select: { fullName: true } }, event: { select: { slug: true, title: true } } },
  });
  if (!app) return fail("Pendaftaran tidak ditemukan.");
  const actor = await requireEventManager(app.eventId);

  if (app.status === "WITHDRAWN") return fail("Pendaftar ini sudah mengundurkan diri.");
  if (app.userId === actor.user.id && !actor.isAdmin) return fail("Kamu tidak bisa mengubah status pendaftaranmu sendiri.");
  if (!actor.isAdmin && (d.role === "CHAIR" || app.role === "CHAIR")) return fail("Hanya pengurus yang bisa menunjuk atau mengganti ketua panitia.");

  let divisionId: number | null = null;
  if (d.decision === "ACCEPTED" && d.role === "CHAIR") {
    const other = await tenantPrisma.committeeApplication.findFirst({
      where: { eventId: app.eventId, status: "ACCEPTED", role: "CHAIR", NOT: { id: app.id } },
      select: { user: { select: { fullName: true } } },
    });
    if (other) return fail(`Event ini sudah punya ketua panitia (${other.user.fullName}). Ubah perannya dulu sebelum menunjuk ketua baru.`);
  }
  if (d.decision === "ACCEPTED") {
    if (!d.divisionId) return fail("Pilih divisi penempatan untuk panitia yang diterima.");
    const div = await tenantPrisma.committeeDivision.findFirst({ where: { id: d.divisionId, eventId: app.eventId }, select: { id: true, name: true, quota: true } });
    if (!div) return fail("Divisi tidak valid.");
    if (div.quota !== null) {
      const taken = await tenantPrisma.committeeApplication.count({
        where: { eventId: app.eventId, assignedDivisionId: div.id, status: "ACCEPTED", NOT: { id: app.id } },
      });
      if (taken >= div.quota) return fail(`Kuota divisi ${div.name} sudah penuh (${div.quota}). Pilih divisi lain, atau jadikan cadangan.`);
    }
    divisionId = div.id;
  }

  await prisma.$transaction([
    tenantPrisma.committeeApplication.update({
      where: { id: app.id },
      data: {
        status: d.decision,
        role: d.decision === "ACCEPTED" ? d.role : "MEMBER",
        assignedDivisionId: divisionId,
        decidedBy: d.decision === "PENDING" ? null : actor.user.id,
        decidedAt: d.decision === "PENDING" ? null : new Date(),
      },
    }),
    tenantPrisma.auditLog.create({
      data: { userId: actor.user.id, action: "COMMITTEE_DECIDE", entity: "committee_applications", entityId: app.id, meta: { decision: d.decision, role: d.role, divisionId } },
    }),
  ]);
  refresh(app.eventId, app.event.slug);

  // Notifikasi ke pendaftar tentang hasil seleksi.
  const messages: Record<typeof d.decision, { title: string; body: string }> = {
    ACCEPTED: {
      title: `Kamu diterima jadi panitia ${app.event.title ?? "event"}`,
      body: "Buka halaman kepanitiaan untuk melihat divisi dan tugasmu.",
    },
    WAITLIST: {
      title: `Kamu masuk cadangan kepanitiaan`,
      body: "Kami akan menghubungi kalau ada slot yang tersedia.",
    },
    REJECTED: {
      title: `Hasil seleksi panitia sudah keluar`,
      body: "Kali ini belum bisa kami terima. Terima kasih sudah mendaftar.",
    },
    PENDING: {
      title: "Pendaftaran panitia dikembalikan ke antrean",
      body: "Pengurus akan meninjau ulang pendaftaranmu.",
    },
  };
  await notify({
    userId: app.userId,
    type: "COMMITTEE_DECIDED",
    title: messages[d.decision].title,
    body: messages[d.decision].body,
    link: `/dashboard/events/${app.event.slug}/panitia`,
  });

  const word = { ACCEPTED: "diterima", WAITLIST: "dijadikan cadangan", REJECTED: "ditandai belum diterima", PENDING: "dikembalikan ke antrean" }[d.decision];
  return { success: `${app.user.fullName} ${word}.` };
}
