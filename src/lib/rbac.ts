import { auth } from "@/auth";

export const PERMISSIONS = [
  "cms:write",
  "finance:read",
  "finance:write",
  "event:manage",
  "secretariat:manage",
  "member:manage",
  "aspirasi:manage",
] as const;
export type PermissionCode = (typeof PERMISSIONS)[number];

export class ForbiddenError extends Error {
  constructor(msg = "Forbidden") { super(msg); }
}
export class UnauthorizedError extends Error {
  constructor(msg = "Unauthorized") { super(msg); }
}

/** Call at the top of every Server Action / Route Handler. SUPER_ADMIN bypasses. */
export async function requirePermission(code?: PermissionCode) {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  const { role, permissions } = session.user;
  if (code && role !== "SUPER_ADMIN" && !permissions.includes(code)) {
    throw new ForbiddenError(`Missing permission: ${code}`);
  }
  return session.user;
}

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
