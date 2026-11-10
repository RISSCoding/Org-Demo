import { prisma } from "@/lib/prisma";
import { getTenantPrisma } from "@/lib/prisma-tenant";

/**
 * Angka badge untuk sidebar admin: berapa banyak item yang menunggu tindakan.
 * Dipanggil dari layout admin pada setiap navigasi. Untuk skala himpunan
 * (ratusan baris), count ini cepat (< 10ms). Kalau nanti besar, tambahkan
 * unstable_cache dengan key per-user di sini.
 */
export type ShellCounts = {
  members?: number;
  finance?: number;
  feedback?: number;
  /** Notifikasi belum dibaca milik user sendiri (untuk badge sidebar). */
  notifications?: number;
};

type ShellUser = { id: string; role: string; permissions: string[]; organizationId: string | null };

export async function getShellCounts(user: ShellUser): Promise<ShellCounts> {
  const can = (perm: string) =>
    user.role === "SUPER_ADMIN" || user.permissions.includes(perm);

  // Wajib pakai klien tenant: angka antrean adalah milik organisasi user ini, bukan
  // agregat lintas tenant. Super Admin platform (organizationId = null) tetap melihat semua.
  const tenantPrisma = user.organizationId ? getTenantPrisma(user.organizationId) : prisma;

  const [members, finance, feedback, notifications] = await Promise.all([
    can("member:manage")
      ? tenantPrisma.user.count({ where: { approvalStatus: "PENDING" } })
      : 0,
    can("finance:read")
      ? Promise.all([
          tenantPrisma.financialTransaction.count({ where: { verifiedBy: null } }),
          tenantPrisma.memberDues.count({
            where: { proofUrl: { not: null }, status: { not: "PAID" } },
          }),
        ]).then(([tx, dues]) => tx + dues)
      : 0,
    can("aspirasi:manage")
      ? tenantPrisma.feedback.count({ where: { status: "OPEN" } })
      : 0,
    // Notifikasi belum dibaca user sendiri. Berbeda dari yang lain:
    // ini per-user, bukan agregat antrean.
    tenantPrisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);

  // Angka 0 → undefined supaya badge "0" tidak dirender.
  return {
    members: members || undefined,
    finance: finance || undefined,
    feedback: feedback || undefined,
    notifications: notifications || undefined,
  };
}
