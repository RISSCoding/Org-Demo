# Panduan Teknis Portal Organisasi

Untuk pengurus IT dan successor yang memegang server.

**Setup saat ini:**

- Folder aplikasi: `/home/farisfebrian/NAS_Internal/fileFaris/CODING/portal-organisasi`
- Binary Bun: `/home/farisfebrian/.proto/tools/bun/1.4.0/bun`
- Service systemd (user mode): `himman.service`
- Database: Docker container `portal-pg`, port 5433
- Domain: `http://localhost:3001` (dev), `https://[domain-kamu]` (production)

---

## Perintah harian — pakai helper `himman`

```bash
himman status    # cek aplikasi hidup atau tidak
himman logs      # log realtime (Ctrl+C untuk keluar)
himman tail      # 100 baris log terakhir
himman restart   # restart aplikasi
himman stop      # matikan aplikasi
himman start     # hidupkan aplikasi
himman backup    # backup sekarang
```

### Kalau helper tidak ada atau hilang, pakai perintah panjang

```bash
systemctl --user status himman
journalctl --user -u himman -f
systemctl --user restart himman
```

---

## Backup

**Otomatis:** setiap hari jam 2 pagi, dijalankan oleh cron.

**Lokasi:** `~/backup/himman/`

**Format:**

- `himman_db_YYYY-MM-DD_HHMM.sql.gz` — database
- `himman_uploads_YYYY-MM-DD_HHMM.tar.gz` — folder uploads (bukti, surat, sertifikat)

**Retensi:** 30 hari (yang lebih tua otomatis dihapus).

### Backup manual sebelum update

```bash
~/bin/backup-himman.sh
```

### Restore dari backup (hati-hati, ini menimpa data)

```bash
# 1. Stop aplikasi
systemctl --user stop himman

# 2. Backup dulu yang sekarang (untuk jaga-jaga)
~/bin/backup-himman.sh

# 3. Drop dan buat ulang database
psql -h localhost -p 5433 -U postgres -c "DROP DATABASE himman"
psql -h localhost -p 5433 -U postgres -c "CREATE DATABASE himman"

# 4. Restore
LATEST=$(ls -t ~/backup/himman/himman_db_*.sql.gz | head -1)
gunzip -c "$LATEST" | psql -h localhost -p 5433 -U postgres -d himman

# 5. Restore uploads (opsional, kalau berkas juga hilang)
tar -xzf ~/backup/himman/himman_uploads_[tanggal].tar.gz -C ~/NAS_Internal/fileFaris/CODING/portal-organisasi/

# 6. Start aplikasi
systemctl --user start himman
```

> Test restore setahun sekali ke database terpisah — backup yang tidak pernah ditest = tidak ada backup.

---

## Update aplikasi (deploy versi baru)

```bash
cd /home/farisfebrian/NAS_Internal/fileFaris/CODING/portal-organisasi

# 1. Backup dulu
~/bin/backup-himman.sh

# 2. Pull perubahan
git pull

# 3. Install dependency
/home/farisfebrian/.proto/tools/bun/1.4.0/bun install

# 4. Migrasi DB (kalau ada)
/home/farisfebrian/.proto/tools/bun/1.4.0/bunx prisma migrate deploy

# 5. Build
/home/farisfebrian/.proto/tools/bun/1.4.0/bun run build

# 6. Restart
systemctl --user restart himman

# 7. Cek
curl -I http://localhost:3001
```

Kalau ada masalah, restore backup dan gunakan `git log` untuk cek commit terakhir yang masih jalan.

---

## Kalau aplikasi tidak bisa diakses

Diagnosa berurutan:

```bash
# 1. Aplikasi jalan?
systemctl --user status himman

# 2. Database jalan?
docker ps | grep portal-pg

# 3. Port 3001 dipakai?
ss -tlnp | grep 3001

# 4. Ada error?
journalctl --user -u himman -n 50 --no-pager
```

### Error umum

| Pesan | Penyebab | Solusi |
|---|---|---|
| `EADDRINUSE` | Port 3001 dipakai proses lain | `ss -tlnp \| grep 3001` → kill PID |
| `Can't reach database server` | Docker `portal-pg` mati | `docker start portal-pg` |
| `password authentication failed` | `.pgpass` beda dengan `.env` | Samakan `.pgpass` dengan `.env` |
| `UntrustedHost` | NextAuth tidak percaya host | Cek `AUTH_TRUST_HOST=true` di `.env`, lalu rebuild |
| `Module not found` | Dependency berubah | `bun install` lalu `bun run build` |

---

## Docker — jangan disentuh sembarangan

**Container yang JANGAN dimatikan:**

- `portal-pg` — database aplikasi

**Container yang boleh dimatikan (kalau perlu):**

- `finance_app`, `finance_db`, `finance_tunnel` — aplikasi lain
- `web_portfolio`, `portainer`, `cloudflare_tunnel` — layanan lain

Auto-restart sudah diaktifkan untuk `portal-pg` → hidup sendiri setelah reboot.

---

## Password dan secret

Semua ada di password manager (Bitwarden / 1Password / KeePassXC):

- Password DB PostgreSQL
- `AUTH_SECRET` — untuk session login
- `QR_HMAC_SECRET` — untuk tanda tangan QR
- Password server / SSH key

> Kalau password manager hilang, semua kunci hilang. Jangan simpan cuma di satu tempat.

---

## Bun — versi spesifik

Service menunjuk ke versi Bun 1.4.0 (`/home/farisfebrian/.proto/tools/bun/1.4.0/bun`).

Kalau mau upgrade Bun:

1. Install versi baru lewat `proto`
2. Copy binary ke `/usr/local/bin/bun-1.5.0` (atau versi baru)
3. Update `ExecStart` di `~/.config/systemd/user/himman.service`
4. Jalankan:

   ```bash
   systemctl --user daemon-reload && systemctl --user restart himman
   ```

Jangan hapus folder Bun 1.4.0 sebelum yakin versi baru bekerja.
