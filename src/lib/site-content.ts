// Isi statis situs publik. Sumber: AD, ART, GBHO, dan PO ORG 2026.
// Bila isi dokumen berubah (Rapat Anggota), cukup perbarui berkas ini.

import { BRAND } from "@/lib/brand";

export const ORG = {
  name: BRAND.fullName,
  short: BRAND.short,
  univ: BRAND.univ,
  address: BRAND.address,
} as const;

export const NAV = [
  { href: "/struktur", label: "Struktur" },
  { href: "/kegiatan", label: "Kegiatan" },
  { href: "/berita", label: "Berita" },
  { href: "/aspirasi", label: "Aspirasi" },
] as const;

// PO Pasal 14 dan 16
export const DEPARTEMEN = [
  {
    short: "Divisi A",
    name: "Divisi A",
    summary: "Deskripsi singkat divisi A. Ganti di site-content.ts saat menyesuaikan dengan organisasi.",
    tasks: ["Tugas 1 divisi A", "Tugas 2 divisi A"],
  },
  {
    short: "Divisi B",
    name: "Divisi B",
    summary: "Deskripsi singkat divisi B.",
    tasks: ["Tugas 1 divisi B", "Tugas 2 divisi B"],
  },
  {
    short: "Divisi C",
    name: "Divisi C",
    summary: "Deskripsi singkat divisi C.",
    tasks: ["Tugas 1 divisi C"],
  },
  {
    short: "Divisi D",
    name: "Divisi D",
    summary: "Deskripsi singkat divisi D.",
    tasks: ["Tugas 1 divisi D"],
  },
  {
    short: "Divisi E",
    name: "Divisi E",
    summary: "Deskripsi singkat divisi E.",
    tasks: ["Tugas 1 divisi E"],
  },
] as const;

export const BPH_INTI = [
  { role: "Ketua Himpunan", tasks: "Bertanggung jawab atas kepentingan organisasi, ke dalam dan ke luar; mengoordinasikan program kerja; memotivasi dan memantau pengurus dan anggota." },
  { role: "Wakil Ketua Himpunan", tasks: "Mewakili Ketua Himpunan bila berhalangan, dan bertanggung jawab atas koordinasi internal himpunan." },
  { role: "Sekretaris Umum", tasks: "Mengelola administrasi kesekretariatan, menginventarisasi harta benda, mencatat hasil rapat, dan membuat database anggota." },
  { role: "Bendahara Umum", tasks: "Mengelola dan mengalokasikan kas, mengoordinasikan penggalian dana, dan membuat laporan keuangan." },
] as const;

export const BPP = [
  { role: "Ketua Umum", tasks: "Memimpin pengawasan atas kinerja dan keputusan BPH, menjadi penghubung resmi dengan Ketua Himpunan, dan berhak memberi teguran kepada Ketua Himpunan." },
  { role: "Wakil Ketua Umum", tasks: "Mewakili Ketua Umum dalam forum formal dan informal." },
  { role: "Komisi I, Legislatif", tasks: "Menyusun, mengkaji, dan memperbarui regulasi organisasi, serta memastikan AD/ART, peraturan, dan keputusan musyawarah selaras." },
  { role: "Komisi II, Keuangan", tasks: "Mengawasi langsung kegiatan dan program kerja pengurus, dan mengevaluasi laporan kegiatan." },
  { role: "Komisi III, Advokasi dan Aspirasi", tasks: "Menerima dan mengelola aspirasi, keluhan, atau laporan dari mahasiswa dan pengurus, dengan menjaga kerahasiaan identitas pelapor." },
] as const;

// GBHO Pasal 6-8
export const VISI =
  "Terbentuknya pribadi mahasiswa manajemen yang aktif, kreatif, berwawasan kebangsaan, serta mempunyai jiwa pemimpin dan entrepreneurship.";

export const MISI = [
  "Menghimpun dan menyalurkan potensi anggota dalam satu wadah organisasi.",
  "Membina anggota baru dengan mengenalkan dan mengajarkan keorganisasian.",
  "Melaksanakan peningkatan kapasitas dan keterampilan pengurus.",
  "Menumbuhkan kepekaan dan inisiatif anggota terhadap kondisi lingkungan sekitar.",
  "Mengontrol berjalannya sistem pengembangan karakter anggota.",
  "Menyusun program kerja sesuai kebutuhan dan kemampuan mahasiswa manajemen, dan universitas pada umumnya.",
] as const;

export const ASAS = [
  ["Kaderisasi", "Organisasi dijalankan dengan memperhatikan regenerasi kader sebagai garda terdepan visi dan misi organisasi."],
  ["Religius", "Seluruh aktivitas memperhatikan nilai religius dan dapat dipertanggungjawabkan kepada Tuhan Yang Maha Esa."],
  ["Mobilitas", "Organisasi memberi ruang gerak vertikal dan horizontal, sehingga suasananya dialogis dan dinamis."],
  ["Intelektualitas", "Seluruh aktivitas berdasar pada keilmuan yang dapat dipertanggungjawabkan."],
  ["Manfaat", "Kegiatan dan usaha, di dalam maupun di luar fakultas, memberi manfaat sebesar-besarnya bagi pengembangan mahasiswa manajemen."],
  ["Kekeluargaan", "Organisasi adalah usaha bersama yang dijiwai semangat kekeluargaan dan gotong royong."],
  ["Demokrasi", "Kebijakan dan penanganan masalah ditempuh lewat musyawarah untuk mufakat."],
] as const;

// AD Pasal 3
export const LAMBANG_BENTUK = [
  ["Lingkaran dalam", "Satu kesatuan yang tidak berakhir dan tidak akan terpisahkan satu dengan lainnya."],
  ["Lingkaran luar", "Saling membentengi satu sama lain."],
  ["Grafik batang", "Grafik batang naik berjumlah lima, sesuai dengan keterikatan pada Pancasila."],
  ["Panah", "Siap menyongsong masa depan."],
  ["Rantai", "Hubungan manusia yang sering saling membantu."],
  ["Padi", "Kesejahteraan yang menjadi cita-cita keluarga organisasi."],
  ["Dua bintang", "Tujuan mulia yang jelas dan patut dijunjung setinggi bintang di langit, serta menjunjung tinggi ketakwaan kepada Tuhan dan nilai agama sesuai keyakinan."],
] as const;

export const LAMBANG_WARNA = [
  ["Hitam", "Kecerdasan yang amat dalam.", "#000000"],
  ["Putih", "Setiap tindakan selalu diliputi kebaikan.", "#ffffff"],
  ["Abu", "Kedewasaan, ketenangan, dan kebijakan dalam mengambil keputusan.", "#808080"],
  ["Kuning rantai", "Kesejahteraan dan jiwa ekonomi dalam berorganisasi.", "#ffa500"],
] as const;

// Anggota sah setelah menyelesaikan seluruh rangkaian orientasi dan punya sertifikat
export const LANGKAH_ANGGOTA = [
  ["Buat akun", "Isi NPM, nama, email, dan angkatan di halaman daftar."],
  ["Tunggu persetujuan", "Pengurus memeriksa pendaftaranmu, lalu akunmu aktif."],
  ["Ikuti orientasi", "Selesaikan seluruh rangkaian kegiatan orientasi."],
  ["Terima sertifikat", "Sertifikat orientasi menjadi bukti kamu anggota sah."],
] as const;

