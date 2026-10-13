/**
 * Sumber tunggal identitas brand.
 * Ganti profil lewat `BRAND_PROFILE` di .env:
 *   BRAND_PROFILE=personal   → Portal Organisasi (default, untuk demo/personal)
 *   BRAND_PROFILE=himman     → ORG (untuk deploy ke domain organisasi)
 *
 * Tidak ada teks brand yang boleh ditulis langsung di komponen — selalu ambil dari sini.
 */

const PROFILES = {
  personal: {
    name: "Portal Organisasi",
    short: "ORG",
    fullName: "Portal Organisasi",
    univ: "Universitas Antah Berantah Republik Wakanda",
    univShort: "UABRW",
    address: "Jl. Contoh No. 1, Kota Contoh",
    domain: "faris.example.com",
    email: "admin@portal.local",
    logoInitials: "PO",
    // Label untuk berbagai konteks
    membersLabel: "Anggota",
    financeLabel: "Kas",
    // Nama yang muncul di sertifikat/laporan kalau env CERT_SIGNER_NAME kosong
    defaultSignerName: "Pimpinan Organisasi",
    defaultSignerTitle: "Pimpinan ORG",
  },
  himman: {
    name: "Portal Organisasi",
    short: "ORG",
    fullName: "Portal Organisasi Universitas Antah Berantah Republik Wakanda",
    univ: "Universitas Antah Berantah Republik Wakanda",
    univShort: "UKRI",
    address: "Jl. Terusan Halimun No. 37, Kel. Lingkar Selatan, Kec. Lengkong, Kota Bandung",
    domain: "portal-organisasi.example.com",
    email: "admin@himman.local",
    logoInitials: "HM",
    membersLabel: "Anggota",
    financeLabel: "Iuran Kas",
    defaultSignerName: "Ketua Umum",
    defaultSignerTitle: "Ketua ORG",
  },
} as const;

export type BrandProfile = keyof typeof PROFILES;

const active = (process.env.BRAND_PROFILE ?? "personal") as BrandProfile;
if (!(active in PROFILES)) {
  throw new Error(`BRAND_PROFILE tidak dikenal: ${active}. Pilih 'personal' atau 'himman'.`);
}

export const BRAND = PROFILES[active];
export const BRAND_PROFILE = active;

/** Nama halaman browser: "Halaman — ORG" */
export const pageTitle = (page?: string) => (page ? `${page} — ${BRAND.short}` : BRAND.short);
