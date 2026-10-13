// Metadata kepanitiaan yang aman dipakai di komponen klien (tanpa impor server).
export const COMMITTEE_ROLES = [
  { value: "CHAIR", label: "Ketua panitia", hint: "Bisa menyeleksi pendaftar dan mengelola divisi." },
  { value: "SECRETARY", label: "Sekretaris", hint: "Mengatur rapat dan absensi panitia." },
  { value: "TREASURER", label: "Bendahara", hint: "Penanda peran; belum ada hak khusus." },
  { value: "COORDINATOR", label: "Koordinator divisi", hint: "Penanda peran; belum ada hak khusus." },
  { value: "MEMBER", label: "Anggota panitia", hint: "" },
] as const;

export const COMMITTEE_STATUS = {
  PENDING: { label: "Menunggu seleksi", tone: "warn" },
  ACCEPTED: { label: "Diterima", tone: "ok" },
  WAITLIST: { label: "Cadangan", tone: "muted" },
  REJECTED: { label: "Belum diterima", tone: "bad" },
  WITHDRAWN: { label: "Mengundurkan diri", tone: "muted" },
} as const;

export type CommitteeStatusKey = keyof typeof COMMITTEE_STATUS;
export const roleLabel = (v: string) => COMMITTEE_ROLES.find((r) => r.value === v)?.label ?? v;

export type DivisionOption = { id: number; name: string; quota: number | null; accepted: number };
export const slotsLeft = (d: DivisionOption) => (d.quota === null ? null : Math.max(0, d.quota - d.accepted));

/** Judul yang tercetak di sertifikat panitia, dibekukan saat penerbitan. */
export function certificateTitle(role: string, division?: string | null) {
  const d = division ? division.trim() : "";
  switch (role) {
    case "CHAIR": return "Ketua Panitia";
    case "SECRETARY": return "Sekretaris Panitia";
    case "TREASURER": return "Bendahara Panitia";
    case "COORDINATOR": return d ? `Koordinator Divisi ${d}` : "Koordinator Divisi";
    default: return d ? `Anggota Panitia Divisi ${d}` : "Anggota Panitia";
  }
}
