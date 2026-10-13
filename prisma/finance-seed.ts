import { PrismaClient, AccountType } from '@prisma/client';

// 1. Tambahkan kata kunci 'export' agar fungsi ini bisa dibaca oleh seed.ts utama
export async function seedFinance(prisma: PrismaClient) {
  console.log('Memulai proses seeding Bagan Akun (Chart of Accounts)...');

  const accounts = [
    // --- HARTA / ASSET (Kode 1000) ---
    { code: '1110', name: 'Kas Tunai Himpunan', type: AccountType.ASSET },
    { code: '1120', name: 'Rekening Bank Organisasi', type: AccountType.ASSET },
    { code: '1130', name: 'Piutang Iuran Anggota', type: AccountType.ASSET },
    { code: '1140', name: 'Piutang Sponsorship', type: AccountType.ASSET },

    // --- KEWAJIBAN / LIABILITY (Kode 2000) ---
    { code: '2110', name: 'Utang Operasional / Pihak Ketiga', type: AccountType.LIABILITY },
    { code: '2120', name: 'Dana Titipan Kegiatan', type: AccountType.LIABILITY },

    // --- EKUITAS / EQUITY (Kode 3000) ---
    { code: '3110', name: 'Saldo Dana Awal / Ekuitas', type: AccountType.EQUITY },

    // --- PENDAPATAN / REVENUE (Kode 4000) ---
    { code: '4110', name: 'Pendapatan Iuran Anggota (Kas)', type: AccountType.REVENUE },
    { code: '4120', name: 'Pendapatan Kemahasiswaan Universitas', type: AccountType.REVENUE },
    { code: '4130', name: 'Pendapatan Sponsorship Event', type: AccountType.REVENUE },
    { code: '4140', name: 'Pendapatan Donasi / Alumni', type: AccountType.REVENUE },
    { code: '4150', name: 'Pendapatan Usaha Dana (Danus)', type: AccountType.REVENUE },

    // --- BEBAN / EXPENSE (Kode 5000) ---
    { code: '5110', name: 'Beban Operasional Rutin', type: AccountType.EXPENSE },
    { code: '5120', name: 'Beban Pelaksanaan Kegiatan (Event)', type: AccountType.EXPENSE },
    { code: '5130', name: 'Beban Kesekretariatan & ATK', type: AccountType.EXPENSE },
    { code: '5140', name: 'Beban Konsumsi & Rapat', type: AccountType.EXPENSE },
    { code: '5150', name: 'Beban Pemeliharaan Inventaris', type: AccountType.EXPENSE },
  ];

  for (const acc of accounts) {
    await prisma.account.upsert({
      where: { code: acc.code },
      update: {
        name: acc.name,
        type: acc.type
      },
      create: {
        code: acc.code,
        name: acc.name,
        type: acc.type,
      },
    });
  }

  console.log(`✅ Seeding keuangan selesai! Berhasil menyiapkan ${accounts.length} akun dasar.`);
}

// 2. Blok main().catch().finally() dihapus karena eksekusi dilakukan di seed.ts utama
// 3. const prisma = new PrismaClient() di baris atas juga dihapus karena 'prisma' sudah di-passing sebagai parameter (argumen)
