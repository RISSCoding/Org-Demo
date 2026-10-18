# Panduan Berkontribusi

Terima kasih sudah tertarik membantu! Dokumen ini menjelaskan cara berkontribusi pada Portal Organisasi.

## Cara Berkontribusi

- 🐛 **Melaporkan bug**: buka *issue* dengan langkah mereproduksi, hasil yang diharapkan vs aktual, versi, dan tangkapan layar/log (tanpa data pribadi).
- 💡 **Mengusulkan fitur**: jelaskan masalah yang ingin dipecahkan, bukan hanya solusinya. Diskusikan di *issue* sebelum mulai mengerjakan fitur besar.
- 📝 **Dokumentasi & terjemahan**: perbaikan kecil langsung boleh dikirim lewat PR.
- 🔧 **Kode**: cari *issue* berlabel `good first issue` atau `help wanted`.
- 🔒 **Celah keamanan**: jangan lewat issue publik, lihat [SECURITY.md](./SECURITY.md).

## Menyiapkan Lingkungan Pengembangan

Lihat bagian *Memulai* di [README.md](../README.md). Ringkasnya:

```bash
bun install
cp .env.example .env          # isi nilai yang diperlukan
bunx prisma migrate dev
bunx tsx prisma/seed.ts
bun run dev
```

Gunakan database lokal terpisah; **jangan** memakai data produksi.

## Alur Kerja

1. *Fork* repositori dan buat cabang dari `main`:
   `fitur/nama-singkat`, `perbaikan/nama-singkat`, atau `docs/nama-singkat`.
2. Buat perubahan **kecil dan terfokus** (satu PR = satu tujuan).
3. Jalankan pemeriksaan lokal (lint, typecheck, test, build) sebelum membuka PR.
4. Buka *Pull Request* dengan deskripsi: apa, mengapa, cara menguji, dan *issue* terkait.
5. Tanggapi masukan reviewer; PR digabung setelah disetujui dan CI lulus.

### Pesan commit
Gunakan format [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(keuangan): tambah laporan arus kas bulanan
fix(kta): perbaiki verifikasi QR di subdomain
docs(maintenance): lengkapi contoh systemd
```

## Aturan Khusus Multi-Tenant (Wajib)

Karena platform ini melayani banyak organisasi, kebocoran data lintas organisasi adalah **bug kritis**. Setiap PR yang menyentuh data harus memenuhi:

- [ ] Semua kueri database melewati klien **ter-scope tenant**, bukan klien Prisma telanjang.
- [ ] Tabel baru yang menyimpan data organisasi memiliki kolom `organizationId` + indeks, dan kebijakan RLS.
- [ ] Constraint unik baru mempertimbangkan cakupan **per tenant**.
- [ ] Endpoint baru memeriksa **autentikasi, tenant, dan peran**, dengan urutan itu.
- [ ] Berkas yang diunggah/diunduh melewati Route API yang memvalidasi tenant.
- [ ] Ada uji yang membuktikan data tenant A tidak terlihat oleh tenant B.
- [ ] Tidak ada rahasia, data pribadi nyata, atau URL internal di kode, log, atau fixture.

Rincian ada di [ARSITEKTUR_MULTI_TENANT.md](./ARSITEKTUR_MULTI_TENANT.md).

## Migrasi Database

- Buat migrasi baru dengan `bunx prisma migrate dev --name deskripsi_singkat`.
- **Jangan mengedit migrasi yang sudah dirilis.**
- Migrasi harus aman pada data yang sudah ada (nilai default / *backfill* untuk kolom `NOT NULL`).
- Jelaskan di PR bila migrasi bersifat merusak atau memerlukan langkah manual.

## Standar Kode

- TypeScript dengan mode ketat; hindari `any` tanpa alasan.
- Ikuti konfigurasi lint/format proyek (jalankan sebelum commit).
- Validasi semua input di sisi server (jangan hanya di klien).
- Hindari menaruh logika bisnis di komponen UI.
- Teks antarmuka dalam bahasa Indonesia; siapkan agar mudah diterjemahkan (i18n) 📋.
- Aksesibilitas: label form, kontras warna, navigasi keyboard.
- Performa: hindari kueri N+1; gunakan paginasi untuk daftar panjang.

## Dokumentasi

Ubah perilaku pengguna → perbarui dokumen yang relevan (`PANDUAN_*`, `OPERASIONAL.md`, `MAINTENANCE.md`) dalam PR yang sama. Gunakan penanda status ✅ / 🚧 / 📋 secara konsisten.

## Kode Etik

Bersikap sopan, menghargai perbedaan, dan fokus pada gagasan, bukan orangnya. Pelecehan dan diskriminasi tidak ditoleransi. Pelanggaran dapat dilaporkan ke *[email kontak maintainer]*. *(Disarankan mengadopsi [Contributor Covenant](https://www.contributor-covenant.org/) sebagai `CODE_OF_CONDUCT.md`.)*

## Lisensi Kontribusi

Dengan mengirim kontribusi, Anda setuju kontribusi tersebut dilisensikan di bawah lisensi proyek ini. *[Tentukan apakah memakai DCO (`Signed-off-by`) atau CLA setelah lisensi dipilih.]*
