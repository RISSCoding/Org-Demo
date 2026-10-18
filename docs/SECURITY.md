# Kebijakan Keamanan

Keamanan data organisasi adalah prioritas utama kami. Terima kasih telah membantu menjaga Portal Organisasi dan penggunanya tetap aman.

## Versi yang Didukung

| Versi | Dukungan keamanan |
|---|---|
| `main` / rilis stabil terbaru | ✅ |
| Rilis lama | ❌ (silakan perbarui) |

*(Perbarui tabel ini sesuai kebijakan rilis Anda.)*

## Melaporkan Kerentanan

**Jangan membuka issue publik** untuk celah keamanan.

Laporkan secara privat melalui salah satu cara:
- Email: **[isi alamat email keamanan, mis. security@domainanda.com]**
- GitHub: tab *Security → Report a vulnerability* (Private Vulnerability Reporting), bila diaktifkan

Sertakan sebisa mungkin:
- Jenis dan dampak kerentanan (mis. akses data lintas organisasi, XSS, IDOR)
- Langkah mereproduksi / *proof of concept*
- Versi atau *commit* yang terdampak
- Saran perbaikan (jika ada)

Mohon **jangan** menyertakan data pribadi nyata pengguna dalam laporan.

## Yang Dapat Anda Harapkan

| Tahap | Target waktu |
|---|---|
| Konfirmasi laporan diterima | 3 hari kerja |
| Penilaian awal (valid/tidak, tingkat keparahan) | 7 hari |
| Perbaikan untuk kerentanan kritis/tinggi | Secepatnya, target 30 hari |
| Pengumuman dan kredit penemu | Setelah patch tersedia |

*(Sesuaikan dengan kapasitas tim Anda, lalu patuhi.)* Kami menerapkan **pengungkapan terkoordinasi**: harap beri kami waktu memperbaiki sebelum mengungkapkan secara publik. Dengan izin Anda, kami akan mencantumkan nama Anda sebagai penemu.

## Cakupan

**Dalam cakupan** (prioritas tinggi):
- **Kebocoran atau akses data antar organisasi (tenant)**, bypass isolasi, IDOR
- Bypass autentikasi/otorisasi, eskalasi peran, pengambilalihan akun
- Pemalsuan atau penggunaan ulang QR/tiket/sertifikat lintas tenant
- Akses berkas privat (bukti transfer, surat, sertifikat) tanpa izin
- Injeksi (SQL, XSS, SSRF, dll.), CSRF pada aksi sensitif
- Kebocoran rahasia atau konfigurasi

**Di luar cakupan:**
- Serangan *denial of service* volumetrik, atau pengujian beban tanpa izin
- *Social engineering* terhadap pengguna atau pengurus
- Temuan dari pemindai otomatis tanpa dampak nyata
- Masalah pada instalasi self-hosted yang salah konfigurasi (mis. database terbuka ke internet)
- Kerentanan di dependensi pihak ketiga tanpa jalur eksploitasi pada aplikasi ini (laporkan ke proyek hulunya)

## Pedoman Pengujian yang Aman (Safe Harbor)

Kami tidak akan menempuh jalur hukum terhadap peneliti yang bertindak dengan itikad baik dan:
- hanya menguji pada akun/tenant **milik sendiri** atau instalasi lokal,
- tidak mengakses, mengubah, atau menghapus data milik pengguna/tenant lain,
- berhenti segera setelah kerentanan terbukti dan melaporkannya,
- tidak mengganggu layanan bagi pengguna lain.

## Panduan Keamanan untuk Penyelenggara Self-Hosted

Lihat [MAINTENANCE.md](./MAINTENANCE.md) bagian Keamanan dan Checklist Go-Live. Poin terpenting: HTTPS wajib, rahasia unik dan tidak di-commit, PostgreSQL tidak terbuka ke publik, bucket/folder upload privat, backup terenkripsi dan teruji, serta pembaruan rutin.
