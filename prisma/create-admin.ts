import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { allocateKtaNumber } from "../src/lib/kta";

const prisma = new PrismaClient();

async function main() {
  const { ADMIN_NIM, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
  if (!ADMIN_NIM || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("Set ADMIN_NIM, ADMIN_EMAIL and ADMIN_PASSWORD");
  }
  const role = await prisma.role.findUniqueOrThrow({ where: { name: "SUPER_ADMIN" } });
  const user = await prisma.user.upsert({
    where: { nim: ADMIN_NIM },
    update: { roleId: role.id, approvalStatus: "APPROVED" },
    create: {
      nim: ADMIN_NIM,
      fullName: ADMIN_NAME ?? "Super Admin",
      email: ADMIN_EMAIL.toLowerCase(),
      passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12),
      batchYear: new Date().getFullYear(),
      roleId: role.id,
      approvalStatus: "APPROVED",
    },
  });
  const existing = await prisma.member.findUnique({ where: { userId: user.id }, select: { id: true } });
  if (!existing) {
    await prisma.member.create({
      data: { userId: user.id, ktaNumber: await allocateKtaNumber(prisma, ADMIN_NIM, user.batchYear) },
    });
  }
  console.log(`SUPER_ADMIN ready: ${user.email}`);
}

main().finally(() => prisma.$disconnect());
