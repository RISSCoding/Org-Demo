"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/rbac";

const registerSchema = z.object({
  nim: z.string().regex(/^\d{8,15}$/, "NPM must be numeric"),
  fullName: z.string().min(3).max(120),
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/\d/),
  batchYear: z.coerce.number().int().min(2000).max(new Date().getFullYear()),
  phoneNumber: z.string().optional(),
});

/** New accounts start PENDING; an admin with member:manage approves them. */
export async function registerMember(input: unknown): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;
  const exists = await prisma.user.findFirst({
    where: { OR: [{ nim: d.nim }, { email: d.email.toLowerCase() }] },
    select: { id: true },
  });
  if (exists) return { ok: false, error: "NPM or email already registered" };

  const role = await prisma.role.findUniqueOrThrow({ where: { name: "MEMBER" } });
  await prisma.user.create({
    data: {
      nim: d.nim,
      fullName: d.fullName,
      email: d.email.toLowerCase(),
      passwordHash: await bcrypt.hash(d.password, 12),
      batchYear: d.batchYear,
      phoneNumber: d.phoneNumber,
      roleId: role.id,
    },
  });
  return { ok: true, data: undefined };
}
