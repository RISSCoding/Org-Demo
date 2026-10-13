"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/admin-guard";
import { allocateKtaNumber } from "@/lib/kta";
import { batchYearFromNpm, defaultPassword, parseNewStudentsSheet, placeholderEmail } from "@/lib/member-import";
import type { ImportPreview } from "@/lib/member-import";
import { prisma } from "@/lib/prisma";

const MAX_BYTES = 5 * 1024 * 1024;

/** Langkah 1: baca file, ambil blok prodi yang dipilih, tandai NPM yang sudah terdaftar. Belum menyimpan apa pun. */
export async function previewMemberImportAction(fd: FormData): Promise<ImportPreview> {
  await requireSuperAdmin();

  const file = fd.get("file");
  const prodi = String(fd.get("prodi") ?? "").trim();
  if (!(file instanceof File) || file.size === 0) return { error: "Pilih file .xlsx terlebih dahulu." };
  if (!file.name.toLowerCase().endsWith(".xlsx")) return { error: "Format harus .xlsx." };
  if (file.size > MAX_BYTES) return { error: "File terlalu besar (maks. 5 MB)." };
  if (prodi.length < 3) return { error: "Isi nama prodi, misalnya Manajemen." };

  let parsed;
  try {
    parsed = await parseNewStudentsSheet(Buffer.from(await file.arrayBuffer()), prodi);
  } catch {
    return { error: "File tidak bisa dibaca. Pastikan ini berkas Excel (.xlsx) yang valid." };
  }
  if (!parsed.found) {
    return {
      error: `Blok "PRODI ${prodi.toUpperCase()}" tidak ditemukan di file.`,
      sections: parsed.sections,
    };
  }

  const existing = await prisma.user.findMany({
    where: { nim: { in: parsed.rows.map((r) => r.nim) } },
    select: { nim: true },
  });
  const taken = new Set(existing.map((u) => u.nim));

  return {
    prodiLabel: prodi.toUpperCase(),
    sections: parsed.sections,
    invalid: parsed.invalid,
    rows: parsed.rows.map((r) => ({ ...r, exists: taken.has(r.nim) })),
  };
}

const chunkSchema = z.object({
  rows: z.array(z.object({ nim: z.string().regex(/^\d{6,20}$/), fullName: z.string().trim().min(3).max(120) })).min(1).max(40),
  memberStatus: z.enum(["ACTIVE", "INACTIVE", "ALUMNI"]),
});

export type ImportChunkResult = { created: number; skipped: number; failed: { nim: string; reason: string }[] };

/**
 * Langkah 2: dipanggil berulang dari klien per kelompok (maks. 40 baris) supaya tidak kena timeout
 * dan progres bisa ditampilkan. Akun langsung APPROVED, peran MEMBER, nomor KTA otomatis.
 */
export async function importMembersChunkAction(input: z.input<typeof chunkSchema>): Promise<ImportChunkResult> {
  const admin = await requireSuperAdmin();
  const parsed = chunkSchema.safeParse(input);
  if (!parsed.success) return { created: 0, skipped: 0, failed: [{ nim: "-", reason: "Data kelompok tidak valid" }] };
  const { rows, memberStatus } = parsed.data;

  const role = await prisma.role.findUniqueOrThrow({ where: { name: "MEMBER" } });
  const res: ImportChunkResult = { created: 0, skipped: 0, failed: [] };

  for (const r of rows) {
    const batchYear = batchYearFromNpm(r.nim);
    const email = placeholderEmail(r.nim);
    try {
      const dup = await prisma.user.findFirst({ where: { OR: [{ nim: r.nim }, { email }] }, select: { id: true } });
      if (dup) { res.skipped++; continue; }

      // cost 10 (bukan 12) agar ratusan akun selesai cepat; bcrypt membaca cost dari hash, login tetap normal.
      const passwordHash = await bcrypt.hash(defaultPassword(r.nim, batchYear), 10);
      await prisma.$transaction(async (tx) => {
        const u = await tx.user.create({
          data: {
            nim: r.nim, fullName: r.fullName, email, passwordHash, batchYear,
            roleId: role.id, approvalStatus: "APPROVED",
          },
        });
        await tx.member.create({
          data: { userId: u.id, ktaNumber: await allocateKtaNumber(tx, r.nim, batchYear), status: memberStatus },
        });
      });
      res.created++;
    } catch (e) {
      const conflict = e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
      res.failed.push({ nim: r.nim, reason: conflict ? "Data bentrok (NPM/email/KTA)" : "Gagal menyimpan" });
    }
  }

  if (res.created > 0) {
    await prisma.auditLog.create({
      data: { userId: admin.id, action: "IMPORT_MEMBERS", entity: "users", entityId: admin.id, meta: { created: res.created, skipped: res.skipped, failed: res.failed.length } },
    });
    revalidatePath("/admin/members");
    revalidatePath("/admin");
  }
  return res;
}
