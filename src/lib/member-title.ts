import type { DivisionRole, OfficerPosition } from "@prisma/client";
import { OFFICER_LABEL } from "./officer-meta";

/**
 * Teks jabatan yang tampil di KTA dan halaman verifikasi anggota.
 *
 * Prioritas:
 * 1. Pemegang jabatan pengurus inti / penandatangan eksternal (punya akun) → label jabatannya
 *    ("Ketua Himpunan", "Sekretaris Umum", dst). Ini yang dimaksud "ring 1".
 * 2. Anggota divisi → "<Jabatan Divisi> <Nama Divisi>", mis. "Kepala Departemen Humas".
 * 3. Tanpa divisi → "Anggota".
 *
 * Pemegang jabatan TANPA akun (mis. Dekan dari pihak kampus) tidak punya KTA, jadi tidak pernah
 * masuk ke sini.
 */
const DIVISION_ROLE_LABEL: Record<DivisionRole, string> = {
  STAFF: "Staf",
  DEPT_SECRETARY: "Sekretaris Departemen",
  DEPT_HEAD: "Kepala Departemen",
};

export function memberTitle(opts: {
  officerPosition?: OfficerPosition | null;
  divisionName?: string | null;
  divisionRole?: DivisionRole | null;
}): string {
  const { officerPosition, divisionName, divisionRole } = opts;

  if (officerPosition) return OFFICER_LABEL[officerPosition];

  if (divisionName) {
    const prefix = divisionRole ? DIVISION_ROLE_LABEL[divisionRole] : "Staf";
    return `${prefix} ${divisionName}`;
  }
  return "Anggota";
}

/** Label jabatan divisi untuk dropdown dan badge. */
export function divisionRoleLabel(role: DivisionRole): string {
  return DIVISION_ROLE_LABEL[role];
}

/** Urutan tampilan di dropdown: Ketua dulu, lalu Sekretaris, lalu Staf. */
export const DIVISION_ROLE_OPTIONS: readonly DivisionRole[] = [
  "DEPT_HEAD",
  "DEPT_SECRETARY",
  "STAFF",
] as const;
