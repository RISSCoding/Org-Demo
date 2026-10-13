# Panduan Operasional Sistem HIMMAN UKRI

Untuk pengurus inti (ketua, sekretaris, bendahara, dan pengurus lain) yang memakai sistem sehari-hari. **Tidak perlu kemampuan teknis.** Urusan server, backup, dan deploy ada di `MAINTENANCE.md`.

> Catatan: sesuaikan bagian bertanda `[...]` dengan kondisi sebenarnya di HIMMAN.

---

## 1. Sistem ini untuk apa?

Sistem HIMMAN UKRI dipakai untuk mengelola kegiatan organisasi secara terpusat:

- **Data anggota** — daftar anggota per periode
- **Keuangan** — pencatatan transaksi pemasukan dan pengeluaran beserta bukti
- **Surat** — arsip surat masuk dan keluar
- **Sertifikat** — penerbitan dan arsip sertifikat, dengan QR code untuk verifikasi keaslian

Alamat akses: `https://[domain-kamu]`

---

## 2. Siapa boleh mengakses apa?

| Peran | Tugas utama di sistem |
|---|---|
| Ketua | Memantau seluruh data, menyetujui hal penting |
| Sekretaris | Mengelola data anggota, surat, dan sertifikat |
| Bendahara | Mencatat dan memeriksa transaksi keuangan |
| Admin / Tim IT | Mengelola akun pengguna dan menangani masalah teknis |

Aturan dasar:

- Satu orang = satu akun. **Jangan berbagi password.**
- Hanya beri akses sesuai kebutuhan tugas.
- Pengurus yang sudah tidak menjabat harus dinonaktifkan atau direset aksesnya (lihat bagian 6).

---

## 3. Tugas rutin

### Setiap kegiatan / setiap ada transaksi

- [ ] Bendahara mencatat transaksi **di hari yang sama** atau paling lambat H+1
- [ ] Unggah bukti (nota, foto transfer) bersama catatan transaksi
- [ ] Sekretaris mengarsipkan surat yang keluar/masuk ke sistem

### Mingguan

- [ ] Cek apakah semua transaksi minggu ini sudah tercatat beserta buktinya
- [ ] Cek aplikasi bisa dibuka dan login normal

### Bulanan

- [ ] Bendahara mencocokkan saldo di sistem dengan saldo asli (rekening/kas)
- [ ] Ketua memeriksa ringkasan keuangan bulan tersebut
- [ ] Tanyakan ke Tim IT: backup otomatis masih jalan?

### Per periode kepengurusan

- [ ] Data anggota periode baru diinput lengkap
- [ ] Ikuti `SERAH_TERIMA.md` untuk pergantian pengurus dan tim IT
- [ ] Reset password pengurus yang sudah selesai masa jabatannya

---

## 4. Aturan data

**Boleh:**

- Mengoreksi data yang salah input (catat alasan koreksinya)
- Mengunggah bukti tambahan yang terlewat

**Jangan:**

- Menghapus transaksi atau surat untuk "merapikan" — koreksi dengan catatan, bukan dihapus
- Mengunggah file berisi data pribadi yang tidak perlu (misal foto KTP) kecuali memang dibutuhkan
- Memberikan akses ke orang di luar kepengurusan

**Bukti dan berkas:**

- Foto bukti harus terbaca jelas (tidak buram, tidak terpotong)
- Beri nama berkas yang mudah dikenali, contoh: `2026-10-13_konsumsi-rapat.jpg`
- Berkas bukti, surat, dan sertifikat disimpan di server dan ikut dibackup otomatis

---

## 5. Kalau ada masalah

| Masalah | Yang dilakukan |
|---|---|
| Lupa password | Minta reset ke Admin / Tim IT |
| Tidak bisa login padahal password benar | Coba ulang beberapa menit kemudian, lalu hubungi Tim IT |
| Aplikasi tidak bisa dibuka | Cek koneksi internet dulu; kalau normal, hubungi Tim IT |
| Salah input data | Koreksi sendiri dan catat alasannya; kalau tidak bisa, minta bantuan Admin |
| Data atau berkas hilang | **Jangan input ulang dulu.** Segera hubungi Tim IT agar bisa dicek lewat backup |
| Dicurigai ada akses tidak sah | Segera hubungi Tim IT dan Ketua; ganti password |

**Kontak darurat:**

- Tim IT HIMMAN: `[nama / nomor WhatsApp]`
- Cadangan: `[nama / nomor WhatsApp]`
- Grup koordinasi: "Tim IT HIMMAN"

Saat melapor, sertakan: apa yang sedang dilakukan, jam kejadian, pesan error (screenshot lebih baik).

---

## 6. Pergantian pengurus

Saat ada pengurus keluar atau periode berganti:

1. Admin menonaktifkan atau mereset akun pengurus lama
2. Buat akun untuk pengurus baru dengan peran yang sesuai
3. Pastikan password awal diganti saat login pertama
4. Pastikan pengurus baru sudah membaca dokumen ini
5. Jalankan `SERAH_TERIMA.md` kalau yang berganti adalah pemegang sistem (Tim IT)

---

## 7. Keamanan sehari-hari

- Gunakan password yang panjang dan unik (jangan sama dengan akun lain)
- Simpan password di password manager, bukan di chat atau kertas
- Logout kalau memakai komputer bersama
- Jangan klik tautan mencurigakan yang mengatasnamakan HIMMAN atau admin
- Sertifikat yang diterbitkan punya QR code; kalau ada pihak meragukan keasliannya, minta mereka scan QR tersebut

---

## 8. Dokumen terkait

| Dokumen | Untuk siapa | Isi |
|---|---|---|
| `OPERASIONAL.md` | Pengurus inti | Panduan pemakaian harian (dokumen ini) |
| `MAINTENANCE.md` | Tim IT / successor | Server, backup, restore, deploy, troubleshooting |
| `SERAH_TERIMA.md` | Pembuat sistem & successor | Checklist pergantian pemegang sistem |

Dokumen ini **hidup**: kalau ada aturan atau kebiasaan baru yang berguna, tambahkan di sini.
