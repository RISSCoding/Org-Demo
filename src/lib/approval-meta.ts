import type { LetterType } from "@prisma/client";

// Metadata lembar pengesahan yang aman dipakai di komponen klien (tanpa impor server).

/**
 * Penandatangan proposal/LPJ menurut PO, berurutan seperti tertulis di sana.
 *  - EVENT_CHAIR / EVENT_SECRETARY: ketua pelaksana dan sekretaris kegiatan, diambil dari panitia event.
 *  - sisanya: jabatan pada tabel pengurus (Ketua Himpunan, lalu pihak kampus).
 */
export type ApprovalKey = "EVENT_CHAIR" | "EVENT_SECRETARY" | "CHAIR" | "PRODI_HEAD" | "DEAN" | "VICE_RECTOR_3";

export const APPROVAL_LABEL: Record<ApprovalKey, string> = {
  EVENT_CHAIR: "Ketua Pelaksana",
  EVENT_SECRETARY: "Sekretaris Kegiatan",
  CHAIR: "Ketua Himpunan",
  PRODI_HEAD: "Ketua Program Studi",
  DEAN: "Dekan Fakultas",
  VICE_RECTOR_3: "Wakil Rektor III Bidang Kemahasiswaan dan Alumni",
};

export const APPROVAL_DOC_LABEL = {
  PROPOSAL: "Proposal Kegiatan",
  LPJ: "Laporan Pertanggungjawaban (LPJ)",
} as const;

const INTERNAL: readonly ApprovalKey[] = ["EVENT_CHAIR", "EVENT_SECRETARY", "CHAIR"];
const CAMPUS: readonly ApprovalKey[] = ["PRODI_HEAD", "DEAN", "VICE_RECTOR_3"];

export const isApprovalDoc = (type: LetterType): type is "PROPOSAL" | "LPJ" => type === "PROPOSAL" || type === "LPJ";

/**
 * Siapa yang menandatangani. Proposal/LPJ yang menyangkut dana kampus ditandatangani keenamnya;
 * selain itu cukup tiga pihak dari kepanitiaan dan himpunan. Dokumen lain tidak punya lembar pengesahan.
 */
export function approvalKeysFor(type: LetterType, campusFunds: boolean): readonly ApprovalKey[] {
  if (!isApprovalDoc(type)) return [];
  return campusFunds ? [...INTERNAL, ...CAMPUS] : INTERNAL;
}

/** "A, B, dan C" */
export function listIndonesian(items: readonly string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")}, dan ${items[items.length - 1]}`;
}

export const approvalSignerText = (type: LetterType, campusFunds: boolean) =>
  listIndonesian(approvalKeysFor(type, campusFunds).map((k) => APPROVAL_LABEL[k]));

/** Dua per baris untuk lembar pengesahan; baris terakhir boleh berisi satu. */
export function inRows<T>(items: readonly T[], perRow = 2): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += perRow) rows.push(items.slice(i, i + perRow));
  return rows;
}
