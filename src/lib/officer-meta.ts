import type { OfficerPosition } from "@prisma/client";

/** Pengurus inti himpunan: satu pemegang per jabatan. */
export const INTERNAL_SLOTS = ["CHAIR", "VICE_CHAIR", "SECRETARY", "TREASURER"] as const satisfies readonly OfficerPosition[];

/** Penandatangan dari pihak kampus (proposal/LPJ yang menyangkut dana kampus): satu pemegang per jabatan, biasanya tanpa akun. */
export const EXTERNAL_SLOTS = ["PRODI_HEAD", "DEAN", "VICE_RECTOR_3"] as const satisfies readonly OfficerPosition[];

/** Jabatan yang dipegang satu orang. Dewan Pembina (ADVISOR) boleh lebih dari satu, jadi tidak termasuk. */
export const OFFICER_SLOTS = [...INTERNAL_SLOTS, ...EXTERNAL_SLOTS] as const satisfies readonly OfficerPosition[];
export type OfficerSlot = (typeof OFFICER_SLOTS)[number];

export const OFFICER_LABEL: Record<OfficerPosition, string> = {
  CHAIR: "Ketua Himpunan",
  VICE_CHAIR: "Wakil Ketua Himpunan",
  SECRETARY: "Sekretaris Umum",
  TREASURER: "Bendahara Umum",
  ADVISOR: "Dewan Pembina",
  PRODI_HEAD: "Ketua Program Studi",
  DEAN: "Dekan Fakultas",
  VICE_RECTOR_3: "Wakil Rektor III (Kemahasiswaan dan Alumni)",
};

export const isOfficerSlot = (v: unknown): v is OfficerSlot => OFFICER_SLOTS.includes(v as OfficerSlot);
export const isExternalSlot = (v: unknown): boolean => EXTERNAL_SLOTS.includes(v as (typeof EXTERNAL_SLOTS)[number]);

/**
 * Tanda tangan pemegang jabatan. Pemegang yang punya akun memakai tanda tangan akunnya (diunggah sendiri);
 * pemegang tanpa akun memakai tanda tangan yang diunggah pengurus pada barisnya.
 */
export function holderSignatureUrl(r: {
  userId: string | null;
  user: { signatureUrl: string | null } | null;
  signatureUrl: string | null;
}): string | null {
  return r.userId ? (r.user?.signatureUrl ?? null) : (r.signatureUrl ?? null);
}
