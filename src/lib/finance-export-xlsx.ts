import ExcelJS from "exceljs";
import { formatDate, formatDateTime } from "@/lib/datetime";
import { CATEGORY_LABEL } from "@/lib/finance";
import { CASH_ACCOUNT } from "@/lib/finance-journal";
import {
  ACCOUNT_TYPE_LABEL,
  balanceSheet,
  generalLedger,
  incomeStatement,
  isDebitNormal,
  journalEntries,
  periodLabel,
  periodLastInstant,
  REPORT_TABS,
  trialBalance,
  type Book,
  type ReportKey,
  type StatementRow,
} from "@/lib/finance-ledger";
import type { ExportTransaction } from "@/lib/finance-statements";

export type ExportReport = "all" | ReportKey;
export const EXPORT_REPORTS: readonly ExportReport[] = ["all", ...REPORT_TABS.map((t) => t.key)];
export const isExportReport = (s: unknown): s is ExportReport => EXPORT_REPORTS.includes(s as ExportReport);

const RP = '"Rp" #,##0';
const DATE = "dd/mm/yyyy";
const NAVY = "FF0B1F4B";
const GREY = "FF64748B";
const LIGHT = "FFF1F5F9";

/** Excel menyimpan tanggal sebagai UTC; digeser +7 jam supaya yang tampil adalah tanggal WIB. */
const excelDate = (d: Date) => new Date(d.getTime() + 7 * 3_600_000);

type Sheet = ExcelJS.Worksheet;

function openSheet(wb: ExcelJS.Workbook, name: string, title: string, book: Book, widths: number[], periodText?: string) {
  const ws = wb.addWorksheet(name, { views: [{ showGridLines: false }] });
  widths.forEach((w, i) => (ws.getColumn(i + 1).width = w));
  ws.pageSetup = { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 };

  ws.getCell("A1").value = "HIMPUNAN MAHASISWA MANAJEMEN — UKRI";
  ws.getCell("A1").font = { bold: true, size: 10, color: { argb: GREY } };
  ws.getCell("A2").value = title;
  ws.getCell("A2").font = { bold: true, size: 14, color: { argb: NAVY } };
  ws.getCell("A3").value = periodText ?? `Periode: ${periodLabel(book.keys)}`;
  ws.getCell("A4").value =
    book.scope === "verified"
      ? "Cakupan: hanya transaksi yang sudah diverifikasi"
      : "Cakupan: termasuk transaksi yang belum diverifikasi";
  ws.getCell("A5").value = `Dicetak ${formatDateTime(new Date())}`;
  ws.getCell("A5").font = { size: 9, color: { argb: GREY } };
  return { ws, row: 7 };
}

function headRow(ws: Sheet, r: number, heads: string[], rightCols: number[] = []) {
  const row = ws.getRow(r);
  heads.forEach((h, i) => {
    const c = row.getCell(i + 1);
    c.value = h;
    c.font = { bold: true, color: { argb: "FFFFFFFF" } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };
    c.alignment = { vertical: "middle", horizontal: rightCols.includes(i + 1) ? "right" : "left", wrapText: true };
  });
  row.height = 20;
}

const totalStyle = (row: ExcelJS.Row, cols: number) => {
  row.font = { bold: true };
  for (let i = 1; i <= cols; i++) {
    const c = row.getCell(i);
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT } };
    c.border = { top: { style: "thin", color: { argb: NAVY } } };
  }
};

const money = (c: ExcelJS.Cell, v: ExcelJS.CellValue) => {
  c.value = v;
  c.numFmt = RP;
};

// ------------------------------------------------------------------ Jurnal Umum

function journalSheet(wb: ExcelJS.Workbook, book: Book) {
  const entries = journalEntries(book);
  const showStatus = book.scope === "all";
  const widths = [12, 13, 44, 11, 38, 17, 17, ...(showStatus ? [20] : [])];
  const { ws, row: head } = openSheet(wb, "Jurnal Umum", "Jurnal Umum", book, widths);
  headRow(ws, head, ["No. Jurnal", "Tanggal", "Uraian", "Kode Akun", "Nama Akun", "Debit", "Kredit", ...(showStatus ? ["Status"] : [])], [6, 7]);

  let r = head + 1;
  const first = r;
  for (const e of entries) {
    for (const l of e.lines) {
      const row = ws.getRow(r++);
      row.getCell(1).value = e.number;
      row.getCell(2).value = excelDate(e.date);
      row.getCell(2).numFmt = DATE;
      row.getCell(2).alignment = { horizontal: "left" };
      row.getCell(3).value = e.title;
      row.getCell(4).value = l.code;
      row.getCell(5).value = l.name;
      if (l.credit > 0) row.getCell(5).alignment = { indent: 2 }; // kredit menjorok, standar buku jurnal
      if (l.debit > 0) money(row.getCell(6), l.debit);
      if (l.credit > 0) money(row.getCell(7), l.credit);
      if (showStatus) row.getCell(8).value = e.verified ? "Terverifikasi" : "Belum diverifikasi";
    }
  }
  const last = r - 1;
  const tot = ws.getRow(r);
  tot.getCell(5).value = "Total";
  const td = entries.reduce((a, e) => a + e.debit, 0);
  const tc = entries.reduce((a, e) => a + e.credit, 0);
  money(tot.getCell(6), entries.length ? { formula: `SUM(F${first}:F${last})`, result: td } : 0);
  money(tot.getCell(7), entries.length ? { formula: `SUM(G${first}:G${last})`, result: tc } : 0);
  totalStyle(tot, widths.length);

  if (entries.length === 0) ws.getCell(`A${head + 1}`).value = "Tidak ada jurnal pada periode ini.";
  ws.views = [{ state: "frozen", ySplit: head, showGridLines: false }];
  if (entries.length) ws.autoFilter = { from: { row: head, column: 1 }, to: { row: last, column: widths.length } };
}

// ------------------------------------------------------------------ Buku Besar

function ledgerSheet(wb: ExcelJS.Workbook, book: Book) {
  const ledger = generalLedger(book);
  const { ws, row } = openSheet(wb, "Buku Besar", "Buku Besar", book, [13, 46, 12, 17, 17, 19]);
  let r = row;
  if (ledger.length === 0) {
    ws.getCell(`A${r}`).value = "Tidak ada mutasi pada periode ini.";
    return;
  }

  for (const L of ledger) {
    const a = L.account;
    ws.mergeCells(`A${r}:F${r}`);
    const title = ws.getCell(`A${r}`);
    title.value = `${a.code} — ${a.name} (${ACCOUNT_TYPE_LABEL[a.type]})`;
    title.font = { bold: true, color: { argb: NAVY } };
    title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT } };
    r++;
    headRow(ws, r++, ["Tanggal", "Uraian", "Ref", "Debit", "Kredit", "Saldo"], [4, 5, 6]);

    const openRow = r++;
    ws.getCell(`B${openRow}`).value = "Saldo awal";
    ws.getCell(`B${openRow}`).font = { italic: true };
    money(ws.getCell(`F${openRow}`), L.opening);

    let prev = openRow;
    const firstEntry = r;
    for (const e of L.entries) {
      const rr = r++;
      ws.getCell(`A${rr}`).value = excelDate(e.date);
      ws.getCell(`A${rr}`).numFmt = DATE;
      ws.getCell(`A${rr}`).alignment = { horizontal: "left" };
      ws.getCell(`B${rr}`).value = e.title;
      ws.getCell(`C${rr}`).value = e.ref;
      if (e.debit > 0) money(ws.getCell(`D${rr}`), e.debit);
      if (e.credit > 0) money(ws.getCell(`E${rr}`), e.credit);
      money(ws.getCell(`F${rr}`), {
        formula: isDebitNormal(a.type) ? `F${prev}+D${rr}-E${rr}` : `F${prev}+E${rr}-D${rr}`,
        result: e.balance,
      });
      prev = rr;
    }

    const tot = ws.getRow(r++);
    tot.getCell(2).value = "Total mutasi / saldo akhir";
    money(tot.getCell(4), L.entries.length ? { formula: `SUM(D${firstEntry}:D${prev})`, result: L.debit } : 0);
    money(tot.getCell(5), L.entries.length ? { formula: `SUM(E${firstEntry}:E${prev})`, result: L.credit } : 0);
    money(tot.getCell(6), { formula: `F${prev}`, result: L.closing });
    totalStyle(tot, 6);
    r++; // baris kosong antar akun
  }
  ws.getCell(`A${r}`).value = "Saldo ditampilkan pada sisi normal akun: Harta dan Beban bertambah di debit; Kewajiban, Ekuitas, dan Pendapatan bertambah di kredit.";
  ws.getCell(`A${r}`).font = { italic: true, size: 9, color: { argb: GREY } };
}

// ------------------------------------------------------------------ Neraca Saldo

function trialSheet(wb: ExcelJS.Workbook, book: Book) {
  const t = trialBalance(book);
  const widths = [10, 40, 12, 17, 17, 17, 17, 18, 18];
  const { ws, row: head } = openSheet(wb, "Neraca Saldo", "Neraca Saldo", book, widths);
  headRow(
    ws,
    head,
    ["Kode", "Nama Akun", "Jenis", "Saldo Awal", "Mutasi Debit", "Mutasi Kredit", "Saldo Akhir", "Neraca Saldo Debit", "Neraca Saldo Kredit"],
    [4, 5, 6, 7, 8, 9],
  );
  let r = head + 1;
  const first = r;
  for (const x of t.rows) {
    const row = ws.getRow(r++);
    row.getCell(1).value = x.account.code;
    row.getCell(2).value = x.account.name;
    row.getCell(3).value = ACCOUNT_TYPE_LABEL[x.account.type];
    money(row.getCell(4), x.opening);
    money(row.getCell(5), x.debit);
    money(row.getCell(6), x.credit);
    money(row.getCell(7), x.closing);
    money(row.getCell(8), x.closingDebit || null);
    money(row.getCell(9), x.closingCredit || null);
  }
  const last = r - 1;
  const has = t.rows.length > 0;
  const tot = ws.getRow(r++);
  tot.getCell(2).value = "Total";
  money(tot.getCell(5), has ? { formula: `SUM(E${first}:E${last})`, result: t.movementDebit } : 0);
  money(tot.getCell(6), has ? { formula: `SUM(F${first}:F${last})`, result: t.movementCredit } : 0);
  money(tot.getCell(8), has ? { formula: `SUM(H${first}:H${last})`, result: t.debit } : 0);
  money(tot.getCell(9), has ? { formula: `SUM(I${first}:I${last})`, result: t.credit } : 0);
  totalStyle(tot, widths.length);

  const diff = ws.getRow(r++);
  diff.getCell(2).value = "Selisih debit − kredit";
  money(diff.getCell(8), { formula: `H${r - 2}-I${r - 2}`, result: Math.round((t.debit - t.credit) * 100) / 100 });
  diff.getCell(9).value = t.balanced ? "Seimbang" : "TIDAK SEIMBANG";
  diff.font = { bold: true, color: { argb: t.balanced ? "FF047857" : "FFB91C1C" } };

  ws.getCell(`A${r + 1}`).value = "Saldo awal dan saldo akhir pada sisi normal akun; kolom Neraca Saldo menaruh saldo akhir di debit atau kredit menurut posisinya.";
  ws.getCell(`A${r + 1}`).font = { italic: true, size: 9, color: { argb: GREY } };
  ws.views = [{ state: "frozen", ySplit: head, showGridLines: false }];
}

// ------------------------------------------------------------------ Neraca & Laba Rugi

/** Satu kelompok baris (judul, akun-akun, total). Total dihitung dengan SUM agar bisa diperiksa di Excel. */
function writeGroup(ws: Sheet, start: number, title: string, rows: StatementRow[], totalLabel: string, result: number) {
  let r = start;
  for (let i = 1; i <= 3; i++) {
    const c = ws.getRow(r).getCell(i);
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };
    c.font = { bold: true, color: { argb: "FFFFFFFF" } };
  }
  ws.getCell(`A${r}`).value = title;
  r++;
  const first = r;
  for (const x of rows) {
    ws.getCell(`A${r}`).value = x.code;
    ws.getCell(`B${r}`).value = x.name;
    money(ws.getCell(`C${r}`), x.amount);
    r++;
  }
  if (rows.length === 0) {
    ws.getCell(`B${r}`).value = "Belum ada";
    ws.getCell(`B${r}`).font = { italic: true, color: { argb: GREY } };
    r++;
  }
  const total = r++;
  ws.getCell(`B${total}`).value = totalLabel;
  money(ws.getCell(`C${total}`), { formula: `SUM(C${first}:C${total - 1})`, result });
  totalStyle(ws.getRow(total), 3);
  return { next: r + 1, total };
}

function balanceSheetSheet(wb: ExcelJS.Workbook, book: Book) {
  const b = balanceSheet(book);
  const asOf = periodLastInstant(book.period);
  const { ws, row } = openSheet(wb, "Neraca", "Neraca", book, [10, 52, 22], asOf ? `Per ${formatDate(asOf)}` : "Seluruh transaksi tercatat");

  const A = writeGroup(ws, row, "AKTIVA (HARTA)", b.assets, "Total Aktiva", b.totalAssets);
  const L = writeGroup(ws, A.next, "KEWAJIBAN", b.liabilities, "Total Kewajiban", b.totalLiabilities);
  const E = writeGroup(
    ws,
    L.next,
    "EKUITAS (MODAL)",
    [...b.equities, { code: "3999", name: "Surplus / Defisit Berjalan", amount: b.currentEarnings }],
    "Total Ekuitas",
    b.totalEquity,
  );

  let r = E.next;
  ws.getCell(`B${r}`).value = "TOTAL PASIVA (Kewajiban + Ekuitas)";
  money(ws.getCell(`C${r}`), { formula: `C${L.total}+C${E.total}`, result: b.totalPassiva });
  totalStyle(ws.getRow(r), 3);
  const passiva = r++;
  ws.getCell(`B${r}`).value = "Selisih Aktiva − Pasiva";
  money(ws.getCell(`C${r}`), { formula: `C${A.total}-C${passiva}`, result: b.difference });
  r++;
  ws.getCell(`B${r}`).value = "Status";
  ws.getCell(`C${r}`).value = b.balanced ? "Seimbang" : "TIDAK SEIMBANG";
  ws.getCell(`C${r}`).alignment = { horizontal: "right" };
  ws.getRow(r).font = { bold: true, color: { argb: b.balanced ? "FF047857" : "FFB91C1C" } };
}

function incomeStatementSheet(wb: ExcelJS.Workbook, book: Book) {
  const s = incomeStatement(book);
  const { ws, row } = openSheet(wb, "Laba Rugi", "Laporan Laba Rugi (Surplus / Defisit)", book, [10, 52, 22]);
  const R = writeGroup(ws, row, "PENDAPATAN", s.revenues, "Total Pendapatan", s.totalRevenue);
  const X = writeGroup(ws, R.next, "BEBAN / PENGELUARAN", s.expenses, "Total Beban", s.totalExpense);
  ws.getCell(`B${X.next}`).value = s.net >= 0 ? "SURPLUS BERSIH" : "DEFISIT BERSIH";
  money(ws.getCell(`C${X.next}`), { formula: `C${R.total}-C${X.total}`, result: s.net });
  totalStyle(ws.getRow(X.next), 3);
}

// ------------------------------------------------------------------ Transaksi

function transactionsSheet(wb: ExcelJS.Workbook, book: Book, txs: ExportTransaction[], staff: boolean) {
  const showStatus = book.scope === "all";
  const widths = [6, 13, 44, 24, 13, 17, 17, ...(showStatus ? [20] : []), ...(staff ? [44] : [])];
  const { ws, row: head } = openSheet(wb, "Transaksi", "Daftar Transaksi Kas", book, widths);
  headRow(
    ws,
    head,
    ["No", "Tanggal", "Uraian", "Kategori", "Jenis", "Pemasukan", "Pengeluaran", ...(showStatus ? ["Status"] : []), ...(staff ? ["Catatan"] : [])],
    [6, 7],
  );
  let r = head + 1;
  const first = r;
  txs.forEach((t, i) => {
    const row = ws.getRow(r++);
    row.getCell(1).value = i + 1;
    row.getCell(2).value = excelDate(t.date);
    row.getCell(2).numFmt = DATE;
    row.getCell(2).alignment = { horizontal: "left" };
    row.getCell(3).value = t.title;
    row.getCell(4).value = CATEGORY_LABEL[t.category];
    row.getCell(5).value = t.type === "INCOME" ? "Pemasukan" : "Pengeluaran";
    money(row.getCell(t.type === "INCOME" ? 6 : 7), t.amount);
    let c = 8;
    if (showStatus) row.getCell(c++).value = t.verified ? "Terverifikasi" : "Belum diverifikasi";
    if (staff) row.getCell(c).value = t.note ?? "";
  });
  const last = r - 1;
  const inc = txs.filter((t) => t.type === "INCOME").reduce((a, t) => a + t.amount, 0);
  const exp = txs.filter((t) => t.type === "EXPENSE").reduce((a, t) => a + t.amount, 0);
  const tot = ws.getRow(r);
  tot.getCell(3).value = "Total";
  money(tot.getCell(6), txs.length ? { formula: `SUM(F${first}:F${last})`, result: inc } : 0);
  money(tot.getCell(7), txs.length ? { formula: `SUM(G${first}:G${last})`, result: exp } : 0);
  totalStyle(tot, widths.length);
  if (txs.length === 0) ws.getCell(`A${head + 1}`).value = "Tidak ada transaksi pada periode ini.";
  ws.views = [{ state: "frozen", ySplit: head, showGridLines: false }];
  if (txs.length) ws.autoFilter = { from: { row: head, column: 1 }, to: { row: last, column: widths.length } };
}

// ------------------------------------------------------------------ Ringkasan

function summarySheet(wb: ExcelJS.Workbook, book: Book, contents: string[]) {
  const is = incomeStatement(book);
  const bs = balanceSheet(book);
  const tb = trialBalance(book);
  const cash = tb.rows.find((x) => x.account.code === CASH_ACCOUNT)?.closing ?? 0;
  const asOf = periodLastInstant(book.period);
  const { ws, row } = openSheet(wb, "Ringkasan", "Ringkasan Laporan Keuangan", book, [46, 24]);

  let r = row;
  const section = (t: string) => {
    ws.getCell(`A${r}`).value = t;
    ws.getRow(r).font = { bold: true, color: { argb: NAVY } };
    r++;
  };
  const line = (label: string, value: ExcelJS.CellValue, bold = false) => {
    ws.getCell(`A${r}`).value = label;
    money(ws.getCell(`B${r}`), value);
    if (bold) ws.getRow(r).font = { bold: true };
    return r++;
  };

  section("Aktivitas pada periode");
  const rev = line("Pendapatan", is.totalRevenue);
  const exp = line("Beban", is.totalExpense);
  line(is.net >= 0 ? "Surplus" : "Defisit", { formula: `B${rev}-B${exp}`, result: is.net }, true);
  r++;
  section(asOf ? `Posisi per ${formatDate(asOf)}` : "Posisi saat ini");
  line("Saldo kas", cash);
  line("Total aktiva", bs.totalAssets);
  line("Total pasiva (kewajiban + ekuitas)", bs.totalPassiva);
  ws.getCell(`A${r}`).value = "Status neraca";
  ws.getCell(`B${r}`).value = bs.balanced ? "Seimbang" : "TIDAK SEIMBANG";
  ws.getCell(`B${r}`).alignment = { horizontal: "right" };
  ws.getCell(`B${r}`).font = { bold: true, color: { argb: bs.balanced ? "FF047857" : "FFB91C1C" } };
  r += 2;

  ws.getCell(`A${r}`).value = "Jumlah jurnal pada periode";
  ws.getCell(`B${r}`).value = journalEntries(book).length;
  r += 2;

  if (book.unverifiedExcluded > 0) {
    ws.getCell(`A${r}`).value = `Catatan: ${book.unverifiedExcluded} transaksi pada periode ini belum diverifikasi dan tidak dihitung.`;
    ws.getCell(`A${r}`).font = { italic: true, color: { argb: GREY } };
    r += 2;
  }
  section("Isi file ini");
  for (const name of contents) ws.getCell(`A${r++}`).value = name;
}

// ------------------------------------------------------------------ rakitan

export async function buildFinanceWorkbook(opts: {
  report: ExportReport;
  book: Book;
  /** Wajib untuk report "all". */
  transactions?: ExportTransaction[];
  /** Staf keuangan: lembar Transaksi memuat kolom Catatan. */
  staff: boolean;
}): Promise<Buffer> {
  const { report, book } = opts;
  const wb = new ExcelJS.Workbook();
  wb.creator = "ORG";
  wb.created = new Date();

  if (report === "all") {
    summarySheet(wb, book, ["Ringkasan", "Jurnal Umum", "Buku Besar", "Neraca Saldo", "Neraca", "Laba Rugi", "Transaksi"]);
    journalSheet(wb, book);
    ledgerSheet(wb, book);
    trialSheet(wb, book);
    balanceSheetSheet(wb, book);
    incomeStatementSheet(wb, book);
    transactionsSheet(wb, book, opts.transactions ?? [], opts.staff);
  } else if (report === "journal") {
    journalSheet(wb, book);
  } else if (report === "ledger") {
    ledgerSheet(wb, book);
    trialSheet(wb, book);
  } else if (report === "balance-sheet") {
    balanceSheetSheet(wb, book);
  } else {
    incomeStatementSheet(wb, book);
  }
  return Buffer.from(await wb.xlsx.writeBuffer());
}
