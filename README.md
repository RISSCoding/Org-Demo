# HIMMAN UKRI

Portal anggota dan situs publik Himpunan Mahasiswa Manajemen UKRI (Next.js 16, Prisma, PostgreSQL, Auth.js).

## Menjalankan

```bash
cp .env.example .env        # isi AUTH_SECRET dan QR_HMAC_SECRET
npm install
npx prisma migrate deploy   # atau `prisma migrate dev` saat mengembangkan
npm run dev
```

## Perintah

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | server pengembangan |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm test` | tes unit (`node:test` + `tsx`). Tes yang butuh database otomatis dilewati bila `DATABASE_URL` kosong |
| `npm run build` | build produksi |

CI (`.github/workflows/ci.yml`) menjalankan migrasi pada Postgres bersih, lalu lint, typecheck, tes, dan build.

## Penyimpanan berkas

Bukti transfer, dokumen surat, sertifikat, dan gambar disimpan lewat `src/lib/blob.ts`:

- **Tanpa `S3_BUCKET`**: disk lokal di `UPLOAD_DIR`. Hanya cocok untuk dev atau VPS dengan volume persisten.
- **Dengan `S3_BUCKET`** (+ `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION`): object storage S3-compatible (Cloudflare R2, AWS S3, Supabase, MinIO). **Wajib di hosting serverless.** Bucket harus privat; berkas hanya dilayani lewat route aplikasi (`/api/proofs`, `/api/letters`, `/api/uploads`).

Memindahkan berkas yang sudah ada dari `uploads/` ke bucket: salin isi folder per-folder (`proofs/`, `letters/`, `certificates/`, `events/`, `posts/`, `avatars/`) ke bucket dengan struktur kunci yang sama (`proofs/<uuid>.png`, dst.). Alamat di database (`/api/...`) tidak perlu diubah.

## Keamanan yang perlu diketahui

- **Sesi**: peran dan permission dibaca ulang dari database (cache 15 detik), jadi pencabutan akses atau penolakan akun berlaku hampir seketika, bukan setelah token 8 jam habis.
- **Pembatas laju** (tabel `rate_limits`): login 30/15 menit per IP dan 8/15 menit per akun, registrasi 10/jam per IP, aspirasi 5/jam per IP, ganti password 5/15 menit per akun. Kunci di-HMAC sehingga IP/NPM tidak tersimpan mentah. Pembatas per-IP bergantung pada header `x-real-ip` / `x-forwarded-for`; hanya dapat dipercaya bila aplikasi berada di belakang proxy yang menimpa header itu (Vercel, Cloudflare, Nginx).
- **Race condition**: pendaftaran event (kuota) memakai advisory lock per-event; persetujuan iuran "mengklaim" baris secara atomik sehingga tidak bisa menghasilkan dua transaksi.
# Org-Demo
