# Checklist Serah Terima Sistem HIMMAN

Dijalankan saat pembuat sistem lulus dan menyerahkan ke pengurus berikutnya.

## Akses & akun

- [ ] Password manager di-share ke minimal 2 pengurus inti
- [ ] Akun SSH server diserahkan ke successor
- [ ] Akses GitHub repo (kalau perlu ubah kode)
- [ ] Akses Docker (grup `docker` atau sudo)
- [ ] Akses domain & DNS (kalau ada)

## Dokumentasi

- [ ] `OPERASIONAL.md` sudah dibaca pengurus inti baru
- [ ] `MAINTENANCE.md` sudah dijelaskan ke successor
- [ ] Successor sudah pernah **praktik sendiri**:
  - [ ] Lihat log: `himman logs`
  - [ ] Restart aplikasi: `himman restart`
  - [ ] Backup manual: `himman backup`
  - [ ] Restore dari backup ke DB test
  - [ ] Deploy perubahan (kalau ada update kode)

## Backup & pemulihan

- [ ] Cron backup jalan (cek: `crontab -l | grep himman`)
- [ ] Backup 7 hari terakhir ada di `~/backup/himman/`
- [ ] Successor sudah pernah restore-test
- [ ] Retensi 30 hari tidak menumpuk disk

## Data

- [ ] Anggota satu periode sudah terisi lengkap
- [ ] Transaksi keuangan minimal 3 bulan tercatat
- [ ] File surat dan sertifikat di `uploads/` sudah lengkap
- [ ] Password semua pengurus aktif sudah direset (kalau ada yang keluar)

## Sebelum benar-benar lepas

- [ ] Successor sudah handle **1 bulan penuh operasional tanpa kamu**
- [ ] Kamu sudah pamit resmi (tidak lagi jadi kontak darurat)
- [ ] Grup "Tim IT HIMMAN" aktif dengan successor
- [ ] Kamu masih bisa dihubungi 6 bulan pertama (kalau emergency)

---

## Setelah serah terima

Setiap kali successor menghadapi masalah baru, tambahkan ke `MAINTENANCE.md`.
Dokumen ini **hidup** — bukan sekali tulis lalu dilupakan.
