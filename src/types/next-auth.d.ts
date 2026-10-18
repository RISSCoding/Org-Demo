import { RoleName } from "@prisma/client";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    nim: string;
    role: RoleName;
    permissions: string[];
    organizationId: string | null;
  }
  interface Session {
    user: User & {
      id: string;
      nim: string;
      role: RoleName;
      permissions: string[];
      organizationId: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    nim: string;
    role: RoleName;
    permissions: string[];
    organizationId: string | null;
  }
}
