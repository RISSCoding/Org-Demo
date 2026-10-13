import { ForbiddenError, requirePermission } from "@/lib/rbac";

/** Member editing is reserved for SUPER_ADMIN. */
export async function requireSuperAdmin() {
  const user = await requirePermission("member:manage");
  if (user.role !== "SUPER_ADMIN") throw new ForbiddenError("Hanya Super Admin yang boleh mengubah anggota.");
  return user;
}
