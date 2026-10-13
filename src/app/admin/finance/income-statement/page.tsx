import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import React from "react";

const formatRp = (amount: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount);
};

export default async function IncomeStatementPage() {
  await requirePermission("finance:read");

  // Ambil hanya akun Pendapatan dan Beban
  const accounts = await prisma.account.findMany({
    where: { type: { in: ["REVENUE", "EXPENSE"] } },
    include: { journalLines: true },
    orderBy: { code: "asc" },
  });

  let totalRevenue = 0;
  let totalExpense = 0;

  const revenues: { code: string; name: string; balance: number }[] = [];
  const expenses: { code: string; name: string; balance: number }[] = [];

  accounts.forEach((acc) => {
    let totalDebit = 0;
    let totalCredit = 0;

    acc.journalLines.forEach((line) => {
      if (line.isDebit) totalDebit += Number(line.amount);
      else totalCredit += Number(line.amount);
    });

    if (acc.type === "REVENUE") {
      // Saldo normal Pendapatan bertambah di Kredit
      const balance = totalCredit - totalDebit;
      if (balance !== 0 || acc.journalLines.length > 0) {
        revenues.push({ ...acc, balance });
        totalRevenue += balance;
      }
    } else if (acc.type === "EXPENSE") {
      // Saldo normal Beban bertambah di Debit
      const balance = totalDebit - totalCredit;
      if (balance !== 0 || acc.journalLines.length > 0) {
        expenses.push({ ...acc, balance });
        totalExpense += balance;
      }
    }
  });

  const netIncome = totalRevenue - totalExpense;
  const isSurplus = netIncome >= 0;

  return (
    <div className="space-y-6 p-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Laporan Laba Rugi</h1>
        <p className="text-muted-foreground">Laporan surplus/defisit dari pendapatan dan pengeluaran organisasi.</p>
      </div>

      <div className="rounded-md border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-bold border-b pb-2 mb-4">PENDAPATAN</h2>
        <div className="space-y-2">
          {revenues.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Belum ada pendapatan tercatat.</p>
          ) : (
            revenues.map((rev) => (
              <div key={rev.code} className="flex justify-between text-sm">
                <span>{rev.code} - {rev.name}</span>
                <span>{formatRp(rev.balance)}</span>
              </div>
            ))
          )}
        </div>
        <div className="flex justify-between font-bold mt-4 pt-2 border-t">
          <span>Total Pendapatan</span>
          <span>{formatRp(totalRevenue)}</span>
        </div>

        <h2 className="text-lg font-bold border-b pb-2 mb-4 mt-8">BEBAN / PENGELUARAN</h2>
        <div className="space-y-2">
          {expenses.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Belum ada beban tercatat.</p>
          ) : (
            expenses.map((exp) => (
              <div key={exp.code} className="flex justify-between text-sm">
                <span>{exp.code} - {exp.name}</span>
                <span>{formatRp(exp.balance)}</span>
              </div>
            ))
          )}
        </div>
        <div className="flex justify-between font-bold mt-4 pt-2 border-t">
          <span>Total Beban</span>
          <span>{formatRp(totalExpense)}</span>
        </div>

        <div className={`flex justify-between text-lg font-bold mt-8 pt-4 border-t-4 ${isSurplus ? 'text-green-600' : 'text-red-600'}`}>
          <span>{isSurplus ? "SURPLUS BERSIH (LABA)" : "DEFISIT BERSIH (RUGI)"}</span>
          <span>{formatRp(netIncome)}</span>
        </div>
      </div>
    </div>
  );
}
