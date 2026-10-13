import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ForbiddenError, UnauthorizedError } from "@/lib/rbac";

/**
 * Hak akses per event. Peran panitia hanya berlaku di event tempat ia diterima,
 * sehingga ketua panitia tidak perlu dijadikan admin global.
 *  - Pengurus (event:manage) atau Super Admin: semuanya.
 *  - Ketua panitia (CHAIR): kelola seleksi dan divisi, scanner, daftar panitia.
 *  - Panitia diterima (peran lain): scanner dan daftar panitia.
 */
export async function getEventAccess(eventId: string) {
  const session = await auth();
  const user = session?.user;
  if (!user) throw new UnauthorizedError();

  const isAdmin = user.role === "SUPER_ADMIN" || user.permissions.includes("event:manage");
  const app = await prisma.committeeApplication.findUnique({
    where: { eventId_userId: { eventId, userId: user.id } },
    select: { status: true, role: true, assignedDivisionId: true },
  });
  const committee = app?.status === "ACCEPTED" ? { role: app.role, divisionId: app.assignedDivisionId } : null;

  return {
    user,
    isAdmin,
    committee,
    canManage: isAdmin || committee?.role === "CHAIR",
    /** Mengatur rapat dan mencatat absensi: pengurus, ketua, atau sekretaris acara. */
    canMeetings: isAdmin || committee?.role === "CHAIR" || committee?.role === "SECRETARY",
    canScan: isAdmin || !!committee,
  };
}

export async function requireEventManager(eventId: string) {
  const a = await getEventAccess(eventId);
  if (!a.canManage) throw new ForbiddenError("Hanya ketua panitia atau pengurus yang boleh melakukan ini.");
  return a;
}

export async function requireMeetingManager(eventId: string) {
  const a = await getEventAccess(eventId);
  if (!a.canMeetings) throw new ForbiddenError("Hanya sekretaris, ketua panitia, atau pengurus yang boleh mengatur rapat.");
  return a;
}

export async function requireEventScanner(eventId: string) {
  const a = await getEventAccess(eventId);
  if (!a.canScan) throw new ForbiddenError("Hanya panitia event ini yang boleh melakukan check-in.");
  return a;
}

/** Divisi event beserta jumlah anggota yang sudah diterima di tiap divisi. */
export async function divisionsWithCounts(eventId: string) {
  const [divisions, accepted] = await Promise.all([
    prisma.committeeDivision.findMany({ where: { eventId }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }),
    prisma.committeeApplication.groupBy({
      by: ["assignedDivisionId"],
      where: { eventId, status: "ACCEPTED" },
      _count: true,
    }),
  ]);
  const counts = new Map(accepted.map((a) => [a.assignedDivisionId, a._count]));
  return divisions.map((d) => ({ ...d, accepted: counts.get(d.id) ?? 0 }));
}
