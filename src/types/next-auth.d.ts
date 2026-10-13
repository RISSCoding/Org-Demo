import type { DefaultSession } from "next-auth";
import type { RoleName } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      nim: string;
      role: RoleName;
      permissions: string[];
    } & DefaultSession["user"];
  }
  interface User {
    nim: string;
    role: RoleName;
    permissions: string[];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    nim: string;
    role: RoleName;
    permissions: string[];
  }
}
