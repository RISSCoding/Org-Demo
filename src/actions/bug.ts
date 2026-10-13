"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { FeedbackState } from "@/types/feedback";

const AREAS = [
  "Portal anggota",
  "KTA",
  "Event & pendaftaran",
  "Kepanitiaan & rapat",
  "Iuran kas",
  "Surat & arsip",
  "Halaman publik",
  "Panel admin",
  "Lainnya",
] as const;

const schema = z.object({
  area: z.enum(AREAS, { message: "Pilih area." }),
  subject: z.string().trim().min(5, "Minimal 5 karakter.").max(120, "Maksimal 120 karakter."),
  whatHappened: z.string().trim().min(20, "Ceritakan minimal 20 karakter.").max(2000, "Maksimal 2000 karakter."),
  expected: z.string().trim().max(1000, "Maksimal 1000 karakter.").optional(),
  contact: z.string().trim().max(120).optional(),
});

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const newCode = () => `BUG-${Array.from(randomBytes(8), (b) => ALPHABET[b % ALPHABET.length]).join("")}`;

// Pembatas sederhana di memori proses. Tidak dibagi antar instance serverless.
const hits = new Map<string, number[]>();
function limited(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < 60 * 60 * 1000);
  if (recent.length >= 5) { hits.set(key, recent); return true; }
  hits.set(key, [...recent, now]);
  return false;
}

export async function submitBugReport(_: FeedbackState, fd: FormData): Promise<FeedbackState> {
  if (String(fd.get("website") ?? "").length > 0) return { error: "Laporan tidak dapat dikirim." };

  const parsed = schema.safeParse({
    area: fd.get("area"),
    subject: fd.get("subject"),
    whatHappened: fd.get("whatHappened"),
    expected: String(fd.get("expected") ?? "").trim() || undefined,
    contact: String(fd.get("contact") ?? "").trim() || undefined,
  });
  if (!parsed.success) {
    return { error: "Periksa kembali isian di bawah.", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const d = parsed.data;

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) return { error: "Terlalu banyak kiriman. Coba lagi dalam satu jam." };

  const session = await auth();
  const ua = h.get("user-agent") ?? "—";
  const contactLine = d.contact
    ? `Kontak: ${d.contact}`
    : session?.user
      ? `Kontak: ${session.user.name} (${session.user.nim})`
      : "Kontak: (tidak diberikan)";

  const pageUrl = String(fd.get("pageUrl") ?? "").trim();
  const safePage =
    pageUrl.startsWith("/") && pageUrl.length <= 200 && !pageUrl.startsWith("//")
      ? pageUrl
      : null;

  const message = [
    `Area: ${d.area}`,
    ...(safePage ? [`Halaman: ${safePage}`] : []),
    "",
    "Yang terjadi:",
    d.whatHappened,
    ...(d.expected ? ["", "Yang diharapkan:", d.expected] : []),
    "",
    contactLine,
    `Perangkat: ${ua}`,
  ].join("\n");

  for (let attempt = 0; attempt < 3; attempt++) {
    const code = newCode();
    try {
      await prisma.feedback.create({
        data: {
          isAnonymous: !d.contact && !session?.user,
          senderId: session?.user?.id ?? null,
          category: "Bug",
          subject: `[${d.area}] ${d.subject}`,
          message,
          trackingCode: code,
        },
      });
      revalidatePath("/admin", "layout");
      return { code };
    } catch (e) {
      if ((e as { code?: string }).code !== "P2002") break;
    }
  }
  return { error: "Laporan gagal disimpan. Coba lagi sebentar lagi." };
}
