import type { DivisionRole, OfficerPosition } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Struktur organisasi untuk halaman publik: pemegang jabatan ring 1,
 * Dewan Pembina, dan daftar anggota tiap departemen.
 *
 * Data diambil dari database (dikelola lewat /admin/divisions), bukan dari
 * berkas statis — supaya perubahan pengurus langsung terlihat di situs.
 * Nama saja; NIM, email, nomor HP tidak pernah ditampilkan di sini.
 */
export type OfficerHolder = {
  userId: string | null;
  name: string;
  avatarUrl: string | null;
};

export type DivisionMember = {
  userId: string;
  name: string;
  avatarUrl: string | null;
  divisionRole: DivisionRole | null;
};

export type DivisionSnapshot = {
  id: number;
  name: string;
  members: DivisionMember[];
};

export type OrgStructure = {
  core: Partial<Record<OfficerPosition, OfficerHolder>>;
  advisors: OfficerHolder[];
  divisions: DivisionSnapshot[];
};

export async function getOrgStructure(): Promise<OrgStructure> {
  const [officers, divisions] = await Promise.all([
    prisma.orgOfficer.findMany({
      orderBy: { id: "asc" },
      select: {
        position: true,
        userId: true,
        name: true,
        user: { select: { fullName: true, avatarUrl: true } },
      },
    }),
    prisma.division.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        members: {
          where: { status: "ACTIVE" },
          orderBy: { user: { fullName: "asc" } },
          select: {
            divisionRole: true,
            user: { select: { id: true, fullName: true, avatarUrl: true } },
          },
        },
      },
    }),
  ]);

  const core: Partial<Record<OfficerPosition, OfficerHolder>> = {};
  const advisors: OfficerHolder[] = [];

  for (const o of officers) {
    const name = (o.user?.fullName ?? o.name ?? "").trim();
    if (!name) continue;
    const holder: OfficerHolder = {
      userId: o.userId,
      name,
      avatarUrl: o.user?.avatarUrl ?? null,
    };
    if (o.position === "ADVISOR") advisors.push(holder);
    else if (!core[o.position]) core[o.position] = holder;
  }

  const divs: DivisionSnapshot[] = divisions.map((d) => ({
    id: d.id,
    name: d.name,
    members: d.members.map((m) => ({
      userId: m.user.id,
      name: m.user.fullName,
      avatarUrl: m.user.avatarUrl,
      divisionRole: m.divisionRole,
    })),
  }));

  return { core, advisors, divisions: divs };
}
