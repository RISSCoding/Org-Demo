import type { OfficerPosition } from "@prisma/client";

/**
 * Izin yang OTOMATIS diberikan saat seseorang menjabat posisi tertentu.
 * Hanya berlaku untuk pemegang jabatan yang PUNYA AKUN (OrgOfficer.userId terisi).
 *
 * Pemegang tanpa akun (mis. Dekan, WR III sebagai penandatangan eksternal) tidak
 * mendapat izin apa pun karena tidak ada user yang bisa diberi izin.
 *
 * Izin ini digabung dengan izin dari role dan UserPermission saat login. Kalau
 * jabatan dicabut, izin ini hilang di login berikutnya.
 */
export const OFFICER_PERMISSIONS: Record<OfficerPosition, readonly string[]> = {
  // Ring 1: akses penuh.
  CHAIR: [
    "cms:write",
    "finance:read",
    "finance:write",
    "event:manage",
    "secretariat:manage",
    "member:manage",
    "aspirasi:manage",
  ],
  VICE_CHAIR: [
    "cms:write",
    "finance:read",
    "finance:write",
    "event:manage",
    "secretariat:manage",
    "member:manage",
    "aspirasi:manage",
  ],
  // Sekretaris Umum: surat-menyurat, proposal/LPJ, administrasi anggota, pengumuman.
  // Tidak termasuk finance:write (itu domain bendahara).
  SECRETARY: ["secretariat:manage", "event:manage", "cms:write", "member:manage"],
  // Bendahara Umum: kas, iuran, laporan keuangan. Tidak termasuk member:manage.
  TREASURER: ["finance:read", "finance:write"],
  // Dewan Pembina dan penandatangan eksternal: tidak menjalankan operasional.
  ADVISOR: [],
  PRODI_HEAD: [],
  DEAN: [],
  VICE_RECTOR_3: [],
};

/** Gabungan izin dari semua jabatan yang dipegang user (bisa lebih dari satu). */
export function permissionsForPositions(positions: readonly OfficerPosition[]): string[] {
  const set = new Set<string>();
  for (const p of positions) {
    for (const code of OFFICER_PERMISSIONS[p] ?? []) set.add(code);
  }
  return [...set];
}
