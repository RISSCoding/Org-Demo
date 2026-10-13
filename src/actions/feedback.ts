"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { FeedbackState } from "@/types/feedback";

const schema = z.object({
  category: z.enum(["Aspirasi", "Keluhan", "Laporan"], { message: "Pilih jenis pesan." }),
  subject: z.string().trim().min(5, "Judul minimal 5 karakter.").max(120, "Judul maksimal 120 karakter."),
  message: z.string().trim().min(20, "Isi minimal 20 karakter.").max(4000, "Isi maksimal 4000 karakter."),
});

// Tanpa 0, 1, I, O supaya mudah dibaca dan disalin. 32 karakter, jadi tidak bias saat dipetakan dari byte.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const newCode = () =>
  `ASP-${Array.from(randomBytes(8), (b) => ALPHABET[b % ALPHABET.length]).join("")}`;

// Pembatas sederhana di memori proses (5 kiriman per jam per alamat). Alamat tidak disimpan ke database.
// Di hosting serverless penghitungnya tidak dibagi antar instance; pakai penyimpanan bersama bila perlu.
const hits = new Map<string, number[]>();
function limited(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < 60 * 60 * 1000);
  if (recent.length >= 5) {
    hits.set(key, recent);
    return true;
  }
  hits.set(key, [...recent, now]);
  return false;
}

export async function submitFeedback(_: FeedbackState, fd: FormData): Promise<FeedbackState> {
  // Kolom jebakan: manusia tidak melihatnya, bot biasanya mengisinya.
  if (String(fd.get("website") ?? "").length > 0) return { error: "Pesan tidak dapat dikirim." };

  const parsed = schema.safeParse({
    category: fd.get("category"),
    subject: fd.get("subject"),
    message: fd.get("message"),
  });
  if (!parsed.success) {
    return { error: "Periksa kembali isian di bawah.", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const anonymous = fd.get("anonymous") === "on";
  let senderId: string | null = null;
  if (!anonymous) {
    const session = await auth();
    if (!session?.user) {
      return { error: "Masuk dulu untuk menyertakan identitas, atau centang \"Kirim tanpa nama\"." };
    }
    senderId = session.user.id;
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) return { error: "Terlalu banyak kiriman. Coba lagi dalam satu jam." };

  for (let attempt = 0; attempt < 3; attempt++) {
    const code = newCode();
    try {
      await prisma.feedback.create({
        data: { isAnonymous: anonymous, senderId, trackingCode: code, ...parsed.data },
      });
      revalidatePath("/admin", "layout");
      return { code };
    } catch (e) {
      // P2002 = kode bentrok (sangat jarang): ulangi dengan kode baru.
      if ((e as { code?: string }).code !== "P2002") break;
    }
  }
  return { error: "Pesan gagal disimpan. Coba lagi sebentar lagi." };
}
