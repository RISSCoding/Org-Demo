// Edge-safe config (no Prisma / bcrypt) — shared with middleware.
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.nim = user.nim;
        token.role = user.role;
        token.permissions = user.permissions;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.nim = token.nim;
      session.user.role = token.role;
      session.user.permissions = token.permissions;
      return session;
    },
  },
} satisfies NextAuthConfig;
