import assert from "node:assert/strict";
import { describe, it } from "node:test";
import ExcelJS from "exceljs";
import { buildFinanceWorkbook } from "@/lib/finance-export-xlsx";
import { journalCodesFor } from "@/lib/finance-journal";
import {
  balanceSheet,
  generalLedger,
  incomeStatement,
  journalEntries,
  parsePeriod,
  periodDates,
  periodLabel,
  trialBalance,
  type AccountRef,
  type Book,
  type BookLine,
  type PeriodKeys,
} from "@/lib/finance-ledger";

const acc = (code: string, name: string, type: AccountRef["type"]): AccountRef => ({ id: code, code, name, type });
const accounts = [
  acc("1110", "Kas", "ASSET"),
  acc("4110", "Iuran", "REVENUE"),
  acc("4120", "Dana Universitas", "REVENUE"),
  acc("5110", "Operasional", "EXPENSE"),
  acc("5120", "Event", "EXPENSE"),
];

let n = 0;
/** Satu transaksi = sepasang baris jurnal. Jam 12:00 WIB = 05:00 UTC. */
function tx(date: string, title: string, debit: string, credit: string, amount: number, verified = true): BookLine[] {
  const id = `t${++n}`;
  const d = new Date(`${date}T05:00:00Z`);
  const base = { txId: id, date: d, createdAt: d, title, verified };
  return [
    { ...base, id: `${id}d`, accountId: debit, isDebit: true, amount },
    { ...base, id: `${id}k`, accountId: credit, isDebit: false, amount },
  ];
}

const lines: BookLine[] = [
  ...tx("2026-01-10", "Iuran Januari", "1110", "4110", 100_000),
  ...tx("2026-01-20", "Dana kemahasiswaan", "1110", "4120", 500_000),
  ...tx("2026-02-05", "Konsumsi rapat", "5120", "1110", 200_000),
  ...tx("2026-02-15", "ATK (belum diverifikasi)", "5110", "1110", 50_000, false),
];

const book = (keys: PeriodKeys = {}, scope: Book["scope"] = "all", only = lines): Book => ({
  accounts,
  lines: only,
  keys,
  period: periodDates(keys),
  scope,
  unverifiedExcluded: 0,
});

describe("pemetaan akun", () => {
  it("pemasukan: kas didebit, pendapatan dikredit", () => {
    assert.deepEqual(journalCodesFor("INCOME", "DUES"), { debit: "1110", credit: "4110" });
    assert.deepEqual(journalCodesFor("INCOME", "UNIVERSITY_FUND"), { debit: "1110", credit: "4120" });
  });
  it("pengeluaran: beban didebit, kas dikredit", () => {
    assert.deepEqual(journalCodesFor("EXPENSE", "EVENT"), { debit: "5120", credit: "1110" });
    assert.deepEqual(journalCodesFor("EXPENSE", "OPERATIONAL"), { debit: "5110", credit: "1110" });
  });
});

describe("periode", () => {
  it("parsePeriod menolak format salah dan menukar rentang terbalik", () => {
    assert.deepEqual(parsePeriod({ from: "2026-13", to: "abc" }), { from: undefined, to: undefined });
    assert.deepEqual(parsePeriod({ from: "2026-05", to: "2026-02" }), { from: "2026-02", to: "2026-05" });
  });
  it("periodLabel", () => {
    assert.equal(periodLabel({}), "Seluruh periode");
    assert.equal(periodLabel({ from: "2026-02", to: "2026-02" }), "Februari 2026");
    assert.match(periodLabel({ from: "2026-01", to: "2026-03" }), /Januari 2026 – Maret 2026/);
  });
});

describe("jurnal umum", () => {
  it("kronologis, bernomor, dan debit di atas kredit", () => {
    const e = journalEntries(book());
    assert.deepEqual(e.map((x) => x.number), ["JU-0001", "JU-0002", "JU-0003", "JU-0004"]);
    assert.deepEqual(e[0].lines.map((l) => l.code), ["1110", "4110"]);
    assert.ok(e.every((x) => x.debit === x.credit));
  });
  it("hanya jurnal di dalam periode", () => {
    assert.equal(journalEntries(book({ from: "2026-02", to: "2026-02" })).length, 2);
  });
});

describe("buku besar", () => {
  it("saldo awal dari mutasi sebelum periode, saldo berjalan, saldo akhir", () => {
    const kas = generalLedger(book({ from: "2026-02", to: "2026-02" })).find((l) => l.account.code === "1110")!;
    assert.equal(kas.opening, 600_000);
    assert.deepEqual(kas.entries.map((e) => e.balance), [400_000, 350_000]);
    assert.equal(kas.closing, 350_000);
    assert.equal(kas.credit, 250_000);
  });
  it("akun tanpa mutasi dan tanpa saldo awal tidak muncul", () => {
    const l = generalLedger(book({ from: "2026-02", to: "2026-02" }));
    assert.ok(!l.some((x) => x.account.code === "4110" && x.entries.length === 0 && x.opening === 0));
    assert.ok(l.some((x) => x.account.code === "4110" && x.opening === 100_000));
  });
  it("Ref buku besar sama dengan nomor di jurnal umum", () => {
    const b = book();
    const num = new Map(journalEntries(b).map((e) => [e.title, e.number]));
    for (const l of generalLedger(b)) for (const e of l.entries) assert.equal(e.ref, num.get(e.title));
  });
});

describe("neraca saldo", () => {
  it("debit = kredit", () => {
    const t = trialBalance(book());
    assert.ok(t.balanced);
    assert.equal(t.debit, 600_000); // kas 350.000 + beban 250.000
    assert.equal(t.debit, t.credit);
  });
});

describe("laba rugi", () => {
  it("hanya mutasi di dalam periode", () => {
    const s = incomeStatement(book({ from: "2026-02", to: "2026-02" }));
    assert.equal(s.totalRevenue, 0);
    assert.equal(s.totalExpense, 250_000);
    assert.equal(s.net, -250_000);
    const jan = incomeStatement(book({ from: "2026-01", to: "2026-01" }));
    assert.equal(jan.totalRevenue, 600_000);
    assert.equal(jan.net, 600_000);
  });
});

describe("neraca", () => {
  it("seimbang: aktiva = pasiva dengan surplus berjalan di ekuitas", () => {
    const b = balanceSheet(book());
    assert.equal(b.totalAssets, 350_000);
    assert.equal(b.currentEarnings, 350_000);
    assert.equal(b.totalPassiva, 350_000);
    assert.ok(b.balanced);
  });
  it("kumulatif sampai akhir periode: bulan Februari tidak ikut bila 'sampai Januari'", () => {
    const b = balanceSheet(book({ to: "2026-01" }));
    assert.equal(b.totalAssets, 600_000);
    assert.ok(b.balanced);
  });
  it("awal periode tidak mengubah neraca (kumulatif)", () => {
    assert.equal(balanceSheet(book({ from: "2026-02", to: "2026-02" })).totalAssets, 350_000);
  });
  it("terdeteksi tidak seimbang bila jurnal pincang", () => {
    const broken = [...lines, { ...lines[0], id: "x", txId: "tx-pincang", isDebit: true, accountId: "1110", amount: 1_000 }];
    assert.ok(!balanceSheet(book({}, "all", broken)).balanced);
  });
});

describe("unduhan Excel", () => {
  const read = async (report: Parameters<typeof buildFinanceWorkbook>[0]["report"], b = book()) => {
    const buf = await buildFinanceWorkbook({
      report,
      book: b,
      staff: true,
      transactions: [
        { date: new Date("2026-01-10T05:00:00Z"), title: "Iuran Januari", category: "DUES", type: "INCOME", amount: 100_000, note: "catatan", verified: true },
        { date: new Date("2026-02-05T05:00:00Z"), title: "Konsumsi rapat", category: "EVENT", type: "EXPENSE", amount: 200_000, note: null, verified: true },
      ],
    });
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buf as unknown as ArrayBuffer);
    return wb;
  };

  it("semua laporan: tujuh lembar, Ringkasan paling depan", async () => {
    const wb = await read("all");
    assert.deepEqual(wb.worksheets.map((w) => w.name), ["Ringkasan", "Jurnal Umum", "Buku Besar", "Neraca Saldo", "Neraca", "Laba Rugi", "Transaksi"]);
  });

  it("laporan tunggal hanya berisi lembarnya (Buku Besar menyertakan Neraca Saldo)", async () => {
    assert.deepEqual((await read("journal")).worksheets.map((w) => w.name), ["Jurnal Umum"]);
    assert.deepEqual((await read("ledger")).worksheets.map((w) => w.name), ["Buku Besar", "Neraca Saldo"]);
    assert.deepEqual((await read("balance-sheet")).worksheets.map((w) => w.name), ["Neraca"]);
    assert.deepEqual((await read("income-statement")).worksheets.map((w) => w.name), ["Laba Rugi"]);
  });

  it("Jurnal Umum: total debit = total kredit, tanggal tidak mundur sehari", async () => {
    const ws = (await read("journal")).getWorksheet("Jurnal Umum")!;
    let totalRow = 0;
    ws.eachRow((row, i) => { if (row.getCell(5).value === "Total") totalRow = i; });
    const f = ws.getRow(totalRow).getCell(6).value as { result: number };
    const k = ws.getRow(totalRow).getCell(7).value as { result: number };
    assert.equal(f.result, 850_000);
    assert.equal(f.result, k.result);
    const firstDate = ws.getRow(8).getCell(2).value as Date;
    assert.equal(firstDate.toISOString().slice(0, 10), "2026-01-10"); // 12:00 WIB tetap tanggal 10
  });

  it("tanggal larut malam WIB tetap jatuh pada hari WIB yang benar", async () => {
    const late = [...tx("2026-03-01", "x", "1110", "4110", 1)].map((l) => ({ ...l, date: new Date("2026-02-28T18:30:00Z") })); // 01:30 WIB 1 Maret
    const ws = (await read("journal", book({}, "all", late))).getWorksheet("Jurnal Umum")!;
    assert.equal((ws.getRow(8).getCell(2).value as Date).toISOString().slice(0, 10), "2026-03-01");
  });

  it("cakupan terverifikasi: tanpa kolom Status; Neraca menyatakan seimbang", async () => {
    const wb = await read("all", book({}, "verified", lines.filter((l) => l.verified)));
    assert.equal(wb.getWorksheet("Jurnal Umum")!.getRow(7).getCell(8).value, null);
    const ws = wb.getWorksheet("Neraca")!;
    let status = "";
    ws.eachRow((row) => { if (row.getCell(2).value === "Status") status = String(row.getCell(3).value); });
    assert.equal(status, "Seimbang");
  });
});
