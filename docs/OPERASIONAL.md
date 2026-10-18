# Panduan Operasional Pengurus

Dokumen ini memandu pengurus (Ketua, Sekretaris, Bendahara, dan Kepala Divisi/Departemen) dalam menggunakan panel administrasi untuk mengelola organisasi secara efisien.

> Status fitur: ✅ tersedia · 🚧 dalam pengembangan · 📋 direncanakan.
> Nama menu bisa sedikit berbeda antarversi; istilah divisi/departemen dapat disesuaikan oleh admin organisasi Anda.

---

## Daftar Isi
1. [Peran dan Hak Akses](#1-peran-dan-hak-akses)
2. [Persiapan Awal Organisasi](#2-persiapan-awal-organisasi)
3. [Manajemen Anggota dan Struktur](#3-manajemen-anggota-dan-struktur)
4. [Manajemen Keuangan (Bendahara)](#4-manajemen-keuangan-bendahara)
5. [Event dan Kepanitiaan](#5-event-dan-kepanitiaan)
6. [Administrasi Sekretariat](#6-administrasi-sekretariat)
7. [Kotak Aspirasi (Sisi Pengurus)](#7-kotak-aspirasi-sisi-pengurus)
8. [Pengaturan dan Audit Log](#8-pengaturan-dan-audit-log)
9. [Pergantian Kepengurusan](#9-pergantian-kepengurusan-regenerasi)
10. [Praktik Baik dan Kesalahan Umum](#10-praktik-baik-dan-kesalahan-umum)

---

## 1. Peran dan Hak Akses

Setiap peran hanya melihat menu yang relevan. Ringkasan umum:

| Peran | Fokus utama | Akses khas |
|---|---|---|
| Ketua / Wakil | Pengawasan menyeluruh | Persetujuan anggota, struktur, laporan, audit log |
| Sekretaris | Administrasi | Arsip surat, proposal/LPJ, rapat |
| Bendahara | Keuangan | Transaksi, verifikasi iuran, laporan keuangan |
| Kepala Departemen | Divisinya | Anggota divisi, event milik divisi |
| Sekretaris Departemen / Staf | Pendukung | Sesuai penugasan |
| Anggota | Layanan mandiri | Lihat [PANDUAN_ANGGOTA.md](./PANDUAN_ANGGOTA.md) |

Prinsip: **beri akses seperlunya** (*least privilege*). Jangan menjadikan seseorang admin hanya agar "praktis".

## 2. Persiapan Awal Organisasi

Urutan yang disarankan saat organisasi baru memakai portal:

1. Lengkapi identitas di **Pengaturan** (nama resmi, logo, kontak).
2. Susun **struktur**: pemegang jabatan inti, lalu divisi/departemen.
3. Tetapkan **nominal iuran** default.
4. **Impor anggota** lewat Excel (lihat bagian 3).
5. Tinjau dan setujui pendaftar yang berstatus *Pending*.
6. Umumkan ke anggota cara login dan melengkapi profil.

## 3. Manajemen Anggota dan Struktur

### Persetujuan anggota
Pendaftar baru berstatus *Pending*. Buka menu **Anggota**, periksa data (nama, NIM/nomor anggota, kontak), lalu **setujui** atau **tolak**. Tolak dengan alasan yang jelas agar pendaftar dapat memperbaiki datanya.

### Struktur organisasi
Di menu **Pengurus & Divisi**:
- Tentukan pemegang jabatan inti (Ketua, Wakil, Sekretaris, Bendahara).
- Tempatkan anggota ke dalam divisi/departemen.
- Atur peran di dalam divisi (Kepala Departemen, Sekretaris Departemen, atau Staf).

### Impor massal
Gunakan **Impor Mahasiswa Baru / Anggota** dengan berkas Excel (.xlsx).

Tips agar impor lancar:
- Gunakan templat resmi dari tombol *Unduh Templat*.
- Satu baris = satu anggota; **NIM/ID harus unik**.
- Hindari sel yang digabung (*merge*), spasi berlebih, dan format angka pada NIM (simpan sebagai teks agar angka nol di depan tidak hilang).
- Impor dulu 5 baris sebagai uji sebelum mengunggah ratusan baris.
- Simpan berkas asli sebagai arsip.

### Menonaktifkan anggota
Anggota yang lulus/keluar sebaiknya **dinonaktifkan**, bukan dihapus, agar riwayat kehadiran, iuran, dan sertifikat tetap utuh.

## 4. Manajemen Keuangan (Bendahara)

### Pencatatan
Catat setiap pemasukan dan pengeluaran melalui menu **Transaksi**. Sistem memakai pembukuan ***double-entry*** (berpasangan): setiap transaksi tercatat sebagai debit dan kredit sehingga rapi dan dapat diaudit.

Kebiasaan yang disarankan:
- Catat transaksi **di hari yang sama**; unggah bukti (nota/foto).
- Gunakan deskripsi yang jelas: *apa, untuk kegiatan apa, siapa penerimanya*.
- Jangan menghapus transaksi yang sudah dilaporkan. Buat **jurnal koreksi** agar jejak tetap ada.

### Verifikasi iuran
Tinjau bukti transfer di menu **Iuran Kas**. Cocokkan nominal, tanggal, dan nama pengirim dengan mutasi rekening, lalu setujui atau tolak (sertakan alasan). Status tagihan berubah menjadi **Lunas** setelah disetujui.

### Laporan
Unduh laporan bulanan melalui menu **Keuangan**: Neraca, Laba Rugi, dan Jurnal, dalam format PDF atau Excel.

Rutinitas akhir bulan:
1. Pastikan semua iuran bulan itu sudah diverifikasi.
2. Cocokkan saldo kas di sistem dengan saldo rekening/uang tunai.
3. Unduh laporan dan arsipkan.
4. Tinjau menu **Transparansi Kas**, karena itu yang dilihat anggota.

> **Catatan:** Jika organisasi Anda mengelola dana besar, konsultasikan standar pelaporan dengan pembina/auditor internal. Portal membantu pencatatan, tetapi tidak menggantikan kebijakan keuangan organisasi.

## 5. Event dan Kepanitiaan

### Membuat event
Menu **Event** → buat kegiatan baru: nama, deskripsi, waktu, lokasi, **kuota**, dan apakah berbayar/gratis.

### Kepanitiaan
1. Buka pendaftaran panitia di halaman event.
2. Atur divisi kepanitiaan (acara, humas, dokumentasi, konsumsi, dst.).
3. Seleksi pendaftar dan tetapkan ke divisi.
4. Tunjuk **satu** orang sebagai Ketua Panitia.
5. Hasil seleksi tampil di dasbor pendaftar.

### Hari-H: absensi
- **Scanner**: pindai QR tiket peserta atau KTA anggota. Gunakan ponsel dengan kamera baik dan koneksi stabil; siapkan **daftar cadangan** (cetak/offline) bila sinyal lokasi buruk.
- **Rapat Panitia**: catat kehadiran rapat dengan **kode unik** yang dibagikan saat rapat berlangsung.

### Sertifikat
Setelah acara selesai:
1. Pastikan data kehadiran sudah benar.
2. Terbitkan sertifikat **secara massal** untuk peserta/panitia yang hadir.
3. Umumkan bahwa sertifikat dapat diunduh di menu **Sertifikat**.

## 6. Administrasi Sekretariat

### Arsip surat
Catat surat masuk dan keluar di menu **Sekretariat**. Nomor surat dibuat otomatis sesuai standar organisasi. Unggah pindaian surat agar arsip lengkap.

### Proposal dan LPJ
Tautkan dokumen proposal/LPJ ke kegiatan terkait agar mudah dilacak. Sistem dapat menghasilkan **lembar pengesahan digital** yang siap ditandatangani (tanda tangan digital pengurus diatur di profil masing-masing).

## 7. Kotak Aspirasi (Sisi Pengurus)

- Tinjau aspirasi masuk secara rutin (disarankan sekali sehari).
- Beri **tanggapan** dan ubah **status** (mis. Diterima → Diproses → Selesai).
- Hormati **anonimitas**: jika pengirim memilih anonim, jangan berusaha mengidentifikasi mereka.
- Aspirasi yang berisi laporan sensitif (pelecehan, penyalahgunaan dana) hendaknya ditangani oleh pengurus inti secara tertutup.

## 8. Pengaturan dan Audit Log

- **Pengaturan**: nominal iuran default, identitas organisasi, dan konfigurasi umum lainnya.
- **Audit Log**: catatan aktivitas pengguna untuk transparansi dan keamanan. Tinjau secara berkala, terutama perubahan peran, penghapusan data, dan perubahan keuangan.

## 9. Pergantian Kepengurusan (Regenerasi)

Checklist serah terima:

- [ ] Perbarui struktur & jabatan di **Pengurus & Divisi** (jangan hapus pengurus lama; ubah perannya).
- [ ] Cabut hak akses admin pengurus yang sudah demisioner.
- [ ] Bendahara lama menyerahkan laporan akhir dan saldo terverifikasi.
- [ ] Unduh dan arsipkan laporan keuangan periode lama.
- [ ] Pindahkan kepemilikan akun **Super Admin organisasi** ke Ketua baru (jangan sampai hanya satu orang yang memegang).
- [ ] Pastikan minimal **dua** orang punya akses admin agar tidak terkunci.

## 10. Praktik Baik dan Kesalahan Umum

| Kesalahan umum | Cara menghindari |
|---|---|
| Berbagi satu akun admin untuk banyak orang | Satu orang satu akun; Audit Log jadi bermakna |
| Menghapus data yang sudah dilaporkan | Gunakan nonaktifkan/jurnal koreksi |
| Membiarkan iuran menumpuk belum diverifikasi | Jadwalkan verifikasi mingguan |
| Impor Excel tanpa uji coba | Uji 5 baris dulu |
| Hanya satu orang yang tahu cara kerja sistem | Latih minimal dua pengurus per fungsi |
| Tidak pernah memeriksa Audit Log | Jadwalkan tinjauan bulanan |

Butuh bantuan teknis? Hubungi admin platform atau lihat [PANDUAN_SUPER_ADMIN.md](./PANDUAN_SUPER_ADMIN.md).
