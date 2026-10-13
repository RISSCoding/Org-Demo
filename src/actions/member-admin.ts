"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/admin-guard";
import { PERMISSION_OPTIONS } from "@/lib/permissions-meta";
import { prisma } from "@/lib/prisma";
import type { FormState } from "@/types/forms";

const PERM_CODES = PERMISSION_OPTIONS.map((p) => p.code) as [string, ...string[]];

const schema = z.object({
  id: z.string().min(1),
  fullName: z.string().trim().min(3, "Minimal 3 karakter").max(120),
  email: z.string().trim().toLowerCase().email("Email tidak valid"),
  nim: z.string().trim().regex(/^\d{6,20}$/, "NPM harus angka (6–20 digit)"),
  phoneNumber: z.string().trim().max(20).optional(),
  batchYear: z.number().int("Harus bilangan bulat").min(2000, "Tahun tidak valid").max(new Date().getFullYear() + 1),
  roleName: z.enum(["SUPER_ADMIN", "ADMIN_EXECUTIVE", "MEMBER", "ALUMNI"]),
  approvalStatus: z.enum(["APPROVED", "PENDING", "REJECTED"]),
  memberStatus: z.enum(["ACTIVE", "INACTIVE", "ALUMNI"]),
  divisionId: z.number().int().optional(),
  department: z.string().trim().max(100).optional(),
  perms: z.array(z.enum(PERM_CODES)),
});

export async function updateMemberAction(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireSuperAdmin();

  const optional = (k: string) => {
    const v = String(fd.get(k) ?? "").trim();
    return v === "" ? undefined : v;
  };
  const parsed = schema.safeParse({
    id: fd.get("id"),
    fullName: fd.get("fullName"),
    email: fd.get("email"),
    nim: fd.get("nim"),
    phoneNumber: optional("phoneNumber"),
    batchYear: Number(fd.get("batchYear")),
    roleName: fd.get("roleName"),
    approvalStatus: fd.get("approvalStatus"),
    memberStatus: fd.get("memberStatus"),
    divisionId: optional("divisionId") ? Number(optional("divisionId")) : undefined,
    department: optional("department"),
    perms: fd.getAll("perms").map(String),
  });
  if (!parsed.success) {
    return { error: "Periksa kembali isian formulir.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;

  const target = await prisma.user.findUnique({
    where: { id: d.id },
    include: { role: true, member: true, extraPerms: { include: { permission: true } } },
  });
  if (!target) return { error: "Anggota tidak ditemukan." };

  // ---- lockout protection ----
  const losesSuperAdmin =
    target.role.name === "SUPER_ADMIN" && (d.roleName !== "SUPER_ADMIN" || d.approvalStatus !== "APPROVED");
  if (target.id === admin.id && losesSuperAdmin) {
    return { error: "Kamu tidak bisa menurunkan atau menonaktifkan akunmu sendiri. Minta Super Admin lain melakukannya." };
  }
  if (losesSuperAdmin) {
    const others = await prisma.user.count({
      where: { id: { not: target.id }, approvalStatus: "APPROVED", role: { name: "SUPER_ADMIN" } },
    });
    if (others === 0) return { error: "Harus selalu ada minimal satu Super Admin aktif." };
  }

  const role = await prisma.role.findUniqueOrThrow({ where: { name: d.roleName } });
  const permRows = await prisma.permission.findMany({ where: { code: { in: d.perms } } });

  const oldPerms = target.extraPerms.map((p) => p.permission.code).sort();
  const newPerms = [...d.perms].sort();
  const changed = [
    d.fullName !== target.fullName && "fullName",
    d.email !== target.email && "email",
    d.nim !== target.nim && "nim",
    (d.phoneNumber ?? null) !== target.phoneNumber && "phoneNumber",
    d.batchYear !== target.batchYear && "batchYear",
    role.id !== target.roleId && `role→${d.roleName}`,
    d.approvalStatus !== target.approvalStatus && `approval→${d.approvalStatus}`,
    d.memberStatus !== (target.member?.status ?? d.memberStatus) && `status→${d.memberStatus}`,
    (d.divisionId ?? null) !== (target.member?.divisionId ?? null) && "division",
    (d.department ?? null) !== (target.member?.department ?? null) && "department",
    JSON.stringify(oldPerms) !== JSON.stringify(newPerms) && "permissions",
  ].filter(Boolean) as string[];

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: d.id },
        data: {
          fullName: d.fullName,
          email: d.email,
          nim: d.nim,
          phoneNumber: d.phoneNumber ?? null,
          batchYear: d.batchYear,
          roleId: role.id,
          approvalStatus: d.approvalStatus,
        },
      });

      await tx.userPermission.deleteMany({ where: { userId: d.id } });
      if (permRows.length) {
        await tx.userPermission.createMany({
          data: permRows.map((p) => ({ userId: d.id, permissionId: p.id })),
        });
      }

      const defaultKta = (nim: string) => `HIMMAN-${nim}`;
      const profile = { status: d.memberStatus, divisionId: d.divisionId ?? null, department: d.department ?? null };
      if (target.member) {
        const syncKta = target.nim !== d.nim && target.member.ktaNumber === defaultKta(target.nim);
        await tx.member.update({
          where: { userId: d.id },
          data: { ...profile, ...(syncKta ? { ktaNumber: defaultKta(d.nim) } : {}) },
        });
      } else if (d.approvalStatus === "APPROVED") {
        await tx.member.create({ data: { userId: d.id, ktaNumber: defaultKta(d.nim), ...profile } });
      }

      await tx.auditLog.create({
        data: { userId: admin.id, action: "UPDATE_MEMBER", entity: "users", entityId: d.id, meta: { changed } },
      });
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const t = String(e.meta?.target ?? "");
      if (t.includes("nim")) return { error: "NPM sudah dipakai anggota lain.", fieldErrors: { nim: ["NPM sudah dipakai."] } };
      if (t.includes("email")) return { error: "Email sudah dipakai anggota lain.", fieldErrors: { email: ["Email sudah dipakai."] } };
      return { error: "Data bentrok dengan anggota lain (NPM, email, atau nomor KTA)." };
    }
    throw e;
  }

  revalidatePath("/admin", "layout");
  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${d.id}`);
  const accessChanged = changed.some((c) => c.startsWith("role") || c.startsWith("approval") || c === "permissions");
  return {
    success: changed.length === 0
      ? "Tidak ada perubahan."
      : accessChanged
        ? "Perubahan disimpan. Perubahan peran/akses berlaku setelah yang bersangkutan login ulang."
        : "Perubahan disimpan.",
  };
}

const pwSchema = z.object({
  id: z.string().min(1),
  password: z.string().min(8, "Minimal 8 karakter").regex(/[A-Z]/, "Harus ada huruf kapital").regex(/\d/, "Harus ada angka"),
});

export async function resetPasswordAction(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireSuperAdmin();
  const parsed = pwSchema.safeParse({ id: fd.get("id"), password: fd.get("password") });
  if (!parsed.success) {
    return { error: "Password tidak memenuhi syarat.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const exists = await prisma.user.findUnique({ where: { id: parsed.data.id }, select: { id: true } });
  if (!exists) return { error: "Anggota tidak ditemukan." };

  await prisma.user.update({
    where: { id: parsed.data.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.password, 12) },
  });
  await prisma.auditLog.create({
    data: { userId: admin.id, action: "RESET_PASSWORD", entity: "users", entityId: parsed.data.id },
  });
  return { success: "Password diganti. Sampaikan password baru ke anggota yang bersangkutan." };
}
