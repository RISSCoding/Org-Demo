"use server";

import { Prisma } from "@prisma/client";
import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isApprovalDoc } from "@/lib/approval-meta";
import { parseWIB } from "@/lib/datetime";
import {
  formatLetterNumber, isAutoNumbered, LETTER_KINDS, LETTER_NATURES, LETTER_TYPES,
  normalizeActivity, numberCode, wibYearMonth,
} from "@/lib/letters";
import { prisma } from "@/lib/prisma";
import { getTenantPrisma } from "@/lib/prisma-tenant";
import { deletePrivate, letterFileName, saveLetterPdf } from "@/lib/private-files";
import { ForbiddenError, requirePermission } from "@/lib/rbac";
import { UploadError } from "@/lib/storage";
import type { FormState } from "@/types/forms";

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid");
const toDate = (s: string) => parseWIB(`${s}T12:00`);
const yearOk = (s: string) => {
  const y = Number(s.slice(0, 4));
  return y >= 2018 && y <= new Date().getFullYear() + 1;
};

const base = {
  subject: z.string().trim().min(3, "Minimal 3 karakter").max(200),
  senderReceiver: z.string().trim().min(2, "Wajib diisi").max(200),
  letterDate: day.refine(yearOk, "Tahun tidak masuk akal"),
  nature: z.enum(LETTER_NATURES).optional(),
  receivedAt: day.optional(),
  summary: z.string().trim().max(1000).optional(),
  // Hanya proposal/LPJ: kegiatan tertaut dan penanda dana kampus (menentukan penandatangan lembar pengesahan).
  eventId: z.string().trim().max(40).optional(),
  campusFunds: z.boolean().optional(),
};

/** Kegiatan yang ditautkan harus ada; mengembalikan galat bidang bila tidak. */
async function checkEvent(eventId: string | undefined): Promise<FormState | null> {
  if (!eventId) return null;
  const ev = await tenantPrisma.event.findUnique({ where: { id: eventId }, select: { id: true } });
  return ev ? null : fail({ eventId: ["Kegiatan tidak ditemukan."] });
}

/** Aturan per jenis dokumen (PO Pasal 3). */
function checkByType(
  d: { type: (typeof LETTER_TYPES)[number]; kind?: string; nature?: string; receivedAt?: string; summary?: string },
  ctx: z.RefinementCtx,
  { needKind }: { needKind: boolean },
) {
  const bad = (path: string, message: string) => ctx.addIssue({ code: "custom", message, path: [path] });
  if (d.type === "SURAT_KELUAR") {
    if (needKind && !d.kind) bad("kind", "Pilih jenis surat");
    if (!d.nature) bad("nature", "Pilih sifat surat");
  }
  if (d.type === "SURAT_MASUK") {
    if (!d.receivedAt) bad("receivedAt", "Isi tanggal diterima");
    if (!d.summary || d.summary.length < 5) bad("summary", "Catat pokok masalah surat (minimal 5 karakter)");
  }
}

const createSchema = z
  .object({
    ...base,
    type: z.enum(LETTER_TYPES),
    kind: z.enum(LETTER_KINDS).optional(),
    activityName: z.string().trim().max(60).optional(),
    manualNumber: z.string().trim().max(100).optional(),
  })
  .superRefine((d, ctx) => checkByType(d, ctx, { needKind: true }));

const refresh = () => revalidatePath("/admin/secretariat", "layout");
const fail = (fieldErrors?: FormState["fieldErrors"]): FormState => ({
  error: "Periksa kembali isian formulir.",
  fieldErrors,
});
const text = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim() || undefined;

async function readPdf(fd: FormData): Promise<{ url?: string; error?: string }> {
  const file = fd.get("document");
  if (!(file instanceof File) || file.size === 0) return {};
  try {
    return { url: await saveLetterPdf(file) };
  } catch (e) {
    if (e instanceof UploadError) return { error: e.message };
    throw e;
  }
}

export async function createLetterAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requirePermission("secretariat:manage");
  const tenantPrisma = getTenantPrisma(user.organizationId!);

  const parsed = createSchema.safeParse({
    type: fd.get("type"),
    kind: text(fd, "kind"),
    nature: text(fd, "nature"),
    activityName: text(fd, "activityName"),
    manualNumber: text(fd, "manualNumber"),
    letterDate: fd.get("letterDate"),
    receivedAt: text(fd, "receivedAt"),
    summary: text(fd, "summary"),
    subject: fd.get("subject"),
    senderReceiver: fd.get("senderReceiver"),
    eventId: text(fd, "eventId"),
    campusFunds: fd.get("campusFunds") === "on",
  });
  if (!parsed.success) return fail(parsed.error.flatten().fieldErrors);
  const d = parsed.data;
  const isOut = d.type === "SURAT_KELUAR";
  const isIn = d.type === "SURAT_MASUK";
  const needsApproval = isApprovalDoc(d.type);

  const badEvent = needsApproval ? await checkEvent(d.eventId) : null;
  if (badEvent) return badEvent;

  const doc = await readPdf(fd);
  if (doc.error) return fail({ document: [doc.error] });

  const letterDate = toDate(d.letterDate);
  const { year, month } = wibYearMonth(letterDate);
  const activity = isAutoNumbered(d.type) ? normalizeActivity(d.activityName) : undefined;
  const kind = isOut ? d.kind : undefined;

  let letterId: string;
  try {
    const created = await prisma.$transaction(async (tx) => {
      let letterNumber: string | null = d.manualNumber ?? null;
      if (isAutoNumbered(d.type)) {
        // Atomic per (year, type): concurrent submissions can't receive the same sequence.
        const counter = await tx.letterCounter.upsert({
          where: { year_type: { year, type: d.type } },
          create: { year, type: d.type, last: 1 },
          update: { last: { increment: 1 } },
        });
        letterNumber = formatLetterNumber(numberCode(d.type, kind)!, counter.last, activity, year, month);
      }
      const letter = await tx.officialLetter.create({
        data: {
          letterNumber,
          type: d.type,
          kind,
          nature: isOut ? d.nature : undefined,
          activityName: activity,
          subject: d.subject,
          senderReceiver: d.senderReceiver,
          letterDate,
          receivedAt: isIn ? toDate(d.receivedAt!) : undefined,
          summary: isIn ? d.summary : undefined,
          documentUrl: doc.url,
          eventId: needsApproval ? (d.eventId ?? null) : null,
          campusFunds: needsApproval && d.campusFunds === true,
        },
      });
      await tx.auditLog.create({
        data: { userId: user.id, action: "CREATE", entity: "official_letters", entityId: letter.id, meta: { type: d.type, kind, letterNumber, eventId: d.eventId ?? null, campusFunds: d.campusFunds === true } },
      });
      return letter;
    });
    letterId = created.id;
  } catch (e) {
    const name = letterFileName(doc.url);
    if (name) await deletePrivate("letters", name);
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return fail({ manualNumber: ["Nomor surat ini sudah terdaftar."] });
    }
    throw e;
  }

  refresh();
  redirect(`/admin/secretariat/${letterId}?flash=letter-saved`);
}

/** Nomor, jenis, dan tanggal surat bernomor otomatis tidak diubah (nomor memuat bulan, tahun, dan kode jenis). */
export async function updateLetterAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requirePermission("secretariat:manage");
  const id = String(fd.get("id") ?? "");
  const letter = await tenantPrisma.officialLetter.findUnique({ where: { id } });
  if (!letter) return { error: "Surat tidak ditemukan." };

  const parsed = z
    .object({ ...base, type: z.literal(letter.type) })
    .superRefine((d, ctx) => checkByType(d, ctx, { needKind: false }))
    .safeParse({
      type: letter.type,
      nature: text(fd, "nature"),
      letterDate: isAutoNumbered(letter.type) ? dayOf(letter.letterDate) : fd.get("letterDate"),
      receivedAt: text(fd, "receivedAt"),
      summary: text(fd, "summary"),
      subject: fd.get("subject"),
      senderReceiver: fd.get("senderReceiver"),
      eventId: text(fd, "eventId"),
      campusFunds: fd.get("campusFunds") === "on",
    });
  if (!parsed.success) return fail(parsed.error.flatten().fieldErrors);
  const d = parsed.data;
  const isOut = letter.type === "SURAT_KELUAR";
  const isIn = letter.type === "SURAT_MASUK";
  const needsApproval = isApprovalDoc(letter.type);

  const badEvent = needsApproval ? await checkEvent(d.eventId) : null;
  if (badEvent) return badEvent;

  const doc = await readPdf(fd);
  if (doc.error) return fail({ document: [doc.error] });

  await prisma.$transaction([
    tenantPrisma.officialLetter.update({
      where: { id },
      data: {
        subject: d.subject,
        senderReceiver: d.senderReceiver,
        ...(isOut ? { nature: d.nature } : {}),
        ...(isIn ? { letterDate: toDate(d.letterDate), receivedAt: toDate(d.receivedAt!), summary: d.summary } : {}),
        ...(needsApproval ? { eventId: d.eventId ?? null, campusFunds: d.campusFunds === true } : {}),
        ...(doc.url ? { documentUrl: doc.url } : {}),
      },
    }),
    tenantPrisma.auditLog.create({
      data: { userId: user.id, action: "UPDATE", entity: "official_letters", entityId: id, meta: { replacedDocument: !!doc.url, ...(needsApproval ? { eventId: d.eventId ?? null, campusFunds: d.campusFunds === true } : {}) } },
    }),
  ]);
  if (doc.url) {
    const old = letterFileName(letter.documentUrl);
    if (old) await deletePrivate("letters", old);
  }

  refresh();
  return { success: "Perubahan disimpan." };
}

const dayOf = (d: Date) =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);

/** PO Pasal 3 ayat 6: surat masuk dicatat lalu diteruskan kepada Ketua. */
export async function forwardLetterAction(fd: FormData): Promise<void> {
  const user = await requirePermission("secretariat:manage");
  const id = String(fd.get("id") ?? "");
  const letter = await tenantPrisma.officialLetter.findUnique({ where: { id }, select: { type: true, forwardedAt: true } });
  if (!letter || letter.type !== "SURAT_MASUK" || letter.forwardedAt) return;

  await prisma.$transaction([
    tenantPrisma.officialLetter.update({ where: { id }, data: { forwardedAt: new Date() } }),
    tenantPrisma.auditLog.create({ data: { userId: user.id, action: "FORWARD", entity: "official_letters", entityId: id } }),
  ]);
  refresh();
}

/** Archive integrity: only SUPER_ADMIN may delete, and the sequence number is never reused. */
export async function deleteLetterAction(fd: FormData): Promise<void> {
  const user = await requirePermission("secretariat:manage");
  if (user.role !== "SUPER_ADMIN") throw new ForbiddenError("Hanya Super Admin yang boleh menghapus surat.");
  const id = String(fd.get("id") ?? "");
  const letter = await tenantPrisma.officialLetter.findUnique({ where: { id } });
  if (!letter) return;

  await prisma.$transaction([
    tenantPrisma.officialLetter.delete({ where: { id } }),
    tenantPrisma.auditLog.create({
      data: {
        userId: user.id,
        action: "DELETE",
        entity: "official_letters",
        entityId: id,
        meta: { letterNumber: letter.letterNumber, subject: letter.subject, type: letter.type },
      },
    }),
  ]);
  const name = letterFileName(letter.documentUrl);
  if (name) await deletePrivate("letters", name);

  refresh();
  redirect("/admin/secretariat?flash=letter-deleted");
}
