import { PrismaClient, RoleName } from "@prisma/client";
const prisma = new PrismaClient();

const perms = ["cms:write","finance:read","finance:write","event:manage","secretariat:manage","member:manage","aspirasi:manage"];
const rolePerms: Record<RoleName, string[]> = {
  SUPER_ADMIN: perms,
  ADMIN_EXECUTIVE: [], // domain perms granted per-user via user_permissions
  MEMBER: [],
  ALUMNI: [],
};
// PO 2026 Pasal 14: BPH + 5 departemen
const divisions = ["Pengurus Inti","Divisi A","Divisi B","Divisi C","Divisi D","Divisi E"];

async function main() {
  for (const code of perms) {
    await prisma.permission.upsert({ where: { code }, create: { code }, update: {} });
  }
  for (const name of Object.keys(rolePerms) as RoleName[]) {
    const role = await prisma.role.upsert({ where: { name }, create: { name }, update: {} });
    for (const code of rolePerms[name]) {
      const p = await prisma.permission.findUniqueOrThrow({ where: { code } });
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: p.id } },
        create: { roleId: role.id, permissionId: p.id }, update: {},
      });
    }
  }
  for (const name of divisions) {
    await prisma.division.upsert({ where: { name }, create: { name }, update: {} });
  }
}
main().finally(() => prisma.$disconnect());
