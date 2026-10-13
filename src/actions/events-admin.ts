"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { parseWIB } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { slugify, withSuffix } from "@/lib/slug";
import { saveImage, UploadError } from "@/lib/storage";
import type { FormState } from "@/types/forms";

const dt = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Format tanggal tidak valid");

const eventSchema = z.object({
  title: z.string().trim().min(3, "Minimal 3 karakter").max(150),
  description: z.string().trim().min(10, "Minimal 10 karakter").max(5000),
  location: z.string().trim().min(2, "Wajib diisi").max(200),
  startDate: dt,
  endDate: dt,
  quota: z.number().int("Harus bilangan bulat").min(1, "Minimal 1").max(100000).optional(),
  isPublic: z.boolean(),
});

async function uniqueSlug(title: string) {
  const base = slugify(title);
  let slug = base;
  while (await prisma.event.findUnique({ where: { slug }, select: { id: true } })) slug = withSuffix(base);
  return slug;
}

export async function saveEventAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requirePermission("event:manage");
  const id = String(fd.get("id") ?? "");
  const quotaRaw = String(fd.get("quota") ?? "").trim();

  const parsed = eventSchema.safeParse({
    title: fd.get("title"),
    description: fd.get("description"),
    location: fd.get("location"),
    startDate: fd.get("startDate"),
    endDate: fd.get("endDate"),
    quota: quotaRaw === "" ? undefined : Number(quotaRaw),
    isPublic: fd.get("isPublic") === "on",
  });
  if (!parsed.success) {
    return { error: "Periksa kembali isian formulir.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;
  const start = parseWIB(d.startDate);
  const end = parseWIB(d.endDate);
  if (end < start) {
    return { error: "Periksa kembali isian formulir.", fieldErrors: { endDate: ["Waktu selesai harus setelah waktu mulai."] } };
  }

  let bannerUrl: string | undefined;
  const banner = fd.get("banner");
  if (banner instanceof File && banner.size > 0) {
    try {
      bannerUrl = await saveImage(banner, "events");
    } catch (e) {
      if (e instanceof UploadError) return { error: "Banner gagal diunggah.", fieldErrors: { banner: [e.message] } };
      throw e;
    }
  }

  const data = {
    title: d.title,
    description: d.description,
    location: d.location,
    startDate: start,
    endDate: end,
    quota: d.quota ?? null,
    isPublic: d.isPublic,
    ...(bannerUrl ? { bannerUrl } : {}),
  };

  let eventId: string;
  if (id) {
    const existing = await prisma.event.findUnique({
      where: { id },
      select: { _count: { select: { registrations: { where: { status: { not: "CANCELLED" } } } } } },
    });
    if (!existing) return { error: "Event tidak ditemukan." };
    if (d.quota !== undefined && d.quota < existing._count.registrations) {
      return {
        error: "Periksa kembali isian formulir.",
        fieldErrors: { quota: [`Sudah ada ${existing._count.registrations} peserta terdaftar.`] },
      };
    }
    await prisma.event.update({ where: { id }, data });
    eventId = id;
  } else {
    const created = await prisma.event.create({
      data: { ...data, slug: await uniqueSlug(d.title), createdBy: user.id },
    });
    eventId = created.id;
  }

  await prisma.auditLog.create({
    data: { userId: user.id, action: id ? "UPDATE" : "CREATE", entity: "events", entityId: eventId },
  });
  revalidatePath("/admin/events");
  revalidatePath("/dashboard/events", "layout");
  redirect(`/admin/events/${eventId}?flash=event-saved`);
}
