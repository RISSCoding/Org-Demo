import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import React from "react";

const formatRp = (amount: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount);
};

export default async function BalanceSheetPage() {
  await requirePermission("finance:read");

  // Ambil SEMUA akun untuk menghitung posisi keuangan secara utuh
  const accounts = await prisma.account.findMany({
    include: { journalLines: true },
    orderBy: { code: "asc" },
  });

  const assets: { code: string; name: string; balance: number }[] = [];
  const liabilities: { code: string; name: string; balance: number }[] = [];
  const equities: { code: string; name: string; balance: number }[] = [];

  let totalAsset = 0;
  let totalLiability = 0;
  let totalEquity = 0;

  // Variabel untuk menghitung Laba/Rugi Berjalan
  let totalRevenue = 0;
  let totalExpense = 0;

  accounts.forEach((acc) => {
    let totalDebit = 0;
    let totalCredit = 0;

    acc.journalLines.forEach((line) => {
      if (line.isDebit) totalDebit += Number(line.amount);
      else totalCredit += Number(line.amount);
    });

    const balanceDebit = totalDebit - totalCredit;
    const balanceCredit = totalCredit - totalDebit;

    if (acc.type === "ASSET" && (balanceDebit !== 0 || acc.journalLines.length > 0)) {
      assets.push({ ...acc, balance: balanceDebit });
      totalAsset += balanceDebit;
    }
    else if (acc.type === "LIABILITY" && (balanceCredit !== 0 || acc.journalLines.length > 0)) {
      liabilities.push({ ...acc, balance: balanceCredit });
      totalLiability += balanceCredit;
    }
    else if (acc.type === "EQUITY" && (balanceCredit !== 0 || acc.journalLines.length > 0)) {
      equities.push({ ...acc, balance: balanceCredit });
      totalEquity += balanceCredit;
    }
    // Hitung pendapatan dan pengeluaran untuk mencari Surplus/Defisit Berjalan
    else if (acc.type === "REVENUE") {
      totalRevenue += balanceCredit;
    }
    else if (acc.type === "EXPENSE") {
      totalExpense += balanceDebit;
    }
  });

  // KUNCI NERACA: Masukkan Surplus/Defisit dari Laba Rugi ke dalam Ekuitas
  const currentEarnings = totalRevenue - totalExpense;
  totalEquity += currentEarnings;

  const totalLiabilityAndEquity = totalLiability + totalEquity;

  // Pengecekan keseimbangan (Balancing Check)
  const isBalanced = totalAsset === totalLiabilityAndEquity;

  return (
    <div className="space-y-6 p-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Neraca (Balance Sheet)</h1>
        <p className="text-muted-foreground">Posisi keuangan organisasi yang menunjukkan Harta = Kewajiban + Ekuitas.</p>

        {!isBalanced && (
          <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-md border border-red-200">
            <strong>Peringatan:</strong> Neraca tidak seimbang (Unbalanced). Terdapat selisih sebesar {formatRp(Math.abs(totalAsset - totalLiabilityAndEquity))}. Periksa integritas jurnal.
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* KOLOM HARTA (ASSET) */}
        <div className="rounded-md border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold border-b pb-2 mb-4 text-blue-700">AKTIVA (HARTA)</h2>
          <div className="space-y-2">
            {assets.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Belum ada aset tercatat.</p>
            ) : (
              assets.map((ast) => (
                <div key={ast.code} className="flex justify-between text-sm">
                  <span>{ast.code} - {ast.name}</span>
                  <span>{formatRp(ast.balance)}</span>
                </div>
              ))
            )}
          </div>
          <div className="flex justify-between text-lg font-bold mt-8 pt-4 border-t-4 border-blue-200">
            <span>TOTAL AKTIVA</span>
            <span>{formatRp(totalAsset)}</span>
          </div>
        </div>

        {/* KOLOM KEWAJIBAN & EKUITAS (PASIVA) */}
        <div className="space-y-6">
          <div className="rounded-md border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-bold border-b pb-2 mb-4 text-orange-700">PASIVA (KEWAJIBAN)</h2>
            <div className="space-y-2">
              {liabilities.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Belum ada kewajiban tercatat.</p>
              ) : (
                liabilities.map((lia) => (
                  <div key={lia.code} className="flex justify-between text-sm">
                    <span>{lia.code} - {lia.name}</span>
                    <span>{formatRp(lia.balance)}</span>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-between font-bold mt-4 pt-2 border-t">
              <span>Total Kewajiban</span>
              <span>{formatRp(totalLiability)}</span>
            </div>

            <h2 className="text-lg font-bold border-b pb-2 mb-4 mt-8 text-green-700">EKUITAS (MODAL)</h2>
            <div className="space-y-2">
              {equities.map((eq) => (
                <div key={eq.code} className="flex justify-between text-sm">
                  <span>{eq.code} - {eq.name}</span>
                  <span>{formatRp(eq.balance)}</span>
                </div>
              ))}
              {/* Laba/Rugi Berjalan disuntikkan secara dinamis */}
              <div className="flex justify-between text-sm font-medium text-green-700">
                <span>3999 - Surplus / Defisit Berjalan</span>
                <span>{formatRp(currentEarnings)}</span>
              </div>
            </div>
            <div className="flex justify-between font-bold mt-4 pt-2 border-t">
              <span>Total Ekuitas</span>
              <span>{formatRp(totalEquity)}</span>
            </div>

            <div className={`flex justify-between text-lg font-bold mt-8 pt-4 border-t-4 ${isBalanced ? 'border-green-200' : 'border-red-200 text-red-600'}`}>
              <span>TOTAL PASIVA & EKUITAS</span>
              <span>{formatRp(totalLiabilityAndEquity)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
