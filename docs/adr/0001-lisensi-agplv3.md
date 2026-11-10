# ADR-0001: Lisensi AGPL-3.0-only

- **Status:** Diusulkan (menunggu konfirmasi pemegang hak cipta)
- **Tanggal:** 2026-11-10

## Konteks

Portal Organisasi dirancang sebagai platform open-source, *self-hostable*, dan multi-tenant yang kelak
boleh ditawarkan sebagai layanan terhosting. Repositori ini sebelumnya berlisensi MIT. Dokumen
`ARSITEKTUR_MULTI_TENANT.md` (bagian 14, risiko #1) membiarkan pilihan MIT/Apache vs AGPL terbuka.

Dengan lisensi permisif (MIT/Apache), pihak lain boleh mengambil kode ini, memodifikasinya, dan
menjalankannya sebagai SaaS tertutup tanpa mengembalikan perubahan apa pun kepada komunitas.

## Keputusan

Memakai **GNU Affero General Public License v3.0 only** (`AGPL-3.0-only`).

## Konsekuensi

**Positif**
- Siapa pun yang menjalankan versi modifikasi sebagai layanan jaringan wajib menyediakan kode sumber
  modifikasinya kepada penggunanya (klausul jaringan AGPL §13). Ini menutup celah SaaS tertutup.
- Organisasi yang *self-host* tanpa memodifikasi kode tidak terpengaruh secara praktis.

**Negatif / risiko**
- Beberapa perusahaan melarang dependensi AGPL secara kebijakan; adopsi korporat bisa lebih sulit.
- Pindah dari MIT hanya sah bila **semua** pemegang hak cipta atas kode yang ada menyetujui. Periksa
  riwayat kontributor sebelum rilis; kode yang sudah dirilis di bawah MIT tetap tersedia di bawah MIT.
- Opsi lisensi ganda (komersial) di masa depan butuh persetujuan kontributor (mis. CLA/DCO).

**Kompatibilitas dependensi**
Dependensi langsung yang terpantau di `package.json` berlisensi permisif (MIT/Apache-2.0/ISC/BSD) dan
dapat digabungkan dalam karya AGPL. Jalankan pemeriksaan lisensi di CI sebelum rilis publik.

## Tindak lanjut
- [ ] Konfirmasi seluruh pemegang hak cipta menyetujui perpindahan.
- [ ] Perbarui bagian "Lisensi" di README (dump yang saya terima terpotong sebelum bagian itu).
- [ ] Tambahkan pemeriksaan lisensi dependensi ke CI.
