import Link from "next/link";
import { Download, FileSpreadsheet } from "lucide-react";
import { Badge } from "@/components/badge";
import { FilterForm } from "@/components/filter-form";
import { formatDate } from "@/lib/datetime";
import { currentMonthKey, dateKey, monthLabel, rupiah, shiftMonth } from "@/lib/finance";
import {
  ACCOUNT_TYPE_LABEL,
  balanceSheet,
  generalLedger,
  incomeStatement,
  isReportKey,
  journalEntries,
  parsePeriod,
  periodLabel,
  periodLastInstant,
  REPORT_TABS,
  trialBalance,
  type Book,
  type ReportKey,
  type StatementRow,
} from "@/lib/finance-ledger";
import { loadBook, resolveScope } from "@/lib/finance-statements";
import { prisma } from "@/lib/prisma";
import { alertErr, btnLine, btnPrimary, cardCls, inputCls } from "@/lib/ui";

export type ReportSearchParams = { tab?: string; from?: string; to?: string; scope?: string; account?: string };

const th = "px-4 py-3 text-left text-sm font-semibold text-foreground";
const td = "px-4 py-2.5 text-sm align-top";
const num = "whitespace-nowrap text-right tabular-nums";
const JOURNAL_LIMIT = 100;
const LEDGER_LIMIT = 300;

/** Bulan-bulan dari transaksi pertama sampai sekarang, terbaru di atas (maks. 60). */
async function monthChoices(extra: (string | undefined)[]) {
  const first = await prisma.financialTransaction.aggregate({ _min: { date: true } });
  const now = currentMonthKey();
  const start = first._min.date ? dateKey(first._min.date).slice(0, 7) : now;
  const keys = new Set<string>();
  for (let k = now, i = 0; k >= start && i < 60; k = shiftMonth(k, -1), i++) keys.add(k);
  for (const k of extra) if (k) keys.add(k);
  return [...keys].sort().reverse();
}

/**
 * Laporan keuangan (jurnal umum, buku besar, neraca, laba rugi) dengan filter periode dan unduhan Excel.
 * `staff`: panel admin. Staf boleh memilih menyertakan transaksi yang belum diverifikasi;
 * panel anggota (`staff={false}`) selalu hanya melihat yang terverifikasi.
 */
export async function FinanceReports({
  staff,
  basePath,
  sp,
}: {
  staff: boolean;
  basePath: string;
  sp: ReportSearchParams;
}) {
  const keys = parsePeriod(sp);
  const scope = resolveScope(staff, sp.scope);
  const tab: ReportKey = isReportKey(sp.tab) ? sp.tab : "journal";

  const [book, months] = await Promise.all([loadBook({ keys, scope }), monthChoices([keys.from, keys.to])]);

  const query = (extra: Record<string, string | undefined> = {}) => {
    const p = new URLSearchParams();
    const all = { tab, from: keys.from, to: keys.to, scope: staff && scope === "verified" ? "verified" : undefined, ...extra };
    for (const [k, v] of Object.entries(all)) if (v) p.set(k, v);
    return p.toString();
  };
  const hrefFor = (extra: Record<string, string | undefined>) => `${basePath}?${query(extra)}`;
  const exportHref = (report: string) => {
    const p = new URLSearchParams({ report, scope });
    if (keys.from) p.set("from", keys.from);
    if (keys.to) p.set("to", keys.to);
    return `/api/finance/export?${p}`;
  };
  const tabLabel = REPORT_TABS.find((t) => t.key === tab)!.label;
  const sel = `${inputCls} w-auto`;

  return (
    <section id="laporan" className="scroll-mt-20 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--s-head)]">Laporan keuangan</h2>
          <p className="text-sm text-muted-foreground">
            Jurnal umum, buku besar, neraca, dan laba rugi di satu tempat. Semuanya bisa diunduh sebagai Excel.
          </p>
        </div>
        <a href={exportHref("all")} className={btnPrimary}>
          <FileSpreadsheet className="size-4" /> Unduh semua (Excel)
        </a>
      </div>

      <FilterForm action={basePath} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="tab" value={tab} />
        {tab === "ledger" && sp.account && <input type="hidden" name="account" value={sp.account} />}
        <select name="from" defaultValue={keys.from ?? ""} className={sel} aria-label="Dari bulan">
          <option value="">Dari awal</option>
          {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
        </select>
        <select name="to" defaultValue={keys.to ?? ""} className={sel} aria-label="Sampai bulan">
          <option value="">Sampai sekarang</option>
          {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
        </select>
        {staff && (
          <select name="scope" defaultValue={scope === "verified" ? "verified" : ""} className={sel} aria-label="Cakupan transaksi">
            <option value="">Termasuk belum diverifikasi</option>
            <option value="verified">Hanya terverifikasi</option>
          </select>
        )}
      </FilterForm>

      {staff && scope === "verified" && book.unverifiedExcluded > 0 && (
        <p className="rounded-sm border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-4 py-2.5 text-sm">
          <strong>{book.unverifiedExcluded}</strong> transaksi pada periode ini belum diverifikasi dan tidak ikut dihitung.{" "}
          <Link href="/admin/finance/transactions?status=unverified" className="font-medium underline underline-offset-4">Tinjau</Link>
        </p>
      )}
      {staff && scope === "all" && (
        <p className="text-xs text-muted-foreground">
          Termasuk transaksi yang belum diverifikasi (ditandai “Belum diverifikasi”). Pilih “Hanya terverifikasi” untuk angka resmi.
        </p>
      )}
      {!staff && <p className="text-xs text-muted-foreground">Hanya memuat transaksi yang sudah diverifikasi bendahara.</p>}

      <nav aria-label="Jenis laporan" className="flex flex-wrap gap-1 border-b border-border">
        {REPORT_TABS.map((t) => (
          <Link
            key={t.key}
            href={hrefFor({ tab: t.key, account: undefined })}
            scroll={false}
            aria-current={t.key === tab ? "page" : undefined}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm transition-colors ${
              t.key === tab
                ? "border-[#ffa500] font-semibold text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {tab === "balance-sheet" ? (
            <>Posisi keuangan {periodEndText(book)}</>
          ) : (
            <>Periode: <span className="font-medium text-foreground">{periodLabel(keys)}</span></>
          )}
        </p>
        <a href={exportHref(tab)} className={btnLine}>
          <Download className="size-4" /> Unduh Excel — {tabLabel}
        </a>
      </div>

      {tab === "journal" && <JournalView book={book} staff={staff} />}
      {tab === "ledger" && <LedgerView book={book} account={sp.account} ledgerHref={(code) => hrefFor({ tab: "ledger", account: code })} backHref={hrefFor({ tab: "ledger", account: undefined })} />}
      {tab === "balance-sheet" && <BalanceSheetView book={book} />}
      {tab === "income-statement" && <IncomeStatementView book={book} />}
    </section>
  );
}

function periodEndText(book: Book) {
  const end = periodLastInstant(book.period);
  return end ? `per ${formatDate(end)}` : "dari seluruh transaksi tercatat";
}

const Empty = ({ children }: { children: React.ReactNode }) => (
  <p className={`${cardCls} p-6 text-sm text-muted-foreground`}>{children}</p>
);

// ---------------------------------------------------------------- Jurnal Umum

function JournalView({ book, staff }: { book: Book; staff: boolean }) {
  const entries = journalEntries(book);
  if (entries.length === 0) return <Empty>Tidak ada jurnal pada periode ini.</Empty>;
  const shown = entries.slice(-JOURNAL_LIMIT).reverse(); // terbaru di atas
  const debit = entries.reduce((a, e) => a + e.debit, 0);
  const credit = entries.reduce((a, e) => a + e.credit, 0);

  return (
    <div className="space-y-2">
      <div className={`${cardCls} overflow-x-auto`}>
        <table className="w-full min-w-[720px]">
          <thead className="border-b border-border">
            <tr>
              <th className={th}>Tanggal</th>
              <th className={th}>Keterangan</th>
              <th className={th}>Akun</th>
              <th className={`${th} text-right`}>Debit</th>
              <th className={`${th} text-right`}>Kredit</th>
            </tr>
          </thead>
          {shown.map((e) => (
            <tbody key={e.txId} className="border-b border-border">
              {e.lines.map((l, i) => (
                <tr key={i}>
                  <td className={`${td} whitespace-nowrap text-muted-foreground`}>
                    {i === 0 && (
                      <>
                        {formatDate(e.date)}
                        <span className="block text-[11px]">{e.number}</span>
                      </>
                    )}
                  </td>
                  <td className={td}>
                    <div className={l.credit > 0 ? "pl-6" : "font-medium"}>{l.name}</div>
                    {i === e.lines.length - 1 && (
                      <p className="mt-0.5 text-xs italic text-muted-foreground">
                        ({e.title}) {staff && !e.verified && <Badge tone="warn">Belum diverifikasi</Badge>}
                      </p>
                    )}
                  </td>
                  <td className={`${td} text-muted-foreground`}>{l.code}</td>
                  <td className={`${td} ${num}`}>{l.debit > 0 ? rupiah(l.debit) : "—"}</td>
                  <td className={`${td} ${num}`}>{l.credit > 0 ? rupiah(l.credit) : "—"}</td>
                </tr>
              ))}
            </tbody>
          ))}
          <tfoot className="bg-muted/50 font-semibold">
            <tr>
              <td className={td} colSpan={3}>Total {entries.length} jurnal</td>
              <td className={`${td} ${num}`}>{rupiah(debit)}</td>
              <td className={`${td} ${num}`}>{rupiah(credit)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      {entries.length > JOURNAL_LIMIT && (
        <p className="text-xs text-muted-foreground">
          Menampilkan {JOURNAL_LIMIT} jurnal terbaru dari {entries.length}. Unduh Excel untuk seluruhnya.
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Buku Besar

function LedgerView({
  book,
  account,
  ledgerHref,
  backHref,
}: {
  book: Book;
  account?: string;
  ledgerHref: (code: string) => string;
  backHref: string;
}) {
  const detail = account ? generalLedger(book).find((l) => l.account.code === account) : undefined;

  if (detail) {
    const a = detail.account;
    const rows = detail.entries.slice(-LEDGER_LIMIT);
    const cut = detail.entries.length - rows.length;
    // saldo tepat sebelum baris pertama yang ditampilkan
    const startBalance = cut === 0 ? detail.opening : detail.entries[cut - 1].balance;
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link href={backHref} scroll={false} className="text-sm font-medium text-[var(--gold-text)] underline underline-offset-4 hover:no-underline">
            ← Semua akun
          </Link>
          <h3 className="font-semibold">{a.code} — {a.name}</h3>
          <Badge>{ACCOUNT_TYPE_LABEL[a.type]}</Badge>
        </div>
        <div className={`${cardCls} overflow-x-auto`}>
          <table className="w-full min-w-[720px]">
            <thead className="border-b border-border">
              <tr>
                <th className={th}>Tanggal</th>
                <th className={th}>Keterangan</th>
                <th className={th}>Ref</th>
                <th className={`${th} text-right`}>Debit</th>
                <th className={`${th} text-right`}>Kredit</th>
                <th className={`${th} text-right`}>Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="text-muted-foreground">
                <td className={td} />
                <td className={`${td} italic`}>{cut === 0 ? "Saldo awal" : "Saldo sebelum entri di bawah"}</td>
                <td className={td} /><td className={td} /><td className={td} />
                <td className={`${td} ${num}`}>{rupiah(startBalance)}</td>
              </tr>
              {rows.map((e, i) => (
                <tr key={i}>
                  <td className={`${td} whitespace-nowrap`}>{formatDate(e.date)}</td>
                  <td className={td}>{e.title}</td>
                  <td className={`${td} text-muted-foreground`}>{e.ref}</td>
                  <td className={`${td} ${num}`}>{e.debit > 0 ? rupiah(e.debit) : "—"}</td>
                  <td className={`${td} ${num}`}>{e.credit > 0 ? rupiah(e.credit) : "—"}</td>
                  <td className={`${td} ${num}`}>{rupiah(e.balance)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-muted/50 font-semibold">
              <tr>
                <td className={td} colSpan={3}>Total mutasi / saldo akhir</td>
                <td className={`${td} ${num}`}>{rupiah(detail.debit)}</td>
                <td className={`${td} ${num}`}>{rupiah(detail.credit)}</td>
                <td className={`${td} ${num}`}>{rupiah(detail.closing)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">
          Saldo pada sisi normal akun (Harta dan Beban bertambah di debit; lainnya di kredit).
          {cut > 0 && ` Menampilkan ${LEDGER_LIMIT} entri terbaru dari ${detail.entries.length}; unduh Excel untuk seluruhnya.`}
        </p>
      </div>
    );
  }

  const t = trialBalance(book);
  if (t.rows.length === 0) return <Empty>Belum ada akun yang bergerak pada periode ini.</Empty>;
  return (
    <div className="space-y-2">
      <div className={`${cardCls} overflow-x-auto`}>
        <table className="w-full min-w-[760px]">
          <thead className="border-b border-border">
            <tr>
              <th className={th}>Akun</th>
              <th className={th}>Jenis</th>
              <th className={`${th} text-right`}>Saldo awal</th>
              <th className={`${th} text-right`}>Debit</th>
              <th className={`${th} text-right`}>Kredit</th>
              <th className={`${th} text-right`}>Saldo akhir</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {t.rows.map((r) => (
              <tr key={r.account.id}>
                <td className={td}>
                  <Link href={ledgerHref(r.account.code)} scroll={false} className="font-medium underline-offset-4 hover:underline">
                    {r.account.code} — {r.account.name}
                  </Link>
                </td>
                <td className={`${td} text-muted-foreground`}>{ACCOUNT_TYPE_LABEL[r.account.type]}</td>
                <td className={`${td} ${num}`}>{rupiah(r.opening)}</td>
                <td className={`${td} ${num}`}>{r.debit > 0 ? rupiah(r.debit) : "—"}</td>
                <td className={`${td} ${num}`}>{r.credit > 0 ? rupiah(r.credit) : "—"}</td>
                <td className={`${td} ${num} font-medium`}>{rupiah(r.closing)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-muted/50 font-semibold">
            <tr>
              <td className={td} colSpan={3}>Total mutasi</td>
              <td className={`${td} ${num}`}>{rupiah(t.movementDebit)}</td>
              <td className={`${td} ${num}`}>{rupiah(t.movementCredit)}</td>
              <td className={td} />
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        Pilih akun untuk melihat rincian buku besarnya. Neraca saldo {t.balanced ? "seimbang (debit = kredit)" : "TIDAK seimbang — periksa jurnal"}.
        Lembar “Neraca Saldo” ada di file Excel.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- Neraca

function StatementList({ rows, empty }: { rows: StatementRow[]; empty: string }) {
  if (rows.length === 0) return <p className="text-sm italic text-muted-foreground">{empty}</p>;
  return (
    <div className="space-y-1.5">
      {rows.map((r) => (
        <div key={r.code} className="flex justify-between gap-3 text-sm">
          <span>{r.code} — {r.name}</span>
          <span className={num}>{rupiah(r.amount)}</span>
        </div>
      ))}
    </div>
  );
}

const Total = ({ label, value, strong }: { label: string; value: number; strong?: boolean }) => (
  <div className={`mt-3 flex justify-between gap-3 border-t border-border pt-2 font-semibold ${strong ? "text-base" : "text-sm"}`}>
    <span>{label}</span>
    <span className={num}>{rupiah(value)}</span>
  </div>
);

function BalanceSheetView({ book }: { book: Book }) {
  const b = balanceSheet(book);
  const heading = "mb-3 border-b border-border pb-2 text-sm font-semibold uppercase tracking-wide text-[var(--s-head)]";
  return (
    <div className="space-y-3">
      {!b.balanced && (
        <p className={alertErr}>
          Neraca tidak seimbang: selisih {rupiah(Math.abs(b.difference))}. Periksa kelengkapan jurnal.
        </p>
      )}
      <div className="grid items-start gap-4 md:grid-cols-2">
        <div className={`${cardCls} p-5`}>
          <h3 className={heading}>Aktiva (Harta)</h3>
          <StatementList rows={b.assets} empty="Belum ada harta tercatat." />
          <Total label="Total aktiva" value={b.totalAssets} strong />
        </div>
        <div className={`${cardCls} space-y-6 p-5`}>
          <div>
            <h3 className={heading}>Kewajiban</h3>
            <StatementList rows={b.liabilities} empty="Belum ada kewajiban tercatat." />
            <Total label="Total kewajiban" value={b.totalLiabilities} />
          </div>
          <div>
            <h3 className={heading}>Ekuitas (Modal)</h3>
            <StatementList
              rows={[...b.equities, { code: "3999", name: "Surplus / Defisit Berjalan", amount: b.currentEarnings }]}
              empty=""
            />
            <Total label="Total ekuitas" value={b.totalEquity} />
          </div>
          <Total label="Total pasiva (kewajiban + ekuitas)" value={b.totalPassiva} strong />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Laba Rugi

function IncomeStatementView({ book }: { book: Book }) {
  const s = incomeStatement(book);
  const heading = "mb-3 border-b border-border pb-2 text-sm font-semibold uppercase tracking-wide text-[var(--s-head)]";
  const surplus = s.net >= 0;
  return (
    <div className={`${cardCls} max-w-3xl space-y-6 p-5`}>
      <div>
        <h3 className={heading}>Pendapatan</h3>
        <StatementList rows={s.revenues} empty="Belum ada pendapatan pada periode ini." />
        <Total label="Total pendapatan" value={s.totalRevenue} />
      </div>
      <div>
        <h3 className={heading}>Beban / Pengeluaran</h3>
        <StatementList rows={s.expenses} empty="Belum ada beban pada periode ini." />
        <Total label="Total beban" value={s.totalExpense} />
      </div>
      <div
        className={`flex justify-between gap-3 border-t-2 pt-3 text-base font-semibold ${
          surplus ? "border-[var(--emerald)] text-[var(--emerald)]" : "border-red-500 text-red-600 dark:text-red-400"
        }`}
      >
        <span>{surplus ? "Surplus bersih" : "Defisit bersih"}</span>
        <span className={num}>{rupiah(s.net)}</span>
      </div>
    </div>
  );
}
