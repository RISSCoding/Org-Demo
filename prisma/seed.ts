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

// Organisasi default untuk instalasi single-tenant (dev / self-host).
// Subdomain default "demo" cocok dengan yang dikembalikan src/lib/tenant.ts untuk localhost.
// Untuk produksi multi-tenant, nilai ini biasanya tidak dipakai — organisasi dibuat lewat
// alur pendaftaran, bukan seed. Override lewat env bila perlu.
const DEFAULT_SUBDOMAIN = process.env.SEED_ORG_SUBDOMAIN ?? "demo";
const DEFAULT_NAME = process.env.SEED_ORG_NAME ?? "Portal Organisasi";

async function main() {
  // 1. Izin dan peran (model global, tidak terkait organisasi)
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

  // 2. Organisasi default (idempoten: subdomain adalah kunci)
  const org = await prisma.organization.upsert({
    where: { subdomain: DEFAULT_SUBDOMAIN },
    create: { name: DEFAULT_NAME, subdomain: DEFAULT_SUBDOMAIN },
    update: {},
  });
  console.log(`Organisasi default: ${org.subdomain} (${org.id})`);

  // 3. Divisi contoh milik organisasi default.
  // Pakai findFirst+create (bukan upsert dengan where: { name }) supaya tetap bekerja
  // setelah unique global pada divisions.name diganti unique per tenant (PR berikutnya).
  for (const name of divisions) {
    const existing = await prisma.division.findFirst({
      where: { name, organizationId: org.id },
      select: { id: true },
    });
    if (!existing) {
      await prisma.division.create({ data: { name, organizationId: org.id } });
    }
  }
  console.log(`Seed selesai: ${divisions.length} divisi di ${org.subdomain}.`);
}
main().finally(() => prisma.$disconnect());
