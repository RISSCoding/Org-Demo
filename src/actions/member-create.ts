"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/admin-guard";
import { allocateKtaNumber } from "@/lib/kta";
import { PERMISSION_OPTIONS } from "@/lib/permissions-meta";
import { prisma } from "@/lib/prisma";
import type { FormState } from "@/types/forms";

const PERM_CODES = PERMISSION_OPTIONS.map((p) => p.code) as [string, ...string[]];

const schema = z.object({
  fullName: z.string().trim().min(3, "Minimal 3 karakter").max(120),
  email: z.string().trim().toLowerCase().email("Email tidak valid"),
  nim: z.string().trim().regex(/^\d{6,20}$/, "NPM harus angka (6–20 digit)"),
  phoneNumber: z.string().trim().max(20).optional(),
  batchYear: z.number().int("Harus bilangan bulat").min(2000, "Tahun tidak valid").max(new Date().getFullYear() + 1),
  password: z.string().min(8, "Minimal 8 karakter").regex(/[A-Z]/, "Harus ada huruf kapital").regex(/\d/, "Harus ada angka"),
  roleName: z.enum(["SUPER_ADMIN", "ADMIN_EXECUTIVE", "MEMBER", "ALUMNI"]),
  memberStatus: z.enum(["ACTIVE", "INACTIVE", "ALUMNI"]),
  divisionId: z.number().int().optional(),
  department: z.string().trim().max(100).optional(),
  perms: z.array(z.enum(PERM_CODES)),
});

/** SUPER_ADMIN adds a member directly: already approved, KTA number issued, ready to log in. */
export async function createMemberAction(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireSuperAdmin();

  const optional = (k: string) => {
    const v = String(fd.get(k) ?? "").trim();
    return v === "" ? undefined : v;
  };
  const parsed = schema.safeParse({
    fullName: fd.get("fullName"),
    email: fd.get("email"),
    nim: fd.get("nim"),
    phoneNumber: optional("phoneNumber"),
    batchYear: Number(fd.get("batchYear")),
    password: fd.get("password"),
    roleName: fd.get("roleName"),
    memberStatus: fd.get("memberStatus"),
    divisionId: optional("divisionId") ? Number(optional("divisionId")) : undefined,
    department: optional("department"),
    perms: fd.getAll("perms").map(String),
  });
  if (!parsed.success) {
    return { error: "Periksa kembali isian formulir.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;

  const dup = await prisma.user.findFirst({
    where: { OR: [{ nim: d.nim }, { email: d.email }] },
    select: { nim: true, email: true },
  });
  if (dup) {
    const fieldErrors: Record<string, string[]> = {};
    if (dup.nim === d.nim) fieldErrors.nim = ["NPM sudah terdaftar."];
    if (dup.email === d.email) fieldErrors.email = ["Email sudah terdaftar."];
    return { error: "NPM atau email sudah terdaftar.", fieldErrors };
  }

  const role = await prisma.role.findUniqueOrThrow({ where: { name: d.roleName } });
  const permRows = await prisma.permission.findMany({ where: { code: { in: d.perms } } });
  const passwordHash = await bcrypt.hash(d.password, 12);

  let userId: string;
  try {
    userId = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          nim: d.nim,
          fullName: d.fullName,
          email: d.email,
          passwordHash,
          batchYear: d.batchYear,
          phoneNumber: d.phoneNumber ?? null,
          roleId: role.id,
          approvalStatus: "APPROVED",
        },
      });
      if (permRows.length) {
        await tx.userPermission.createMany({ data: permRows.map((p) => ({ userId: u.id, permissionId: p.id })) });
      }
      await tx.member.create({
        data: {
          userId: u.id,
          ktaNumber: await allocateKtaNumber(tx, d.nim, d.batchYear),
          status: d.memberStatus,
          divisionId: d.divisionId ?? null,
          department: d.department ?? null,
        },
      });
      await tx.auditLog.create({
        data: { userId: admin.id, action: "CREATE_MEMBER", entity: "users", entityId: u.id, meta: { role: d.roleName } },
      });
      return u.id;
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "Data bentrok dengan anggota lain (NPM, email, atau nomor KTA)." };
    }
    throw e;
  }

  revalidatePath("/admin/members");
  revalidatePath("/admin");
  redirect(`/admin/members/${userId}?created=1`);
}
