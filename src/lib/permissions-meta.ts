// Client-safe metadata (no server imports).
export const ROLE_OPTIONS = [
  { value: "SUPER_ADMIN", label: "Super Admin (Ketua / MedFo)" },
  { value: "ADMIN_EXECUTIVE", label: "Pengurus (Sekretaris Umum / Bendahara Umum / Kepala Departemen)" },
  { value: "MEMBER", label: "Anggota" },
  { value: "ALUMNI", label: "Alumni" },
] as const;

export const PERMISSION_OPTIONS = [
  { code: "member:manage", label: "Anggota — setujui & kelola" },
  { code: "event:manage", label: "Event — kelola & scanner check-in" },
  { code: "finance:read", label: "Keuangan — lihat" },
  { code: "finance:write", label: "Keuangan — input & verifikasi" },
  { code: "secretariat:manage", label: "Sekretariat — kelola surat" },
  { code: "cms:write", label: "CMS — tulis & terbitkan" },
  { code: "aspirasi:manage", label: "Kotak Aspirasi — kelola pesan (BPP Komisi III)" },
] as const;

export const MEMBER_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Aktif" },
  { value: "INACTIVE", label: "Nonaktif" },
  { value: "ALUMNI", label: "Alumni" },
] as const;

export const APPROVAL_OPTIONS = [
  { value: "APPROVED", label: "Disetujui (bisa login)" },
  { value: "PENDING", label: "Menunggu persetujuan" },
  { value: "REJECTED", label: "Ditolak (tidak bisa login)" },
] as const;

export const roleLabel = (v: string) => ROLE_OPTIONS.find((r) => r.value === v)?.label.split(" (")[0] ?? v;
