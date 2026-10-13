"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { rupiah } from "@/lib/finance";
import { cardCls } from "@/lib/ui";

type Props = {
  monthly: { label: string; income: number; expense: number }[];
  expenseByCategory: { name: string; value: number }[];
};

const compact = (v: number) => new Intl.NumberFormat("id-ID", { notation: "compact" }).format(v);
const tooltipStyle = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" };
const tick = { fill: "currentColor", fontSize: 12 };

export function FinanceCharts({ monthly, expenseByCategory }: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className={`${cardCls} p-5 text-muted-foreground`}>
        <h3 className="mb-4 font-medium text-foreground">Pemasukan vs pengeluaran (6 bulan)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.15} vertical={false} />
            <XAxis dataKey="label" tick={tick} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={compact} tick={tick} axisLine={false} tickLine={false} width={44} />
            <Tooltip formatter={(v) => rupiah(Number(v))} contentStyle={tooltipStyle} cursor={{ fill: "currentColor", opacity: 0.08 }} />
            <Legend />
            <Bar dataKey="income" name="Pemasukan" fill="var(--emerald)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Pengeluaran" fill="#e11d48" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={`${cardCls} p-5 text-muted-foreground`}>
        <h3 className="mb-4 font-medium text-foreground">Pengeluaran per kategori (6 bulan)</h3>
        {expenseByCategory.length === 0 ? (
          <p className="grid h-[260px] place-items-center text-sm">Belum ada pengeluaran.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={expenseByCategory} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.15} horizontal={false} />
              <XAxis type="number" tickFormatter={compact} tick={tick} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={tick} axisLine={false} tickLine={false} width={96} />
              <Tooltip formatter={(v) => rupiah(Number(v))} contentStyle={tooltipStyle} cursor={{ fill: "currentColor", opacity: 0.08 }} />
              <Bar dataKey="value" name="Pengeluaran" fill="var(--gold)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
