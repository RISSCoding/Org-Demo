# ADR-0002: Rencana RLS (Row-Level Security)

- **Status:** Diusulkan
- **Tanggal:** 2026-11-10

## Konteks

Fase A (isolasi tenant) hampir lengkap: A2 (findUnique/upsert/shell-counts) dan
A3 (organization_id NOT NULL + unique per tenant) sudah ditutup di PR #1.
A4 (RLS) masih terbuka.

Isolasi saat ini bertumpu pada lapisan aplikasi (`getTenantPrisma`) yang
menyuntikkan `organizationId` ke setiap query. Ratchet (`RAW_ACCESS_BASELINE`)
menangkap regresi struktural (kode baru yang memakai `prisma` mentah ke model
bertenant), tapi tidak menangkap query dinamis (raw SQL, template string).
RLS di database menutup celah ini.

## Keputusan bertahap

### #4c-1 (PR ini): policy terpasang, belum ditegakkan

- Migrasi `20261110120000_rls_policies`: `ENABLE ROW LEVEL SECURITY` +
  `CREATE POLICY tenant_isolation` di 23 tabel bertenant.
- `FORCE ROW LEVEL SECURITY` **sengaja ditunda**. Tanpa FORCE, owner tabel
  (postgres — role yang dipakai Prisma) melewati RLS, sehingga aplikasi
  berjalan seperti biasa.
- `[bocor A4-rls]` berubah menjadi `it()` (karena `relrowsecurity=true`).
- Test baru `[bocor A4-enforcement]` tetap merah sampai #4c-2.

### #4c-2: penegakan

- Refactor `getTenantPrisma`: bungkus setiap operasi dalam `$transaction` dengan
  `set_config('app.current_org', $1, true)` sebelum query. Konteks berlaku
  selama transaksi (is_local=true); setelah commit, hilang.
- **Tabel yang dikecualikan dari FORCE** (dengan policy khusus atau tanpa
  policy yang membatasi):

  | Tabel | Alasan |
  |---|---|
  | `users` | Login mencari user berdasarkan NIM/email lintas tenant, sebelum tahu `organizationId`. |
  | `password_reset_tokens` | Alur reset tidak punya sesi; token dicari dulu, user dan org menyusul. |
  | `certificates` | Verifikasi publik (`/verify-certificate/[id]`) mencari berdasarkan nomor, tanpa tau tenant. |
  | `feedbacks` | Pelacakan aspirasi anonim berdasarkan `trackingCode`, tanpa tau tenant. |

  Tabel-tabel ini tetap `ENABLE` (supaya `[bocor A4-rls]` konsisten) tapi tanpa
  `FORCE`, dan policy-nya perlu dirancang agar data minimal tetap bisa dibaca
  di jalur publik. Detail teknis di PR #4c-2.

- Cron script (`syncOverdue`, `dues-monthly-generate`) membungkus batch op-nya
  dalam transaksi per tenant.
- Setelah semua jalur aman, migrasi baru mengaktifkan `FORCE` di tabel
  non-exempt. `[bocor A4-enforcement]` menjadi `it()`.

### #4c-3 (opsional): role DB non-owner

- Role `portal_app` (non-superuser, bukan owner) untuk runtime. Migrasi tetap
  pakai `postgres`. Defense in depth: superuser hanya untuk migrasi, aplikasi
  tersambung dengan role terbatas.

## Konsekuensi

**Positif**
- Policy RLS ada di DB, siap untuk penegakan.
- `[bocor A4-enforcement]` menjadi pengingat visual bahwa enforcement belum aktif.
- Rollback jelas: hapus migrasi + `DROP POLICY`, atau `ALTER TABLE ... DISABLE ROW LEVEL SECURITY`.

**Negatif / risiko**
- #4c-1 sendiri tidak menegakkan apa pun. Ia hanya menyiapkan infrastruktur.
- #4c-2 menyentuh hampir semua handler (dampak lebar).
- Performa: `set_config` per transaksi menambah latensi kecil. Per-query
  transaction (kalau dipilih) bisa 2-3× lebih lambat pada halaman dengan banyak
  query paralel. Optimasi per-request transaction via `withTenant` ditunda
  sampai profiling menunjukkan perlu.

## Tindak lanjut

- [ ] #4c-2: enforcement + exempt list + handler migration.
- [ ] #4c-3: role DB non-owner.
- [ ] Perbarui `docs/ARSITEKTUR_MULTI_TENANT.md` bagian 5.2 (RLS) setelah #4c-2.
