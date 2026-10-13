<div align="center">
  <img src="public/logo-himman.png" alt="HIMMAN UKRI" width="120" />

  # HIMMAN UKRI

  **Portal anggota & situs publik Himpunan Mahasiswa Manajemen**
  **Universitas Kebangsaan Republik Indonesia**

  [![Next.js](https://img.shields.io/badge/Next.js-16-000?logo=nextdotjs&logoColor=fff)](https://nextjs.org)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org)
  [![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=fff)](https://www.prisma.io)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=fff)](https://www.postgresql.org)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=fff)](https://tailwindcss.com)
  [![License](https://img.shields.io/badge/license-MIT-green)](#lisensi)

  <p>
    <a href="#-fitur">Fitur</a> ·
    <a href="#-mulai-cepat">Mulai cepat</a> ·
    <a href="#-struktur-proyek">Struktur</a> ·
    <a href="#-keamanan">Keamanan</a> ·
    <a href="#-deployment">Deployment</a>
  </p>
</div>

---

Satu portal untuk seluruh kegiatan himpunan: kartu anggota digital, event dan sertifikat, iuran kas yang transparan, arsip surat, dan kotak aspirasi. Dibangun dengan Next.js App Router, Prisma, dan PostgreSQL, dengan tema gelap/terang, akses berbasis peran, dan penyimpanan berkas yang bisa lokal maupun cloud.

## ✨ Fitur

### Untuk anggota
- **KTA digital** dengan QR yang bisa diverifikasi siapa pun — scan pakai kamera HP langsung membuka halaman verifikasi
- **Mode check-in layar penuh** dengan Screen Wake Lock; simpan sebagai PNG untuk cadangan
- **Onboarding 5 langkah** sekali saja: lengkapi profil → unggah tanda tangan → kenali KTA → panduan singkat
- **Pendaftaran event** dengan tiket QR, dan unduh sertifikat setelah hadir
- **Iuran kas** — lihat tagihan, unggah bukti transfer, lacak status verifikasi
- **Transparansi kas** — laporan pemasukan/pengeluaran yang sudah diverifikasi
- **Kotak aspirasi anonim** dengan kode pelacakan; tanggapan Komisi III terbaca oleh pengirim

### Untuk pengurus
- **Manajemen anggota**: approve/reject, impor massal dari Excel (mahasiswa baru), kelola KTA
- **Divisi & jabatan**: Kepala Departemen, Sekretaris Departemen, Staf; satu kepala per divisi
- **Pengurus inti**: Ketua, Wakil, Sekretaris Umum, Bendahara Umum, Dewan Pembina, penandatangan eksternal (Ketua Prodi, Dekan, WR III)
- **Izin otomatis** dari jabatan — Ketua Himpunan dapat akses penuh tanpa harus jadi Super Admin
- **Kepanitiaan event**: pembukaan pendaftaran, divisi per event, seleksi, rapat panitia dengan absensi kode, check-in hari-H
- **Sekretariat**: arsip surat masuk/keluar, proposal, LPJ, penomoran otomatis per bulan per jenis, lembar pengesahan bertanda tangan
- **Keuangan double-entry**: bagan akun, jurnal umum, buku besar, neraca, laba rugi, laporan PDF & Excel
- **CMS**: berita, pengumuman, artikel dengan penjadwalan terbit
- **Pintasan admin**: ringkasan berisi antrean tindakan, agenda 30 hari, kondisi kas, dan aktivitas terbaru

### Untuk pengunjung
- Situs publik: profil organisasi, struktur, departemen, dokumen konstitusi, kegiatan, berita
- **Verifikasi sertifikat** — masukkan nomor atau scan QR
- **Verifikasi anggota** — scan QR KTA untuk memastikan keaslian
- **Laporkan bug** dengan info perangkat otomatis, tanpa perlu login

## 🧭 Mulai cepat

### Prasyarat

- **Node.js** 20+
- **PostgreSQL** 14+
- **npm** (atau pnpm/yarn; perintah di bawah pakai npm)

### Langkah

```bash
# 1. Clone & install
git clone https://github.com/<username>/himman-ukri.git
cd himman-ukri
npm install
```

```bash
# 2. Siapkan environment
cp .env.example .env
# Edit .env, minimal isi DATABASE_URL, AUTH_SECRET, QR_HMAC_SECRET
```

```bash
# 3. Terapkan migrasi & generate Prisma Client
npx prisma migrate deploy
npx prisma generate
```

```bash
# 4. Seed data dasar (role, permission, divisi)
npx tsx prisma/seed.ts
```

```bash
# 5. Buat akun Super Admin pertama
ADMIN_NIM=12345678 \
ADMIN_EMAIL=admin@himman.local \
ADMIN_PASSWORD=Admin1234 \
ADMIN_NAME="Super Admin" \
npx tsx prisma/create-admin.ts
```

```bash
# 6. Jalankan
npm run dev
```

```bash
Buka http://localhost:3000, masuk dengan email/NIM + password Super Admin di atas.
Variabel environment
Variabel	Wajib	Keterangan
DATABASE_URL	✅	Koneksi PostgreSQL
AUTH_SECRET	✅	Rahasia NextAuth. Hasilkan dengan openssl rand -hex 32
QR_HMAC_SECRET	✅	Rahasia tanda tangan QR KTA & tiket. Hasilkan dengan openssl rand -hex 32
NEXT_PUBLIC_APP_URL	—	Base URL aplikasi (untuk tautan verifikasi di luar request context)
UPLOAD_DIR	—	Direktori disk untuk berkas (default ./uploads)
S3_BUCKET + kawan-kawan	—	Aktifkan object storage S3-compatible (R2, AWS S3, MinIO)
CERT_SIGNER_NAME / CERT_SIGNER_TITLE	—	Nama & jabatan penandatangan default sertifikat
📜 Perintah
Perintah	Fungsi
npm run dev	Server pengembangan (Turbopack)
npm run build	Build produksi
npm run start	Jalankan hasil build
npm run lint	ESLint
npm run typecheck	TypeScript strict mode
npm test	Tes unit (node:test + tsx). Tes yang butuh DB dilewati bila DATABASE_URL kosong
```

🗂️ Struktur proyek
text

prisma/
├── schema.prisma          # Model data (PostgreSQL)
├── migrations/            # 20+ migrasi berversi
├── seed.ts                # Role, permission, divisi
├── create-admin.ts        # Bootstrap Super Admin
└── finance-seed.ts        # Bagan akun keuangan

src/
├── app/
│   ├── (site)/            # Situs publik: beranda, kegiatan, berita, struktur, dokumen
│   ├── (public)/          # Verifikasi sertifikat/anggota, laporan bug
│   ├── (auth)/            # Login & registrasi
│   ├── admin/             # Panel admin (anggota, event, keuangan, sekretariat, dll)
│   ├── dashboard/         # Portal anggota (KTA, event, iuran, sertifikat, profil)
│   ├── onboarding/        # Wizard 5 langkah
│   └── api/               # Route handler: auth, PDF, XLSX, unggahan privat
├── actions/               # Server actions (mutasi form)
├── components/
│   ├── ui/                # Primitif: button, input, card, dialog, tabs, dll
│   ├── site/              # Komponen situs publik
│   ├── committee/         # Kepanitiaan event
│   └── onboarding/        # Wizard
├── lib/
│   ├── finance-*.ts       # Pembukuan double-entry, jurnal, laporan
│   ├── certificate-*.ts   # PDF, service, nomor unik
│   ├── letters.ts         # Penomoran surat (PO Pasal 3)
│   ├── signatures.ts      # Tanda tangan pengurus
│   ├── security.ts        # HMAC, tanda tangan QR
│   └── __tests__/         # 64 tes unit
└── styles/
    ├── site.css           # Gaya situs publik
    └── tokens.css         # Design tokens (warna, spacing, motion)

🔒 Keamanan

Beberapa keputusan desain yang perlu diketahui:

    Sesi membaca ulang dari database (cache 15 detik) — pencabutan akses atau penolakan akun berlaku hampir seketika, bukan setelah token 8 jam habis.

    Pembatas laju (tabel rate_limits): login 30/15 menit per IP dan 8/15 menit per akun; registrasi 10/jam; aspirasi & bug report 5/jam; ganti password 5/15 menit. Kunci di-HMAC sehingga IP/NPM tidak tersimpan mentah.

    Race condition keuangan: pendaftaran event pakai advisory lock per event; persetujuan iuran "mengklaim" baris secara atomik sehingga tidak mungkin menghasilkan dua transaksi.

    Empat mata: verifikator transaksi tidak boleh orang yang mencatatnya (kecuali Super Admin).

    QR ditandatangani HMAC: tiket event, KTA, dan tautan verifikasi tidak bisa dipalsukan tanpa QR_HMAC_SECRET.

    Berkas privat (bukti transfer, surat, sertifikat, tanda tangan) hanya dilayani lewat route aplikasi yang memeriksa login & izin, bukan dari URL publik.

    Turbopack build memperingatkan dynamic filesystem di src/lib/blob.ts — wajar untuk disk lokal. Untuk serverless, aktifkan S3.

📦 Penyimpanan berkas

Semua berkas (bukti transfer, PDF surat, sertifikat, gambar, tanda tangan) disimpan lewat src/lib/blob.ts:

    Tanpa S3_BUCKET → disk lokal di UPLOAD_DIR. Cocok untuk dev atau VPS dengan volume persisten.

    Dengan S3_BUCKET (+ S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_REGION) → object storage S3-compatible (Cloudflare R2, AWS S3, Supabase, MinIO). Wajib di hosting serverless.

Bucket harus privat; berkas hanya dilayani lewat route aplikasi (/api/proofs, /api/letters, /api/uploads, /api/signatures, /api/certificates).
Memindahkan berkas dari disk ke bucket

Salin isi folder per-folder (proofs/, letters/, certificates/, events/, posts/, avatars/) ke bucket dengan struktur kunci yang sama (proofs/<uuid>.png, dst). Alamat di database (/api/...) tidak perlu diubah.
🚀 Deployment
VPS / bare metal

Cocok untuk hosting sederhana dengan volume persisten.
bash

npm ci
npx prisma migrate deploy
npm run build
npm run start

Reverse proxy (Nginx/Caddy) harus meneruskan x-forwarded-proto dan host supaya URL verifikasi di QR sertifikat & KTA benar.
Serverless (Vercel, Netlify, dll)

Wajib mengaktifkan object storage — disk serverless tidak persisten. Isi S3_BUCKET + kawan-kawan di environment.

CI (.github/workflows/ci.yml) menjalankan migrasi pada Postgres bersih, lalu lint, typecheck, test, dan build pada setiap push.
🧪 Pengujian
bash

npm test

64 tes unit mencakup:

    Pembukuan double-entry: pemetaan akun, jurnal, buku besar, neraca, laba rugi

    Penomoran surat & periodisasi WIB

    Penandatangan lembar pengesahan (PO Pasal 3)

    Tanda tangan HMAC & scan QR (KTA, tiket, NPM)

    Penyimpanan berkas (disk lokal) & validasi nama kunci

    Rate limiting & pembatas laju berbasis database

    Jabatan pengurus & tanda tangan pemegang jabatan

Tes yang memerlukan DB asli (rate-limit.db.test.ts) otomatis dilewati bila DATABASE_URL tidak diset.
🎨 Desain

    Tema mengikuti AD Pasal 3-4: hitam, putih, abu, kuning bendera (#ffA500)

    Design tokens di src/styles/tokens.css — neutral 17 tingkat, semantic surface/text/border/state, motion, z-index. Setiap komponen memakai token, tidak ada nilai ad-hoc.

    Mode gelap & terang dengan kontras WCAG AA minimum

    Motion dengan 4 skala durasi (120/200/320/480ms) dan 3 easing. prefers-reduced-motion dihormati.

    Aksesibilitas: focus ring konsisten, aria-current di navigasi, empty state yang menjelaskan, form field dengan label + hint + error.

🛠️ Tech stack
Lapisan	Pilihan
Framework	Next.js 16 (App Router, Turbopack, Server Actions)
Bahasa	TypeScript 5 (strict)
Database	PostgreSQL + Prisma 6
Auth	Auth.js v5 (NextAuth beta) dengan Credentials
UI	Tailwind CSS 4, Base UI, Lucide icons
PDF	@react-pdf/renderer
Excel	exceljs
QR	qrcode, qrcode.react, jsqr (scan kamera)
Grafik	Recharts
Tes	node:test + tsx
🤝 Kontribusi

Karena ini proyek internal himpunan, kontribusi dibatasi untuk pengurus HIMMAN UKRI. Alur yang dipakai:

    Buat branch dari main: git checkout -b feat/nama-fitur

    Jalankan npm run lint && npm run typecheck && npm test sebelum commit

    Commit dengan pesan deskriptif (mis. feat(events): tambah filter divisi panitia)

    Buka Pull Request

Konvensi commit

    feat(scope): ... — fitur baru

    fix(scope): ... — perbaikan bug

    polish(scope): ... — perbaikan UI/UX

    chore: ... — pemeliharaan (dependency, config)

    docs: ... — dokumentasi

📝 Lisensi

MIT — bebas dipakai dan dimodifikasi dengan mencantumkan atribusi.
🙏 Atribusi

    Logo & identitas visual: HIMMAN UKRI

    Font: Archivo & Source Serif (Google Fonts)

<div align="center"> <sub>Dibuat dengan ❤️ untuk HIMMAN UKRI · <a href="https://github.com/<username>/himman-ukri/issues">Laporkan masalah</a></sub> </div> READMEEOF ```
