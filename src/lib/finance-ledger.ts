import type { AccountType } from "@prisma/client";
import { MONTH_RE, monthLabel, monthRange } from "@/lib/finance";

// Seluruh perhitungan akuntansi ada di sini tanpa akses database, supaya mudah dites.
// finance-statements.ts yang mengambil data dari Prisma dan memanggil fungsi-fungsi ini.

export type AccountRef = { id: string; code: string; name: string; type: AccountType };

export type BookLine = {
  id: string;
  txId: string;
  accountId: string;
  isDebit: boolean;
  amount: number;
  date: Date;
  createdAt: Date;
  title: string;
  verified: boolean;
};

export type Scope = "verified" | "all";
export type PeriodKeys = { from?: string; to?: string };
/** Rentang [start, end): start inklusif, end eksklusif. Kosong berarti tidak dibatasi. */
export type Period = { start?: Date; end?: Date };

export type Book = {
  accounts: AccountRef[];
  /** Semua baris jurnal sampai akhir periode (termasuk sebelum awal periode, untuk saldo awal). */
  lines: BookLine[];
  keys: PeriodKeys;
  period: Period;
  scope: Scope;
  /** Transaksi belum terverifikasi di periode ini yang tidak dihitung (hanya bila scope = "verified"). */
  unverifiedExcluded: number;
};

/** Tab laporan di halaman Ringkasan; kuncinya juga dipakai sebagai nama laporan pada unduhan Excel. */
export const REPORT_TABS = [
  { key: "journal", label: "Jurnal Umum" },
  { key: "ledger", label: "Buku Besar" },
  { key: "balance-sheet", label: "Neraca" },
  { key: "income-statement", label: "Laba Rugi" },
] as const;
export type ReportKey = (typeof REPORT_TABS)[number]["key"];
export const isReportKey = (s: unknown): s is ReportKey => REPORT_TABS.some((t) => t.key === s);

export const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = {
  ASSET: "Harta",
  LIABILITY: "Kewajiban",
  EQUITY: "Ekuitas",
  REVENUE: "Pendapatan",
  EXPENSE: "Beban",
};

// ---------------------------------------------------------------- periode

/** Hanya menerima YYYY-MM yang valid; bila terbalik (dari > sampai), keduanya ditukar. */
export function parsePeriod(sp: { from?: string; to?: string }): PeriodKeys {
  let from = sp.from && MONTH_RE.test(sp.from) ? sp.from : undefined;
  let to = sp.to && MONTH_RE.test(sp.to) ? sp.to : undefined;
  if (from && to && from > to) [from, to] = [to, from];
  return { from, to };
}

export function periodDates(k: PeriodKeys): Period {
  return { start: k.from ? monthRange(k.from).start : undefined, end: k.to ? monthRange(k.to).end : undefined };
}

export function periodLabel(k: PeriodKeys) {
  if (k.from && k.to) return k.from === k.to ? monthLabel(k.from) : `${monthLabel(k.from)} – ${monthLabel(k.to)}`;
  if (k.from) return `Sejak ${monthLabel(k.from)}`;
  if (k.to) return `Sampai ${monthLabel(k.to)}`;
  return "Seluruh periode";
}

/** Tanggal terakhir yang tercakup periode (untuk label "Per …"); undefined bila tidak dibatasi. */
export const periodLastInstant = (p: Period) => (p.end ? new Date(p.end.getTime() - 1) : undefined);

const inPeriod = (d: Date, p: Period) => (!p.start || d >= p.start) && (!p.end || d < p.end);
const beforeStart = (d: Date, p: Period) => !!p.start && d < p.start;
const beforeEnd = (d: Date, p: Period) => !p.end || d < p.end;

// ---------------------------------------------------------------- dasar

export const isDebitNormal = (t: AccountType) => t === "ASSET" || t === "EXPENSE";

/** Saldo pada sisi normalnya: Harta/Beban naik di debit, lainnya naik di kredit. */
export const naturalBalance = (t: AccountType, debit: number, credit: number) =>
  isDebitNormal(t) ? debit - credit : credit - debit;

/** Hindari sisa pecahan desimal biner pada penjumlahan. */
export const round2 = (n: number) => Math.round(n * 100) / 100;

const sumLines = (lines: BookLine[], pick: (l: BookLine) => boolean) => {
  let debit = 0;
  let credit = 0;
  for (const l of lines) {
    if (!pick(l)) continue;
    if (l.isDebit) debit += l.amount;
    else credit += l.amount;
  }
  return { debit: round2(debit), credit: round2(credit) };
};

const byLineOrder = (a: BookLine, b: BookLine) =>
  a.date.getTime() - b.date.getTime() ||
  a.createdAt.getTime() - b.createdAt.getTime() ||
  a.txId.localeCompare(b.txId) ||
  Number(b.isDebit) - Number(a.isDebit); // debit di atas kredit

// ---------------------------------------------------------------- jurnal umum

export type JournalEntry = {
  txId: string;
  /** "JU-0001", urut kronologis di dalam periode. Sama di Jurnal Umum dan Buku Besar. */
  number: string;
  date: Date;
  title: string;
  verified: boolean;
  lines: { code: string; name: string; debit: number; credit: number }[];
  debit: number;
  credit: number;
};

/** Jurnal di dalam periode, kronologis (terlama dulu), debit di atas kredit. */
export function journalEntries(book: Book): JournalEntry[] {
  const acc = new Map(book.accounts.map((a) => [a.id, a]));
  const groups = new Map<string, BookLine[]>();
  for (const l of [...book.lines].sort(byLineOrder)) {
    if (!inPeriod(l.date, book.period)) continue;
    const g = groups.get(l.txId);
    if (g) g.push(l);
    else groups.set(l.txId, [l]);
  }
  let n = 0;
  return [...groups.values()].map((g) => {
    const lines = g.map((l) => {
      const a = acc.get(l.accountId);
      return {
        code: a?.code ?? "?",
        name: a?.name ?? "(akun dihapus)",
        debit: l.isDebit ? l.amount : 0,
        credit: l.isDebit ? 0 : l.amount,
      };
    });
    return {
      txId: g[0].txId,
      number: `JU-${String(++n).padStart(4, "0")}`,
      date: g[0].date,
      title: g[0].title,
      verified: g[0].verified,
      lines,
      debit: round2(lines.reduce((a, l) => a + l.debit, 0)),
      credit: round2(lines.reduce((a, l) => a + l.credit, 0)),
    };
  });
}

// ---------------------------------------------------------------- buku besar

export type LedgerEntry = {
  date: Date;
  title: string;
  ref: string;
  debit: number;
  credit: number;
  /** Saldo setelah baris ini, pada sisi normal akun. */
  balance: number;
};

export type LedgerAccount = {
  account: AccountRef;
  opening: number;
  entries: LedgerEntry[];
  debit: number;
  credit: number;
  closing: number;
};

/** Buku besar per akun: saldo awal, mutasi di dalam periode dengan saldo berjalan, saldo akhir. */
export function generalLedger(book: Book): LedgerAccount[] {
  const numbers = new Map(journalEntries(book).map((e) => [e.txId, e.number]));
  const sorted = [...book.lines].sort(byLineOrder);
  const out: LedgerAccount[] = [];

  for (const account of book.accounts) {
    const mine = sorted.filter((l) => l.accountId === account.id && beforeEnd(l.date, book.period));
    const pre = sumLines(mine, (l) => beforeStart(l.date, book.period));
    const opening = round2(naturalBalance(account.type, pre.debit, pre.credit));

    let running = opening;
    const entries: LedgerEntry[] = [];
    for (const l of mine) {
      if (!inPeriod(l.date, book.period)) continue;
      const debit = l.isDebit ? l.amount : 0;
      const credit = l.isDebit ? 0 : l.amount;
      running = round2(running + naturalBalance(account.type, debit, credit));
      entries.push({ date: l.date, title: l.title, ref: numbers.get(l.txId) ?? "", debit, credit, balance: running });
    }
    if (entries.length === 0 && opening === 0) continue;
    out.push({
      account,
      opening,
      entries,
      debit: round2(entries.reduce((a, e) => a + e.debit, 0)),
      credit: round2(entries.reduce((a, e) => a + e.credit, 0)),
      closing: running,
    });
  }
  return out;
}

// ---------------------------------------------------------------- neraca saldo

export type TrialRow = {
  account: AccountRef;
  opening: number;
  debit: number;
  credit: number;
  closing: number;
  /** Saldo akhir ditaruh di kolom debit atau kredit menurut selisih debit − kredit kumulatif. */
  closingDebit: number;
  closingCredit: number;
};

export function trialBalance(book: Book) {
  const rows: TrialRow[] = [];
  for (const account of book.accounts) {
    const mine = book.lines.filter((l) => l.accountId === account.id && beforeEnd(l.date, book.period));
    if (mine.length === 0) continue;
    const pre = sumLines(mine, (l) => beforeStart(l.date, book.period));
    const mov = sumLines(mine, (l) => inPeriod(l.date, book.period));
    const all = sumLines(mine, () => true);
    const net = round2(all.debit - all.credit);
    rows.push({
      account,
      opening: round2(naturalBalance(account.type, pre.debit, pre.credit)),
      debit: mov.debit,
      credit: mov.credit,
      closing: round2(naturalBalance(account.type, all.debit, all.credit)),
      closingDebit: net > 0 ? net : 0,
      closingCredit: net < 0 ? -net : 0,
    });
  }
  const debit = round2(rows.reduce((a, r) => a + r.closingDebit, 0));
  const credit = round2(rows.reduce((a, r) => a + r.closingCredit, 0));
  return {
    rows,
    movementDebit: round2(rows.reduce((a, r) => a + r.debit, 0)),
    movementCredit: round2(rows.reduce((a, r) => a + r.credit, 0)),
    debit,
    credit,
    balanced: Math.abs(debit - credit) < 0.005,
  };
}

// ---------------------------------------------------------------- laba rugi

export type StatementRow = { code: string; name: string; amount: number };

/** Pendapatan dan beban hanya dari mutasi di dalam periode. */
export function incomeStatement(book: Book) {
  const revenues: StatementRow[] = [];
  const expenses: StatementRow[] = [];
  for (const a of book.accounts) {
    if (a.type !== "REVENUE" && a.type !== "EXPENSE") continue;
    const mine = book.lines.filter((l) => l.accountId === a.id && inPeriod(l.date, book.period));
    if (mine.length === 0) continue;
    const s = sumLines(mine, () => true);
    const row = { code: a.code, name: a.name, amount: round2(naturalBalance(a.type, s.debit, s.credit)) };
    (a.type === "REVENUE" ? revenues : expenses).push(row);
  }
  const totalRevenue = round2(revenues.reduce((a, r) => a + r.amount, 0));
  const totalExpense = round2(expenses.reduce((a, r) => a + r.amount, 0));
  return { revenues, expenses, totalRevenue, totalExpense, net: round2(totalRevenue - totalExpense) };
}

// ---------------------------------------------------------------- neraca

/** Posisi keuangan kumulatif sampai akhir periode (awal periode tidak berpengaruh). */
export function balanceSheet(book: Book) {
  const assets: StatementRow[] = [];
  const liabilities: StatementRow[] = [];
  const equities: StatementRow[] = [];
  let revenue = 0;
  let expense = 0;

  for (const a of book.accounts) {
    const mine = book.lines.filter((l) => l.accountId === a.id && beforeEnd(l.date, book.period));
    if (mine.length === 0) continue;
    const s = sumLines(mine, () => true);
    const amount = round2(naturalBalance(a.type, s.debit, s.credit));
    const row = { code: a.code, name: a.name, amount };
    if (a.type === "ASSET") assets.push(row);
    else if (a.type === "LIABILITY") liabilities.push(row);
    else if (a.type === "EQUITY") equities.push(row);
    else if (a.type === "REVENUE") revenue += amount;
    else expense += amount;
  }

  const currentEarnings = round2(revenue - expense);
  const totalAssets = round2(assets.reduce((a, r) => a + r.amount, 0));
  const totalLiabilities = round2(liabilities.reduce((a, r) => a + r.amount, 0));
  const totalEquity = round2(equities.reduce((a, r) => a + r.amount, 0) + currentEarnings);
  const totalPassiva = round2(totalLiabilities + totalEquity);
  const difference = round2(totalAssets - totalPassiva);
  return {
    assets,
    liabilities,
    equities,
    currentEarnings,
    totalAssets,
    totalLiabilities,
    totalEquity,
    totalPassiva,
    difference,
    balanced: Math.abs(difference) < 0.005,
  };
}
