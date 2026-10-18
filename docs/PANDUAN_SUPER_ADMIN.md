# Panduan Super Admin (Level Platform)

Dokumen ini memandu Anda sebagai **Super Admin platform** (pemilik server/platform) dalam menyiapkan dan mengelola ekosistem organisasi di dalam sistem.

> Status fitur: ✅ tersedia · 🚧 dalam pengembangan · 📋 direncanakan.
> Bagian bertanda 📋 adalah **spesifikasi target** untuk fase multi-tenant. Lihat [ARSITEKTUR_MULTI_TENANT.md](./ARSITEKTUR_MULTI_TENANT.md).

---

## Daftar Isi
1. [Memahami Tingkatan Peran](#1-memahami-tingkatan-peran)
2. [Inisialisasi Awal](#2-inisialisasi-awal)
3. [Manajemen Multi-Tenant](#3-manajemen-multi-tenant-)
4. [Konfigurasi Email (Resend)](#4-konfigurasi-email-resend)
5. [Manajemen Data (Impor, Ekspor, Audit)](#5-manajemen-data-impor-ekspor-audit)
6. [Pembersihan Sistem (Housekeeping)](#6-pembersihan-sistem-housekeeping)
7. [Kebijakan dan Etika Operator](#7-kebijakan-dan-etika-operator)
8. [Prosedur Insiden](#8-prosedur-insiden)

---

## 1. Memahami Tingkatan Peran

| Tingkat | Nama | Cakupan |
|---|---|---|
| Platform | **Super Admin platform** (Anda) | Seluruh server dan semua tenant (hanya metadata, bukan isi data) |
| Tenant | **Super Admin organisasi** | Satu organisasi: struktur, peran, pengaturan |
| Tenant | Pengurus (Ketua, Sekretaris, Bendahara, Kepala Divisi) | Fungsi masing-masing di organisasinya |
| Tenant | Anggota | Layanan mandiri |

**Prinsip utama**: Super Admin platform mengelola **infrastruktur dan keberadaan tenant**, bukan mengintip isi data organisasi. Akses ke data tenant sebaiknya dibatasi, hanya atas permintaan tenant atau kebutuhan hukum, dan selalu tercatat di Audit Log.

## 2. Inisialisasi Awal

Saat pertama kali sistem dinyalakan, database kosong. Anda harus membuat akun Super Admin pertama dan menyuntikkan data dasar (Role, Divisi, Chart of Accounts).

**Prasyarat**: aplikasi sudah ter-*deploy* dan migrasi diterapkan (lihat [MAINTENANCE.md](./MAINTENANCE.md)).

1. Atur variabel lingkungan di `.env`:
   ```env
   ADMIN_NIM=...
   ADMIN_EMAIL=...
   ADMIN_PASSWORD=...        # kata sandi kuat; ganti setelah login pertama
   ```
2. Jalankan perintah (cukup **sekali**):
   ```bash
   bunx tsx prisma/seed.ts
   bunx tsx prisma/create-admin.ts
   ```
3. Login ke sistem. Akun Anda sekarang memegang kendali penuh atas platform.
4. **Segera**:
   - ganti kata sandi,
   - hapus `ADMIN_PASSWORD` dari `.env`,
   - catat bahwa seed tidak boleh dijalankan ulang di produksi tanpa memahami dampaknya.

> Pada mode multi-tenant 📋, `seed.ts` sebaiknya dipisah menjadi (a) seed tingkat platform (sekali) dan (b) seed per tenant (otomatis dijalankan saat organisasi baru terdaftar: peran bawaan, divisi contoh, bagan akun).

## 3. Manajemen Multi-Tenant 🚧

*Fitur ini diimplementasikan pada fase rombakan arsitektur.*

### Dasbor platform 📋
Dasbor khusus Super Admin platform menampilkan:
- daftar semua organisasi (nama, subdomain, tanggal daftar, status, jumlah anggota, pemakaian penyimpanan),
- status: **Aktif**, **Menunggu verifikasi**, **Ditangguhkan**, **Dijadwalkan dihapus**,
- metrik ringkas: jumlah tenant, pengguna aktif, pemakaian disk, antrean email.

### Siklus hidup tenant 📋

```
Daftar → Verifikasi email → Aktif ⇄ Ditangguhkan → Dijadwalkan dihapus → Dihapus permanen
```

| Tindakan | Kapan dipakai | Prosedur |
|---|---|---|
| **Setujui / aktifkan** | Bila pendaftaran memerlukan persetujuan manual | Tinjau nama & kontak, aktifkan |
| **Tangguhkan (suspend)** | Pelanggaran aturan, spam, penyalahgunaan, tunggakan | Beri alasan tertulis ke kontak tenant; data tetap utuh; pengguna melihat halaman pemberitahuan; **ekspor data tetap tersedia** bagi admin tenant |
| **Aktifkan kembali** | Masalah terselesaikan | Catat di Audit Log |
| **Hapus tenant** | Permintaan tenant atau pelanggaran berat | Wajib konfirmasi dua langkah, ekspor otomatis ditawarkan, **masa tenggang** (mis. 30 hari) sebelum penghapusan permanen |

### Isolasi
Setiap data organisasi diisolasi ketat. Anda tidak akan melihat data keuangan organisasi lain secara tidak sengaja. Dasbor platform hanya menampilkan **metadata**.

### Batas dan kuota 📋
Atur batas per tenant (anggota, penyimpanan, kuota email) sesuai kebijakan di [PANDUAN_PLATFORM.md](./PANDUAN_PLATFORM.md) bagian 7.

### Subdomain 📋
- Subdomain dicadangkan: `www, app, api, admin, mail, status, docs` dan sejenisnya (atur lewat `RESERVED_SUBDOMAINS`).
- Tolak subdomain yang meniru merek/institusi lain atau mengandung kata terlarang.
- Perubahan subdomain oleh tenant: izinkan maksimal sekian kali, dan simpan **pengalihan** dari subdomain lama agar tautan QR/tiket lama tidak mati.

## 4. Konfigurasi Email (Resend)

Untuk mengaktifkan notifikasi email (reset password, pengingat iuran):

1. Daftar di [resend.com](https://resend.com).
2. Tambahkan domain Anda dan verifikasi rekaman DNS (**SPF, DKIM, DMARC**).
3. Buat API Key, lalu masukkan ke `.env` sebagai `RESEND_API_KEY`.
4. Restart service aplikasi (`sudo systemctl restart portal`).
5. Aktifkan pengirim otomatis:
   ```bash
   systemctl --user enable --now portal-email-worker.timer
   systemctl --user list-timers
   ```
6. Uji: minta reset password dari akun uji dan pastikan email masuk (bukan Spam).

Catatan untuk multi-tenant 📋: email **dikirim atas nama platform**, tetapi nama pengirim dapat memuat nama organisasi (mis. "Himpunan X via Portal"). *Custom sender domain* per tenant adalah fitur lanjutan. Pantau kuota kirim agar satu tenant tidak menghabiskan jatah semua.

## 5. Manajemen Data (Impor, Ekspor, Audit)

- **Impor Anggota (Excel)**: berguna untuk *onboarding* awal organisasi. Pada mode multi-tenant, impor selalu berlaku **hanya pada tenant yang sedang aktif**.
- **Audit Log** (`/admin/audit`): pantau siapa melakukan perubahan data sensitif (hapus transaksi, ganti role, dll.). Pada tingkat platform 📋, catat juga tindakan Super Admin platform (suspend, hapus tenant, akses data atas permintaan).
- **Ekspor data tenant** 📋: sediakan ekspor lengkap (CSV/JSON + berkas) yang dapat dipicu admin tenant dan, bila perlu, Anda.
- **Backup & restore**: lihat [MAINTENANCE.md](./MAINTENANCE.md) bagian 6.

## 6. Pembersihan Sistem (Housekeeping)

| Tugas | Frekuensi | Catatan |
|---|---|---|
| Hapus token reset password kedaluwarsa | Mingguan | Tabel token tumbuh terus bila tidak dibersihkan |
| Bersihkan tabel `rate_limits` lama | Mingguan | |
| Bersihkan file di `uploads/` yang tidak terhubung ke database | Bulanan (opsional) | **Backup dulu**; periksa dengan mode *dry-run* sebelum menghapus |
| Tinjau tenant tidak aktif | Kuartalan 📋 | Hubungi kontak sebelum arsip/hapus |
| Perbarui dependensi & OS | Berkala | Lihat checklist di MAINTENANCE.md |
| Uji restore backup | Bulanan | Wajib |

## 7. Kebijakan dan Etika Operator

Sebagai penyedia layanan, Anda memegang kepercayaan banyak organisasi. Siapkan dan publikasikan:

- **Syarat Layanan (Terms of Service)**: aturan pemakaian, larangan, penangguhan.
- **Kebijakan Privasi**: data apa dikumpulkan, disimpan berapa lama, siapa yang bisa mengakses, penyedia pihak ketiga (mis. Resend), hak pengguna menghapus data. Perhatikan **UU PDP** (bukan nasihat hukum).
- **Kebijakan akses staf**: siapa yang dapat melihat data tenant, kapan, dan bagaimana dicatat.
- **Kontak resmi**: email dukungan dan email pelaporan keamanan (lihat [SECURITY.md](./SECURITY.md)).
- **Halaman status** (opsional): informasi gangguan dan pemeliharaan terjadwal.

## 8. Prosedur Insiden

### Gangguan layanan
1. Konfirmasi dari pemantau uptime/log (`journalctl -u portal`).
2. Cek cepat: database hidup? disk penuh? sertifikat kedaluwarsa? proxy berjalan?
3. Pulihkan layanan; bila perlu restore dari backup.
4. Umumkan ke tenant bila gangguan > beberapa menit.
5. Tulis ringkasan pasca-insiden (apa, sebab, perbaikan, pencegahan).

### Dugaan kebocoran data / akun dibobol
1. **Batasi dampak**: paksa logout (ganti `AUTH_SECRET` bila perlu), nonaktifkan akun terdampak, tangguhkan tenant bila diperlukan.
2. **Amankan bukti**: simpan log dan Audit Log; jangan menimpa.
3. **Telusuri**: tenant mana, data apa, sejak kapan.
4. **Perbaiki**: tutup celah, rotasi rahasia (`AUTH_SECRET`, `QR_HMAC_SECRET`, kunci API, kredensial DB).
5. **Beri tahu** tenant dan pihak terdampak secara jujur dan tepat waktu; ikuti kewajiban pelaporan hukum yang berlaku.
6. **Evaluasi** dan dokumentasikan pelajaran.

### Menerima laporan kerentanan
Ikuti alur di [SECURITY.md](./SECURITY.md): akui laporan dalam waktu singkat, perbaiki secara privat, rilis patch, lalu umumkan.
