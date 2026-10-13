import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

const formatRp = (amount: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount);
};

export default async function LedgerSummaryPage() {
  await requirePermission("finance:read");

  // Ambil semua akun beserta jurnalnya untuk dihitung saldonya
  const accounts = await prisma.account.findMany({
    include: { journalLines: true },
    orderBy: { code: "asc" },
  });

  // Hitung Saldo Akhir Berjalan
  const ledgerBalances = accounts.map((acc) => {
    let totalDebit = 0;
    let totalCredit = 0;

    acc.journalLines.forEach((line) => {
      if (line.isDebit) totalDebit += Number(line.amount);
      else totalCredit += Number(line.amount);
    });

    // Saldo normal Harta (ASSET) dan Beban (EXPENSE) bertambah di Debit
    // Saldo normal Kewajiban (LIABILITY), Ekuitas (EQUITY), Pendapatan (REVENUE) bertambah di Kredit
    let balance = 0;
    if (acc.type === "ASSET" || acc.type === "EXPENSE") {
      balance = totalDebit - totalCredit;
    } else {
      balance = totalCredit - totalDebit;
    }

    return { ...acc, balance };
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ringkasan Buku Besar</h1>
        <p className="text-muted-foreground">Saldo berjalan untuk setiap akun keuangan organisasi.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ledgerBalances
          .filter(acc => acc.balance > 0 || acc.journalLines.length > 0) // Sembunyikan akun bersaldo 0 yang belum pernah dipakai
          .map((acc) => (
          <div key={acc.id} className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between space-x-2">
              <p className="text-sm font-medium text-muted-foreground">{acc.code} - {acc.name}</p>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                acc.type === 'ASSET' ? 'bg-blue-100 text-blue-700' :
                acc.type === 'REVENUE' ? 'bg-green-100 text-green-700' :
                acc.type === 'EXPENSE' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {acc.type}
              </span>
            </div>
            <div className="mt-4 flex items-baseline text-2xl font-bold">
              {formatRp(acc.balance)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
