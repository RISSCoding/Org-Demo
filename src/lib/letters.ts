import type { LetterKind, LetterNature, LetterType } from "@prisma/client";
import { TZ } from "@/lib/datetime";
import { approvalSignerText } from "@/lib/approval-meta";
import { EXTERNAL_SLOTS, type OfficerSlot } from "@/lib/officer-meta";
import { toRoman } from "@/lib/security";

export const LETTER_TYPES = ["SURAT_MASUK", "SURAT_KELUAR", "PROPOSAL", "LPJ"] as const satisfies readonly LetterType[];

export const LETTER_LABEL: Record<LetterType, string> = {
  SURAT_MASUK: "Surat Masuk",
  SURAT_KELUAR: "Surat Keluar",
  PROPOSAL: "Proposal",
  LPJ: "LPJ",
};

/** Label for the counterparty field, per type. */
export const PARTY_LABEL: Record<LetterType, string> = {
  SURAT_MASUK: "Pengirim",
  SURAT_KELUAR: "Tujuan",
  PROPOSAL: "Ditujukan kepada",
  LPJ: "Kegiatan / pihak terkait",
};

export const isLetterType = (v: unknown): v is LetterType => LETTER_TYPES.includes(v as LetterType);

/** Incoming mail carries the sender's own number (typed in); the rest are numbered automatically. */
export const isAutoNumbered = (t: LetterType) => t !== "SURAT_MASUK";

// ---------------------------------------------------------------- PO 2026 Pasal 3 ayat 1: jenis surat

export const LETTER_KINDS = [
  "SK", "SP", "SU", "SPM", "SPB", "SPP", "SM", "ST", "SKET", "SR", "SB", "SRT", "SPENG",
] as const satisfies readonly LetterKind[];

export const KIND_LABEL: Record<LetterKind, string> = {
  SK: "Surat Keputusan",
  SP: "Surat Peringatan",
  SU: "Surat Undangan",
  SPM: "Surat Permohonan",
  SPB: "Surat Pemberitahuan",
  SPP: "Surat Peminjaman",
  SM: "Surat Mandat",
  ST: "Surat Tugas",
  SKET: "Surat Keterangan",
  SR: "Surat Rekomendasi",
  SB: "Surat Balasan",
  SRT: "Sertifikat",
  SPENG: "Surat Pengantar",
};

/** Singkatan seperti tertulis di PO; dipakai pada nomor surat. */
export const KIND_CODE: Record<LetterKind, string> = {
  SK: "SK", SP: "SP", SU: "SU", SPM: "SPm", SPB: "SPb", SPP: "SPp", SM: "SM",
  ST: "ST", SKET: "Sket", SR: "SR", SB: "SB", SRT: "SRT", SPENG: "Speng",
};

export const isLetterKind = (v: unknown): v is LetterKind => LETTER_KINDS.includes(v as LetterKind);

// ---------------------------------------------------------------- PO Pasal 3 ayat 9-10: penandatangan

export const LETTER_NATURES = ["KEBIJAKAN", "TEKNIS_KEGIATAN", "RUTIN"] as const satisfies readonly LetterNature[];

export const NATURE_LABEL: Record<LetterNature, string> = {
  KEBIJAKAN: "Kebijaksanaan organisasi",
  TEKNIS_KEGIATAN: "Teknis pelaksanaan kegiatan",
  RUTIN: "Teknis administrasi / rutin",
};

export const NATURE_SIGNERS: Record<LetterNature, string> = {
  KEBIJAKAN: "Ketua dan Sekretaris Umum",
  TEKNIS_KEGIATAN: "Sekretaris Kegiatan dan Ketua Himpunan",
  RUTIN: "Ketua Himpunan dan Sekretaris",
};


export const isLetterNature = (v: unknown): v is LetterNature => LETTER_NATURES.includes(v as LetterNature);

/** Pengurus inti yang menandatangani tiap sifat surat. Sekretaris kegiatan, pihak prodi, dekan, dan WR III bukan bagian dari data pengurus. */
const NATURE_SIGNER_POSITIONS: Record<LetterNature, readonly OfficerSlot[]> = {
  KEBIJAKAN: ["CHAIR", "SECRETARY"],
  TEKNIS_KEGIATAN: ["CHAIR"],
  RUTIN: ["CHAIR", "SECRETARY"],
};

export function signerOfficersFor(
  type: LetterType,
  nature: LetterNature | null | undefined,
  campusFunds = false,
): readonly OfficerSlot[] {
  // Proposal/LPJ dengan dana kampus: Ketua Himpunan ditambah Ketua Prodi, Dekan, dan WR III.
  if (type === "PROPOSAL" || type === "LPJ") return campusFunds ? ["CHAIR", ...EXTERNAL_SLOTS] : ["CHAIR"];
  if (type === "SURAT_KELUAR" && nature) return NATURE_SIGNER_POSITIONS[nature];
  return [];
}

export function signersFor(type: LetterType, nature: LetterNature | null | undefined, campusFunds = false) {
  if (type === "PROPOSAL" || type === "LPJ") return approvalSignerText(type, campusFunds);
  if (type === "SURAT_KELUAR" && nature) return NATURE_SIGNERS[nature];
  return null;
}

// ---------------------------------------------------------------- penomoran (PO Pasal 3 ayat 5)

/** Kode jenis surat pada nomor: kode PO untuk surat keluar; Proposal dan LPJ memakai PROP / LPJ. */
export function numberCode(type: LetterType, kind: LetterKind | null | undefined) {
  if (type === "PROPOSAL") return "PROP";
  if (type === "LPJ") return "LPJ";
  if (type === "SURAT_KELUAR" && kind) return KIND_CODE[kind];
  return null;
}

/** Singkatan kegiatan untuk nomor surat: huruf besar, angka, spasi, strip; "/" tidak boleh (pemisah). */
export const normalizeActivity = (s: string | undefined) =>
  (s ?? "").toUpperCase().replace(/[^A-Z0-9 -]/g, " ").trim().replace(/\s+/g, "-").slice(0, 40) || undefined;

/** Year + month (1-12) in WIB, regardless of the server's timezone. */
export function wibYearMonth(d = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "numeric" }).formatToParts(d);
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  return { year: get("year"), month: get("month") };
}

/**
 * No Surat / Jenis Surat / Nama Kegiatan / Nama Organisasi / Bulan / Tahun
 * e.g. 004/SU/MONDAY/HIMMAN/X/2026 — nama kegiatan dilewati bila kosong.
 * Urutan berjalan per (tahun, jenis dokumen), bukan per kode surat.
 */
export function formatLetterNumber(code: string, seq: number, activity: string | undefined, year: number, month: number) {
  const parts = [String(seq).padStart(3, "0"), code, ...(activity ? [activity] : []), "HIMMAN", toRoman(month), String(year)];
  return parts.join("/");
}
