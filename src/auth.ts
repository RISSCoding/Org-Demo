import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { permissionsForPositions } from "@/lib/officer-permissions";
import { getTenantSubdomain } from "@/lib/tenant";
import { authConfig } from "./auth.config";

const credentialsSchema = z.object({
  identifier: z.string().min(3), // NPM or email
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  providers: [
    Credentials({
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { identifier, password } = parsed.data;

        // 1. Dapatkan organisasi aktif berdasarkan subdomain
        const subdomain = await getTenantSubdomain();
        const org = await prisma.organization.findUnique({
          where: { subdomain },
          select: { id: true, status: true },
        });

        if (!org || org.status !== "ACTIVE") {
          console.error("Login gagal: Organisasi tidak ditemukan atau ditangguhkan.");
          return null;
        }

        // 2. Cari user
        const user = await prisma.user.findFirst({
          where: { OR: [{ nim: identifier }, { email: identifier.toLowerCase() }] },
          include: {
            role: { include: { permissions: { include: { permission: true } } } },
            extraPerms: { include: { permission: true } },
            officerRoles: { select: { position: true } },
          },
        });

        if (!user || user.approvalStatus !== "APPROVED") return null;
        if (!(await bcrypt.compare(password, user.passwordHash))) return null;

        // 3. Validasi Multi-Tenant: User harus milik organisasi ini
        // (Kecuali Super Admin Platform yang mungkin punya organizationId = null)
        if (user.organizationId && user.organizationId !== org.id) {
          console.error("Login gagal: User bukan anggota organisasi ini.");
          return null;
        }

        const permissions = [
          ...new Set([
            ...user.role.permissions.map((p) => p.permission.code),
            ...user.extraPerms.map((p) => p.permission.code),
            ...permissionsForPositions(user.officerRoles.map((o) => o.position)),
          ]),
        ];

        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
          image: user.avatarUrl,
          nim: user.nim,
          role: user.role.name,
          permissions,
          organizationId: user.organizationId || org.id, // Kaitkan ke org aktif
        };
      },
    }),
  ],
});
