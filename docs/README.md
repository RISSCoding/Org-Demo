# Portal Organisasi

Sistem manajemen organisasi *open-source* untuk himpunan mahasiswa, UKM, komunitas, LSM, dan organisasi sejenis. Satu tempat untuk keanggotaan, kegiatan, keuangan, surat-menyurat, dan aspirasi, tersedia sebagai **layanan cloud (SaaS)** atau **self-hosted**.

> Status: aplikasi inti sudah berjalan; **arsitektur multi-tenant sedang dikerjakan** 🚧. Lihat [peta jalan](./docs/PANDUAN_PLATFORM.md#9-peta-jalan-roadmap).

## Fitur

- **KTA digital** dengan QR yang dapat diverifikasi publik
- **Event & kepanitiaan**: tiket QR, seleksi panitia, absensi (scanner), sertifikat massal
- **Keuangan**: iuran kas, pembukuan *double-entry*, laporan Neraca / Laba Rugi / Jurnal (PDF & Excel), transparansi kas
- **Sekretariat**: arsip surat bernomor otomatis, proposal/LPJ, lembar pengesahan digital
- **Kotak aspirasi**: dua arah, anonim, dengan kode pelacakan
- **Struktur organisasi**: jabatan inti, divisi/departemen, impor anggota via Excel
- **Keamanan**: audit log, *rate limiting*, penyimpanan file privat
- **Multi-tenant** 🚧: banyak organisasi, data terisolasi, subdomain per organisasi

## Teknologi

Next.js (App Router) · React · PostgreSQL · Prisma · Auth.js (NextAuth) · Bun · Resend (email, opsional) · Disk lokal atau S3-compatible

## Memulai (pengembangan lokal)

Prasyarat: [Bun](https://bun.sh), PostgreSQL 14+ (atau Docker).

```bash
git clone <url-repositori>
cd <nama-folder>
bun install

cp .env.example .env
# isi DATABASE_URL, AUTH_SECRET, QR_HMAC_SECRET (openssl rand -hex 32)

bunx prisma migrate dev
bunx tsx prisma/seed.ts
bunx tsx prisma/create-admin.ts   # butuh ADMIN_NIM, ADMIN_EMAIL, ADMIN_PASSWORD di .env

bun run dev                       # http://localhost:3000
```

## Dokumentasi

| Untuk siapa | Dokumen |
|---|---|
| Anggota | [PANDUAN_ANGGOTA.md](./docs/PANDUAN_ANGGOTA.md) |
| Pengurus (Ketua, Sekretaris, Bendahara, Kadep) | [OPERASIONAL.md](./docs/OPERASIONAL.md) |
| Super Admin platform | [PANDUAN_SUPER_ADMIN.md](./docs/PANDUAN_SUPER_ADMIN.md) |
| Sysadmin / DevOps | [MAINTENANCE.md](./docs/MAINTENANCE.md) |
| Pemilik proyek & penyelenggara layanan | [PANDUAN_PLATFORM.md](./docs/PANDUAN_PLATFORM.md) |
| Developer | [ARSITEKTUR_MULTI_TENANT.md](./docs/ARSITEKTUR_MULTI_TENANT.md), [CONTRIBUTING.md](./docs/CONTRIBUTING.md) |
| Peneliti keamanan | [SECURITY.md](./docs/SECURITY.md) |

## Self-hosting

Baca [MAINTENANCE.md](./docs/MAINTENANCE.md) untuk deployment (systemd/Docker), reverse proxy, backup, dan checklist go-live. Data Anda sepenuhnya milik Anda.

## Berkontribusi

Kontribusi sangat disambut: kode, dokumentasi, terjemahan, laporan bug. Baca [CONTRIBUTING.md](./docs/CONTRIBUTING.md) terlebih dahulu.

## Keamanan

Menemukan celah keamanan? **Jangan** membuka issue publik. Ikuti [SECURITY.md](./docs/SECURITY.md).

## Lisensi

*[Belum ditetapkan, pilih lisensi lalu tambahkan berkas `LICENSE` dan perbarui bagian ini.]* Pertimbangan pilihan lisensi dibahas di [PANDUAN_PLATFORM.md](./docs/PANDUAN_PLATFORM.md#8-lisensi-dan-kontribusi).
