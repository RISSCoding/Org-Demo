import React from "react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

// Helper untuk format Rupiah
const formatRp = (amount: number | any) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(Number(amount));
};

export default async function GeneralJournalPage() {
  await requirePermission("finance:read");

  // Ambil transaksi beserta rincian jurnalnya
  const transactions = await prisma.financialTransaction.findMany({
    orderBy: { date: "desc" },
    include: {
      journalLines: {
        include: { account: true },
        orderBy: { isDebit: "desc" }, // Standar akuntansi: Debit selalu di atas Kredit
      },
      creator: { select: { fullName: true } },
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Jurnal Umum</h1>
        <p className="text-muted-foreground">Catatan kronologis seluruh transaksi (Debit & Kredit).</p>
      </div>

      <div className="rounded-md border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left">
            <tr>
              <th className="p-4 font-medium">Tanggal</th>
              <th className="p-4 font-medium">Keterangan</th>
              <th className="p-4 font-medium">Ref (Akun)</th>
              <th className="p-4 font-medium text-right">Debit</th>
              <th className="p-4 font-medium text-right">Kredit</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">Belum ada transaksi tercatat.</td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <React.Fragment key={tx.id}>
                  {/* Baris setiap Journal Line dalam satu Transaksi */}
                  {tx.journalLines.map((line, idx) => (
                    <tr key={line.id} className="hover:bg-muted/30">
                      <td className="p-4 align-top text-muted-foreground">
                        {idx === 0 ? tx.date.toLocaleDateString("id-ID") : ""}
                      </td>
                      <td className="p-4">
                        {/* Menjorok ke dalam untuk Kredit */}
                        <div className={!line.isDebit ? "ml-6" : "font-medium"}>
                          {line.account.name}
                        </div>
                        {idx === tx.journalLines.length - 1 && (
                          <div className="mt-1 text-xs text-muted-foreground italic">
                            ({tx.title})
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground">{line.account.code}</td>
                      <td className="p-4 text-right">
                        {line.isDebit ? formatRp(line.amount) : "-"}
                      </td>
                      <td className="p-4 text-right">
                        {!line.isDebit ? formatRp(line.amount) : "-"}
                      </td>
                    </tr>
                  ))}
                  {/* Garis pemisah antar transaksi */}
                  <tr className="border-b-4 border-muted/20" />
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
