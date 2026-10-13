// Isi statis situs publik. Sumber: AD, ART, GBHO, dan PO HIMMAN UKRI 2026.
// Bila isi dokumen berubah (MUBES/MUSLUB), cukup perbarui berkas ini.

export const ORG = {
  name: "Himpunan Mahasiswa Manajemen",
  short: "HIMMAN UKRI",
  univ: "Universitas Kebangsaan Republik Indonesia",
  address: "Jl. Terusan Halimun No. 37, Kel. Lingkar Selatan, Kec. Lengkong, Kota Bandung",
} as const;

export const NAV = [
  { href: "/tentang", label: "Tentang" },
  { href: "/struktur", label: "Struktur" },
  { href: "/kegiatan", label: "Kegiatan" },
  { href: "/berita", label: "Berita" },
  { href: "/dokumen", label: "Dokumen" },
  { href: "/aspirasi", label: "Aspirasi" },
] as const;

// PO Pasal 14 dan 16
export const DEPARTEMEN = [
  {
    short: "Humas",
    name: "Hubungan Masyarakat",
    summary: "Menyampaikan informasi internal ke seluruh mahasiswa dan civitas prodi, dan mewakili himpunan dalam komunikasi resmi.",
    tasks: [
      "Menerima, mendampingi, dan menyampaikan informasi internal secara tepat dan akurat",
      "Menjadi wakil organisasi dalam komunikasi dan kegiatan resmi, ke dalam maupun ke luar",
    ],
  },
  {
    short: "MedFo",
    name: "Media dan Informasi",
    summary: "Mengawal dan menyebarkan informasi di media sosial, serta mengelola semua konten yang dipublikasikan himpunan.",
    tasks: [
      "Mengawal dan menyebarkan informasi di media sosial",
      "Berkoordinasi dengan departemen lain agar konten sesuai dengan acara",
      "Mengelola proses editing dan informasi yang dipublikasikan",
      "Menerima bahan materi paling lambat 4 hari sebelum konten diterbitkan",
    ],
  },
  {
    short: "PSDMO",
    name: "Pengembangan Sumber Daya Manusia dan Organisasi",
    summary: "Mengurus kaderisasi, serta menggali dan menyalurkan minat bakat anggota.",
    tasks: [
      "Mengurus pengkaderisasian",
      "Menggali, mengembangkan, dan menyalurkan minat bakat anggota",
    ],
  },
  {
    short: "Pendidikan",
    name: "Pendidikan",
    summary: "Menyediakan pengetahuan yang relevan, program pengembangan intelektual, dan ruang diskusi.",
    tasks: [
      "Menyediakan dan memberikan informasi pengetahuan yang relevan bagi mahasiswa manajemen",
      "Merancang, mengelola, dan melaksanakan program pengembangan intelektual",
      "Menyediakan ruang diskusi bagi mahasiswa manajemen",
    ],
  },
  {
    short: "Kewirausahaan",
    name: "Kewirausahaan",
    summary: "Menjalankan dan mengembangkan kegiatan usaha himpunan, dan melaporkan hasilnya ke Bendahara Umum.",
    tasks: [
      "Melakukan dan mengembangkan kegiatan usaha",
      "Membuat laporan hasil usaha kepada Bendahara Umum",
    ],
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
  "Menghimpun dan menyalurkan potensi mahasiswa manajemen dalam satu wadah organisasi HIMMAN.",
  "Membina anggota, terutama mahasiswa baru, dengan mengenalkan dan mengajarkan keorganisasian di HIMMAN.",
  "Melaksanakan upgrading dan skill pengurus HIMMAN.",
  "Menumbuhkan kepekaan dan inisiatif anggota terhadap kondisi lingkungan sekitar.",
  "Mengontrol berjalannya sistem pengembangan karakter anggota.",
  "Menyusun program kerja sesuai kebutuhan dan kemampuan mahasiswa manajemen, dan universitas pada umumnya.",
] as const;

export const ASAS = [
  ["Kaderisasi", "Organisasi dijalankan dengan memperhatikan regenerasi kader sebagai garda terdepan visi dan misi HIMMAN."],
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
  ["Padi", "Kesejahteraan yang menjadi cita-cita keluarga HIMMAN."],
  ["Dua bintang", "Tujuan mulia yang jelas dan patut dijunjung setinggi bintang di langit, serta menjunjung tinggi ketakwaan kepada Tuhan dan nilai agama sesuai keyakinan."],
] as const;

export const LAMBANG_WARNA = [
  ["Hitam", "Kecerdasan yang amat dalam.", "#000000"],
  ["Putih", "Setiap tindakan selalu diliputi kebaikan.", "#ffffff"],
  ["Abu", "Kedewasaan, ketenangan, dan kebijakan dalam mengambil keputusan.", "#808080"],
  ["Kuning rantai", "Kesejahteraan dan jiwa ekonomi dalam berorganisasi.", "#ffa500"],
] as const;

// ART Pasal 1: anggota sah setelah menyelesaikan seluruh rangkaian MONDAY dan punya sertifikat
export const LANGKAH_ANGGOTA = [
  ["Buat akun", "Isi NPM, nama, email, dan angkatan di halaman daftar."],
  ["Tunggu persetujuan", "Pengurus memeriksa pendaftaranmu, lalu akunmu aktif."],
  ["Ikuti MONDAY", "Selesaikan seluruh rangkaian kegiatan MONDAY."],
  ["Terima sertifikat", "Sertifikat MONDAY menjadi bukti kamu anggota sah HIMMAN."],
] as const;

export const DOKUMEN = [
  {
    file: "/dokumen/AD_ART2026.pdf",
    title: "Anggaran Dasar dan Anggaran Rumah Tangga",
    desc: "Identitas, lambang, asas, keanggotaan, kepengurusan, permusyawaratan, keuangan, serta hak dan kewajiban anggota.",
    nomor: "Nomor 01/KS/MUBES VI/HIMMAN/II/2026 (AD) dan 02/KS/MUBES VI/HIMMAN/II/2026 (ART)",
    ditetapkan: "14 Februari 2026",
    ukuran: "360 KB",
  },
  {
    file: "/dokumen/GBHO2026.pdf",
    title: "Garis Besar Haluan Organisasi (GBHO)",
    desc: "Arah penyelenggaraan organisasi: kondisi umum, visi, misi, asas aktivitas, dan kaidah pelaksanaan.",
    nomor: "Nomor 03/KS/MUBES VI/HIMMAN/II/2026",
    ditetapkan: "14 Februari 2026",
    ukuran: "42 KB",
  },
  {
    file: "/dokumen/PO2026.pdf",
    title: "Peraturan Organisasi (PO)",
    desc: "Penggunaan atribut, tata surat, MUBES dan MUSLUB, syarat dan pemilihan Ketua, serta tugas dan wewenang pengurus.",
    nomor: "Nomor 04/KS/MUBES VI/HIMMAN/II/2026",
    ditetapkan: "15 Februari 2026",
    ukuran: "203 KB",
  },
] as const;
