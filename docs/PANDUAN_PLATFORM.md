# Tentang Platform Organisasi

Platform ini adalah perangkat lunak manajemen organisasi berbasis ***open-source*** (FOSS) yang dirancang untuk skala universal. Dapat dipakai oleh himpunan mahasiswa, komunitas hobi, LSM, unit kegiatan kampus, hingga organisasi profesi.

> Status fitur: ✅ tersedia · 🚧 dalam pengembangan · 📋 direncanakan.
> Dokumen ini menjelaskan **visi dan kebijakan platform**. Detail teknis ada di [ARSITEKTUR_MULTI_TENANT.md](./ARSITEKTUR_MULTI_TENANT.md).

---

## Daftar Isi
1. [Apa yang Bisa Dilakukan Platform Ini](#1-apa-yang-bisa-dilakukan-platform-ini)
2. [Dua Cara Menggunakan: Cloud atau Self-Hosted](#2-dua-cara-menggunakan-cloud-atau-self-hosted)
3. [Arsitektur Multi-Tenant (Isolasi Data)](#3-arsitektur-multi-tenant-isolasi-data)
4. [Pendaftaran Organisasi Baru](#4-pendaftaran-organisasi-baru)
5. [Kustomisasi Mandiri](#5-kustomisasi-mandiri)
6. [Privasi dan Kedaulatan Data](#6-privasi-dan-kedaulatan-data)
7. [Paket, Kuota, dan Batas Wajar](#7-paket-kuota-dan-batas-wajar)
8. [Lisensi dan Kontribusi](#8-lisensi-dan-kontribusi)
9. [Peta Jalan (Roadmap)](#9-peta-jalan-roadmap)

---

## 1. Apa yang Bisa Dilakukan Platform Ini

| Modul | Fungsi |
|---|---|
| Keanggotaan | Pendaftaran, persetujuan, impor Excel, KTA digital ber-QR |
| Struktur | Jabatan inti, divisi/departemen, peran di dalam divisi |
| Kegiatan | Event, tiket QR, kepanitiaan, absensi, sertifikat massal |
| Keuangan | Iuran kas, pembukuan *double-entry*, laporan (Neraca, Laba Rugi, Jurnal), transparansi kas |
| Sekretariat | Arsip surat otomatis bernomor, proposal/LPJ, lembar pengesahan digital |
| Aspirasi | Kotak saran dua arah, opsi anonim, pelacakan dengan kode |
| Keamanan & audit | Audit log, pembatasan laju (*rate limiting*), file privat |

## 2. Dua Cara Menggunakan: Cloud atau Self-Hosted

| | **Cloud (SaaS)** 📋 | **Self-Hosted** ✅ |
|---|---|---|
| Siapa yang mengelola server | Penyedia platform | Organisasi sendiri |
| Alamat | `nama-organisasi.domain-utama.com` (atau domain sendiri) | Domain milik sendiri |
| Biaya | Gratis/berbayar sesuai paket | Biaya server saja |
| Pembaruan | Otomatis | Manual (lihat [MAINTENANCE.md](./MAINTENANCE.md)) |
| Cocok untuk | Organisasi yang ingin langsung pakai | Organisasi dengan kebutuhan kontrol penuh / kepatuhan data |

Kode sumber yang sama dipakai untuk keduanya. Tidak ada fitur inti yang "dikunci" hanya untuk versi cloud. *(Kebijakan ini perlu Anda tegaskan sebagai pemilik proyek; lihat bagian 7.)*

## 3. Arsitektur Multi-Tenant (Isolasi Data)

Platform menganut prinsip **multi-tenant**: satu instalasi server dapat melayani banyak organisasi (*tenant*) sekaligus.

- **Isolasi total**: data keuangan, anggota, kegiatan, surat, dan arsip Organisasi A tidak dapat diakses atau tercampur dengan Organisasi B, baik lewat antarmuka, API, maupun berkas unggahan.
- **Ruang kerja sendiri**: setiap organisasi mendapat subdomain (contoh: `nama-organisasi.domain-utama.com`).
- **Identitas terpisah per tenant**: peran, divisi, nominal iuran, dan pengaturan dikelola per organisasi.
- **Lapisan pengaman berlapis**: isolasi diterapkan di lapisan aplikasi dan dirancang diperkuat di lapisan database 📋 (lihat dokumen arsitektur).

Apa artinya bagi Anda sebagai pengurus: Anda **tidak bisa** (dan tidak akan) melihat data organisasi lain, dan sebaliknya.

## 4. Pendaftaran Organisasi Baru

*Status: 🚧 dalam pengembangan.*

1. Buka halaman utama dan pilih **Daftar Organisasi**.
2. Isi nama resmi organisasi, alamat email penanggung jawab, dan pilih **subdomain** (huruf kecil, angka, tanda hubung; 3–30 karakter; sebagian nama dicadangkan, mis. `www`, `app`, `admin`, `api`).
3. Verifikasi email.
4. Pendiri otomatis menjadi **Super Admin organisasi** (administrator tertinggi di tenant tersebut).
5. Lakukan kustomisasi awal: unggah logo, atur struktur, tetapkan iuran.
6. Undang pengurus lain atau impor anggota via Excel.

> **Super Admin organisasi** berbeda dengan **Super Admin platform**. Yang pertama mengelola satu organisasi; yang kedua mengelola seluruh platform (lihat [PANDUAN_SUPER_ADMIN.md](./PANDUAN_SUPER_ADMIN.md)).

## 5. Kustomisasi Mandiri

Setiap admin organisasi mengendalikan ruang lingkupnya sendiri:

- **Identitas visual**: logo, nama organisasi, dan warna aksen 📋.
- **Struktur**: nama divisi disesuaikan dengan AD/ART masing-masing (mis. Departemen Humas, Divisi Media).
- **Kebijakan**: nominal iuran dan alur administrasi.
- **Istilah**: label seperti "Anggota/Mahasiswa" atau "Pengurus/Panitia" dapat disesuaikan 📋.

## 6. Privasi dan Kedaulatan Data

- **Self-hosted**: karena bersifat *open-source*, organisasi dapat menjalankan platform di server sendiri dan memegang seluruh datanya.
- **Ekspor data** 📋: admin organisasi dapat mengunduh seluruh datanya (anggota, transaksi, surat, dll.) dalam format terbuka (CSV/JSON + berkas) kapan saja, tanpa menunggu persetujuan penyedia.
- **Penghapusan data** 📋: bila organisasi berhenti memakai layanan cloud, datanya dihapus permanen setelah masa tenggang yang jelas (mis. 30 hari) dan setelah ekspor tersedia.
- **Tidak ada monetisasi data**: data organisasi tidak dijual, tidak dipakai untuk iklan, dan tidak dibagikan ke pihak ketiga, kecuali penyedia layanan teknis yang diperlukan untuk operasional (mis. pengirim email) dan diungkapkan secara terbuka.
- **Data pribadi**: platform memuat data pribadi anggota (nama, NIM, kontak, data iuran). Penyelenggara layanan cloud perlu menyediakan Kebijakan Privasi dan memperhatikan **UU Pelindungan Data Pribadi (UU PDP)** yang berlaku di Indonesia. Dokumen ini bukan nasihat hukum; konsultasikan dengan ahli hukum.

## 7. Paket, Kuota, dan Batas Wajar

*Status: 📋 direncanakan.*

Bagian ini adalah **kerangka keputusan** untuk pemilik proyek. Isi sesuai model bisnis yang dipilih.

| Hal yang perlu diputuskan | Pilihan umum |
|---|---|
| Model harga | Gratis selamanya untuk organisasi kecil + paket berbayar; atau donasi/sponsor |
| Batas per tenant | Jumlah anggota aktif, ruang penyimpanan, jumlah event/bulan, kuota email |
| Fitur berbeda per paket | Domain kustom, branding penuh, dukungan prioritas, audit log lebih panjang |
| Batas wajar (*fair use*) | Pembatasan unggahan, pembatasan laju API |
| Penangguhan | Alasan dan prosedur *suspend* tenant (spam, pelanggaran, tunggakan) |

Saran: tetapkan sejak awal bahwa **data selalu dapat diekspor** meskipun tenant ditangguhkan atau turun paket.

## 8. Lisensi dan Kontribusi

- **Lisensi**: *[belum ditetapkan, isi setelah memilih]*. Lihat berkas `LICENSE`.
  - **MIT / Apache-2.0**: sangat longgar; siapa pun boleh menjalankan versi modifikasi sebagai layanan tertutup.
  - **AGPL-3.0**: pengguna yang menjalankan versi modifikasi sebagai layanan jaringan wajib membuka kode modifikasinya; umum dipakai proyek FOSS yang juga berbentuk SaaS agar pihak lain tidak membuat layanan tertutup dari kode Anda.
  - Pilihan lisensi berdampak hukum dan bisnis. Pertimbangkan dengan matang, dan konsultasikan bila perlu.
- **Kontribusi**: lihat [CONTRIBUTING.md](./CONTRIBUTING.md).
- **Keamanan**: lihat [SECURITY.md](./SECURITY.md).
- **Merek**: nama dan logo proyek dapat dilindungi terpisah dari lisensi kode (kebijakan penggunaan merek bagi fork/pihak lain).

## 9. Peta Jalan (Roadmap)

Garis besar, urutan dapat berubah:

1. ✅ Fondasi: keanggotaan, KTA, event, keuangan, sekretariat, aspirasi
2. 🚧 **Rombakan multi-tenant**: pemisahan data per organisasi, routing subdomain, pendaftaran organisasi
3. 📋 Dasbor Super Admin platform: daftar tenant, suspend, kuota
4. 📋 Ekspor/impor data per tenant, domain kustom
5. 📋 Paket & penagihan (bila model berbayar dipilih)
6. 📋 Dokumentasi pengguna lengkap, Docker resmi, internasionalisasi (i18n)
