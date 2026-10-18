# Arsitektur Multi-Tenant (Desain Target)

Dokumen ini adalah **rancangan teknis** untuk mengubah Portal Organisasi dari satu organisasi per instalasi menjadi platform multi-tenant (SaaS) yang tetap dapat di-*self-host*.

> **Status:** 🚧 rancangan. Dokumen ini ditulis berdasarkan dokumentasi yang ada, bukan pembacaan kode. Nama tabel, kolom, dan berkas di bawah adalah **contoh**; sesuaikan dengan skema Prisma yang sebenarnya, dan verifikasi tiap poin terhadap kode sebelum diimplementasikan.

---

## Daftar Isi
1. [Tujuan dan Non-Tujuan](#1-tujuan-dan-non-tujuan)
2. [Keputusan Arsitektur Utama](#2-keputusan-arsitektur-utama)
3. [Resolusi Tenant dari Subdomain](#3-resolusi-tenant-dari-subdomain)
4. [Model Data](#4-model-data)
5. [Isolasi Berlapis](#5-isolasi-berlapis)
6. [Autentikasi dan Sesi](#6-autentikasi-dan-sesi)
7. [Hal-hal yang Harus Dibuat Per Tenant](#7-hal-hal-yang-harus-dibuat-per-tenant)
8. [File dan Storage](#8-file-dan-storage)
9. [Email, QR, dan Tautan Publik](#9-email-qr-dan-tautan-publik)
10. [Paket, Kuota, dan Penagihan](#10-paket-kuota-dan-penagihan)
11. [Mode Self-Hosted](#11-mode-self-hosted)
12. [Migrasi dari Single-Tenant](#12-migrasi-dari-single-tenant)
13. [Pengujian Isolasi](#13-pengujian-isolasi)
14. [Risiko dan Keputusan yang Masih Terbuka](#14-risiko-dan-keputusan-yang-masih-terbuka)

---

## 1. Tujuan dan Non-Tujuan

**Tujuan**
- Banyak organisasi di satu instalasi dengan **isolasi data yang dapat dibuktikan**.
- Satu basis kode untuk cloud dan self-hosted (`MULTI_TENANT=false` = perilaku seperti sekarang).
- Operasional sederhana: satu database, satu aplikasi, mudah dicadangkan.

**Non-tujuan (untuk fase awal)**
- Database terpisah per tenant.
- Penyesuaian kode per tenant.
- Satu akun lintas banyak organisasi dengan satu sesi (lihat bagian 6).

## 2. Keputusan Arsitektur Utama

### 2.1 Strategi isolasi data

| Opsi | Kelebihan | Kekurangan | Cocok untuk |
|---|---|---|---|
| **A. Satu DB, satu skema, kolom `organizationId`** | Paling sederhana, migrasi sekali, murah, mudah diskalakan ke ratusan/ribuan tenant | Isolasi bergantung pada disiplin query + RLS | **Rekomendasi awal** |
| B. Satu DB, skema per tenant | Isolasi lebih kuat, ekspor/restore per tenant mudah | Migrasi harus dijalankan ke setiap skema; Prisma kurang nyaman | Puluhan tenant dengan kebutuhan isolasi tinggi |
| C. Database per tenant | Isolasi terkuat | Operasional berat, biaya tinggi, migrasi rumit | Tenant besar/enterprise |

**Rekomendasi:** Opsi A + **PostgreSQL Row-Level Security (RLS)** sebagai jaring pengaman. Bila suatu hari ada tenant besar, tenant itu dapat dipindah ke instalasi sendiri (self-hosted) karena kodenya sama.

### 2.2 Cara menentukan tenant
**Subdomain** (`nama-org.domain-utama.com`) sebagai default, ditambah **domain kustom** (CNAME) sebagai fitur lanjutan. Tidak memakai path (`/org/nama`) karena membuat cookie, QR, dan URL lebih rumit.

## 3. Resolusi Tenant dari Subdomain

Alur permintaan:

```
Request  Host: himpunan-x.domainanda.com
   │
   ▼
Reverse proxy ── meneruskan header Host asli
   │
   ▼
Lapisan proxy/middleware Next.js
   ├─ ambil subdomain dari Host (abaikan jika ada di RESERVED_SUBDOMAINS)
   ├─ cari tenant di tabel Organization (cache singkat)
   ├─ tidak ada → 404 "Organisasi tidak ditemukan"
   ├─ status ≠ ACTIVE → halaman "ditangguhkan"
   └─ teruskan organizationId lewat header internal ke handler
   │
   ▼
Handler / Server Component ── semua query diberi konteks organizationId
```

Catatan:
- Di Next.js 16, berkas *middleware* berganti nama menjadi `proxy.ts`; sesuaikan dengan versi yang Anda pakai.
- **Jangan percaya** header `x-organization-id` dari klien: proxy harus menimpa/menghapusnya di setiap permintaan masuk.
- Cache hasil pencarian tenant (mis. 30–60 detik) agar tidak membebani database di tiap permintaan; invalidasi saat suspend/ubah subdomain.
- Domain utama (`domainanda.com`, `www`, `app`) menampilkan halaman pemasaran, pendaftaran organisasi, dan dasbor Super Admin platform, **bukan** tenant.

## 4. Model Data

### 4.1 Entitas baru

```prisma
// CONTOH — sesuaikan dengan skema nyata
model Organization {
  id           String   @id @default(cuid())
  name         String
  slug         String   @unique        // subdomain
  status       OrgStatus @default(PENDING)  // PENDING | ACTIVE | SUSPENDED | DELETING
  plan         String   @default("free")
  customDomain String?  @unique
  logoPath     String?
  settings     Json?                   // iuran default, label istilah, dll.
  createdAt    DateTime @default(now())
  deletedAt    DateTime?
}

model Membership {                      // jika memakai akun global (lihat bagian 6)
  id             String @id @default(cuid())
  userId         String
  organizationId String
  status         String                 // PENDING | ACTIVE | INACTIVE
  @@unique([userId, organizationId])
}
```

### 4.2 Kolom `organizationId` pada tabel domain
Hampir semua tabel yang menyimpan data organisasi harus memiliki `organizationId` (indeks wajib):

| Kelompok | Contoh tabel (nama disesuaikan) |
|---|---|
| Keanggotaan & struktur | anggota, jabatan, divisi, penempatan divisi |
| Kegiatan | event, pendaftaran event, panitia, divisi panitia, rapat panitia, kehadiran, sertifikat |
| Keuangan | transaksi, jurnal/entri, bagan akun, tagihan iuran, pembayaran |
| Sekretariat | surat, penomoran, proposal, LPJ |
| Aspirasi | aspirasi, tanggapan |
| Sistem | audit log, notifikasi, pengaturan, `rate_limits` |

### 4.3 Aturan keunikan harus berubah
Yang tadinya unik **global** harus menjadi unik **per tenant**:

| Sebelumnya | Menjadi |
|---|---|
| `nim` unik | `@@unique([organizationId, nim])` |
| nomor surat unik | `@@unique([organizationId, nomor])` |
| kode akun (COA) unik | `@@unique([organizationId, kode])` |
| kode aspirasi unik | tetap unik global (acak panjang) agar tidak bisa ditebak lintas tenant |
| nama divisi unik | `@@unique([organizationId, nama])` |

### 4.4 Tabel khusus platform (tanpa `organizationId`)
`Organization`, `PlatformAdmin`, paket/penagihan, audit log tingkat platform, daftar subdomain cadangan.

## 5. Isolasi Berlapis

Jangan hanya bergantung pada satu lapisan.

### Lapisan 1: Aplikasi (konteks tenant wajib)
Semua akses data melalui satu fungsi pembungkus yang **mewajibkan** konteks tenant, sehingga developer tidak mungkin lupa menambahkan filter.

```ts
// CONTOH konsep
const db = forTenant(organizationId)   // klien Prisma yang sudah ter-scope
await db.anggota.findMany()            // otomatis difilter organizationId
```

Aturan tim: **dilarang** memakai klien Prisma "telanjang" di kode fitur. Hanya modul platform/seed yang boleh. Tegakkan dengan aturan lint atau tinjauan PR.

### Lapisan 2: Database (RLS)
Cadangan bila lapisan 1 bocor.

```sql
ALTER TABLE anggota ENABLE ROW LEVEL SECURITY;
ALTER TABLE anggota FORCE ROW LEVEL SECURITY;   -- agar pemilik tabel pun terkena

CREATE POLICY tenant_isolation ON anggota
  USING (organization_id = current_setting('app.current_org', true)::text);
```

Di aplikasi, atur konteks pada setiap transaksi:

```ts
await prisma.$transaction([
  prisma.$executeRaw`SELECT set_config('app.current_org', ${orgId}, true)`,
  prisma.anggota.findMany(),
])
```

Penting:
- Aplikasi harus terhubung sebagai **role database non-superuser dan bukan pemilik tabel** (superuser dan pemilik tanpa `FORCE` melewati RLS).
- Gunakan role terpisah untuk migrasi (pemilik skema) dan untuk aplikasi (terbatas).
- Uji bahwa kueri tanpa konteks tenant mengembalikan **nol baris**, bukan semua baris.

### Lapisan 3: File
Path penyimpanan diawali ID tenant (`/<orgId>/...`) dan Route API memeriksa kesesuaian tenant sebelum mengirim berkas (bagian 8).

### Lapisan 4: Pengujian otomatis
Lihat bagian 13.

## 6. Autentikasi dan Sesi

### Keputusan: akun per-tenant atau akun global?

| | Akun per tenant (sederhana) | Akun global + Membership |
|---|---|---|
| Satu orang di 2 organisasi | Dua akun terpisah (email boleh sama) | Satu akun, dua keanggotaan |
| Kompleksitas | Rendah, mirip kondisi sekarang | Sedang-tinggi |
| Reset password | Per tenant | Satu kali |
| Risiko kebocoran lintas tenant | Rendah | Perlu kehati-hatian |

**Rekomendasi fase awal:** **akun per tenant**: `User` memiliki `organizationId`, dengan email/NIM unik **per tenant**. Migrasi ke akun global dapat dilakukan belakangan.

### Sesi
- Cookie sesi bersifat **host-only** (tanpa atribut `Domain`) sehingga `a.domain.com` dan `b.domain.com` tidak berbagi cookie.
- JWT memuat `organizationId`; pada setiap permintaan, **bandingkan** `organizationId` di JWT dengan tenant hasil resolusi subdomain. Jika berbeda → tolak (cegah penggunaan token tenant A di tenant B).
- `AUTH_TRUST_HOST=true` tetap diperlukan di belakang proxy.
- Rate limiting: kunci pembatasan diberi awalan tenant atau IP agar satu tenant tidak memblokir tenant lain.

### Peran
- **Peran platform**: `PLATFORM_ADMIN`, hanya untuk operator.
- **Peran tenant**: Super Admin organisasi, Ketua, Sekretaris, Bendahara, Kepala Departemen, Staf, Anggota; selalu dibatasi pada tenant-nya.
- Jangan pernah menyimpan `PLATFORM_ADMIN` sebagai peran tenant.

## 7. Hal-hal yang Harus Dibuat Per Tenant

Saat organisasi baru terdaftar, jalankan **seed per tenant** dalam satu transaksi:

1. Buat baris `Organization` (status PENDING → ACTIVE setelah verifikasi email).
2. Buat peran/jabatan bawaan.
3. Buat bagan akun (Chart of Accounts) bawaan.
4. Buat pengaturan default (nominal iuran, format nomor surat).
5. Buat akun Super Admin organisasi untuk pendaftar.
6. Catat di audit log platform.

**Penomoran** (surat, sertifikat, tiket): penghitung harus per tenant, dan bila memakai urutan berurutan, gunakan penguncian (`SELECT ... FOR UPDATE` atau penghitung atomik) agar tidak terjadi nomor ganda.

## 8. File dan Storage

- Struktur: `uploads/<organizationId>/<jenis>/<id>.<ext>` (atau *key* S3 yang sama).
- **Jangan** memakai nama berkas dari pengguna sebagai path; buat ID acak.
- Route API pengunduhan: (1) validasi sesi, (2) cek tenant sesi = tenant berkas, (3) cek hak akses spesifik (mis. bukti transfer hanya pemilik + Bendahara/pengurus berwenang), (4) baru kirim.
- S3: satu bucket, awalan per tenant, bucket privat, *signed URL* berumur pendek.
- Hitung pemakaian penyimpanan per tenant (untuk kuota).
- Validasi tipe & ukuran unggahan; sebaiknya periksa konten (magic bytes), bukan hanya ekstensi.

## 9. Email, QR, dan Tautan Publik

- **QR**: payload ber-HMAC harus memuat `organizationId` (dan jenis objek) di dalam data yang ditandatangani. URL verifikasi publik memakai subdomain tenant yang benar. QR dari tenant A **tidak boleh** valid di tenant B.
- **Halaman verifikasi publik** hanya menampilkan data minimum (nama, status, organisasi).
- **Email**: setiap tautan (reset password, undangan) dibangun dari subdomain tenant, bukan `NEXT_PUBLIC_APP_URL` global. Perlu fungsi `tenantUrl(org, path)`.
- **Perubahan subdomain**: simpan alias lama sebagai pengalihan permanen agar QR/tiket/email lama tetap berfungsi.

## 10. Paket, Kuota, dan Penagihan

Dimulai sederhana:

```ts
// CONTOH
const PLANS = {
  free:  { maxMembers: 100, storageMB: 500,  emailsPerMonth: 300 },
  pro:   { maxMembers: 1000, storageMB: 5000, emailsPerMonth: 5000 },
}
```

- Cek kuota di titik pembuatan (impor anggota, unggah file, kirim email), dengan pesan error yang jelas.
- Catat pemakaian per tenant (tabel `UsageCounter` atau hitung langsung).
- Penagihan (jika ada): gunakan penyedia pembayaran (mis. Midtrans/Xendit/Stripe); simpan hanya ID pelanggan/langganan, **bukan** data kartu. Webhook harus diverifikasi tanda tangannya dan idempoten.
- Prinsip: tenant tetap dapat **mengekspor data** meski di luar kuota atau ditangguhkan.

## 11. Mode Self-Hosted

| Variabel | Perilaku |
|---|---|
| `MULTI_TENANT=false` | Satu organisasi default; tidak ada subdomain, pendaftaran organisasi, atau dasbor platform. Seperti perilaku saat ini. |
| `MULTI_TENANT=true` | Fitur multi-tenant penuh; perlu `ROOT_DOMAIN` + wildcard DNS/SSL |

Jadikan mode single-tenant sebagai **kasus khusus** multi-tenant (tepat satu `Organization` ber-slug tetap), agar tidak ada dua jalur kode yang berbeda.

Sediakan: `docker-compose.yml` resmi, `.env.example` lengkap, dan skrip `bun run setup` untuk inisialisasi pertama.

## 12. Migrasi dari Single-Tenant

Untuk data yang sudah ada (mis. satu organisasi yang kini live):

1. **Backup penuh** (dan uji restore).
2. Tambah tabel `Organization`; buat satu baris untuk organisasi yang ada.
3. Tambah kolom `organizationId` **nullable** ke semua tabel domain.
4. **Backfill**: isi semua baris dengan ID organisasi tersebut.
5. Ubah kolom menjadi `NOT NULL`, tambah indeks dan foreign key.
6. Ganti constraint unik global menjadi unik per tenant (bagian 4.3).
7. Pindahkan berkas lama ke `uploads/<orgId>/...` dan perbarui path di database.
8. Perbarui payload QR / pastikan QR lama tetap diterima (periode transisi) atau diterbitkan ulang.
9. Aktifkan RLS **setelah** aplikasi memberi konteks tenant di semua jalur.
10. Jalankan seluruh uji isolasi, lalu uji di staging dengan salinan data produksi.

Lakukan bertahap dan dapat di-*rollback* di setiap langkah.

## 13. Pengujian Isolasi

Minimal harus ada, dan dijalankan di CI:

- [ ] Dua tenant uji (A dan B) dengan data berbeda.
- [ ] Setiap endpoint daftar/detail: login sebagai A → **tidak pernah** mengembalikan data B, termasuk dengan ID B yang ditebak (IDOR).
- [ ] Setiap mutasi: login sebagai A → tidak dapat mengubah/menghapus objek B.
- [ ] Unduh berkas milik B saat login sebagai A → ditolak.
- [ ] Token/sesi A dipakai di subdomain B → ditolak.
- [ ] QR milik A diverifikasi di B → tidak valid.
- [ ] Kueri tanpa konteks tenant (RLS) → nol baris.
- [ ] Impor Excel hanya memengaruhi tenant aktif.
- [ ] Penomoran paralel (uji konkurensi) tidak menghasilkan nomor ganda.
- [ ] Tenant `SUSPENDED` tidak dapat login, tetapi ekspor tetap bisa.

## 14. Risiko dan Keputusan yang Masih Terbuka

| # | Pertanyaan / risiko | Catatan |
|---|---|---|
| 1 | Lisensi: MIT/Apache vs AGPL | Menentukan apakah pihak lain boleh membuat SaaS tertutup dari kode ini |
| 2 | Akun per tenant vs global | Rekomendasi awal: per tenant |
| 3 | Apakah pendaftaran organisasi terbuka atau perlu persetujuan | Terbuka → risiko spam; pertimbangkan verifikasi email + CAPTCHA + batas per IP |
| 4 | Model harga dan batas free tier | Lihat PANDUAN_PLATFORM.md bagian 7 |
| 5 | Domain kustom & sertifikat otomatis | Perlu Caddy on-demand TLS atau layanan setara |
| 6 | Kepatuhan UU PDP, kebijakan privasi, retensi data | Perlu tinjauan hukum |
| 7 | Skala database (satu instance) | Mulai dari indeks yang tepat + replika baca bila perlu |
| 8 | Tenant "berisik" (satu tenant memakai banyak sumber daya) | Kuota + rate limiting per tenant |
| 9 | Pemisahan seed (platform vs tenant) | Lihat PANDUAN_SUPER_ADMIN.md bagian 2 |
| 10 | Penyalahgunaan subdomain (peniruan merek) | Daftar kata cadangan + tinjauan manual untuk nama sensitif |
