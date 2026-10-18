# Panduan Kontribusi

Kami sangat terbuka untuk kontribusi dalam bentuk apa pun: kode, desain, dokumentasi, atau laporan *bug*.

## Alur Kerja Git
1. Lakukan *Fork* pada repositori ini.
2. Buat *branch* baru dari `main` (misal: `feat/nama-fitur` atau `fix/nama-bug`).
3. Lakukan perubahan.
4. Jalankan pengujian: `bun run lint`, `bun run typecheck`, dan `bun test`.
5. Kirim *Pull Request* (PR) dengan penjelasan yang jelas mengenai apa yang diubah dan mengapa.

## Gaya Penulisan Kode
- Gunakan TypeScript (strict mode).
- Ikuti konfigurasi ESLint dan Prettier yang sudah ada.
- Selalu tambahkan migrasi Prisma jika mengubah skema database.
