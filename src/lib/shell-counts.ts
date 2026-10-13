import { prisma } from "@/lib/prisma";

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
};

type ShellUser = { role: string; permissions: string[] };

export async function getShellCounts(user: ShellUser): Promise<ShellCounts> {
  const can = (perm: string) =>
    user.role === "SUPER_ADMIN" || user.permissions.includes(perm);

  const [members, finance, feedback] = await Promise.all([
    can("member:manage")
      ? prisma.user.count({ where: { approvalStatus: "PENDING" } })
      : 0,
    can("finance:read")
      ? Promise.all([
          prisma.financialTransaction.count({ where: { verifiedBy: null } }),
          prisma.memberDues.count({
            where: { proofUrl: { not: null }, status: { not: "PAID" } },
          }),
        ]).then(([tx, dues]) => tx + dues)
      : 0,
    can("aspirasi:manage")
      ? prisma.feedback.count({ where: { status: "OPEN" } })
      : 0,
  ]);

  // Angka 0 → undefined supaya badge "0" tidak dirender.
  return {
    members: members || undefined,
    finance: finance || undefined,
    feedback: feedback || undefined,
  };
}
