import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { permissionsForPositions } from "@/lib/officer-permissions";
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
        };
      },
    }),
  ],
});
