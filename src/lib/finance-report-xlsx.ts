import ExcelJS from "exceljs";
import { CATEGORY_LABEL } from "@/lib/finance";
import type { MonthlyReport } from "@/lib/finance-report";

const RP = '"Rp" #,##0';
const NAVY = "FF0B1F4B";

export async function buildFinanceReportXlsx(r: MonthlyReport): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "HIMMAN UKRI";

  // ---- Ringkasan (created first so it is the opening sheet) ----
  const sum = wb.addWorksheet("Ringkasan", { views: [{ showGridLines: false }] });
  // ---- Transaksi ----
  const ws = wb.addWorksheet("Transaksi");
  ws.columns = [
    { header: "No", key: "no", width: 6 },
    { header: "Tanggal", key: "date", width: 14 },
    { header: "Uraian", key: "title", width: 44 },
    { header: "Kategori", key: "cat", width: 16 },
    { header: "Pemasukan", key: "in", width: 18, style: { numFmt: RP } },
    { header: "Pengeluaran", key: "out", width: 18, style: { numFmt: RP } },
  ];
  const head = ws.getRow(1);
  head.font = { bold: true, color: { argb: "FFFFFFFF" } };
  head.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };

  r.rows.forEach((row, i) =>
    ws.addRow({
      no: i + 1,
      date: row.date,
      title: row.title,
      cat: CATEGORY_LABEL[row.category],
      in: row.income || null,
      out: row.expense || null,
    }),
  );
  ws.getColumn("date").numFmt = "dd/mm/yyyy";

  const last = r.rows.length + 1; // last data row
  const totalRow = ws.addRow({ title: "Total" });
  totalRow.font = { bold: true };
  if (r.rows.length > 0) {
    totalRow.getCell("in").value = { formula: `SUM(E2:E${last})`, result: r.income };
    totalRow.getCell("out").value = { formula: `SUM(F2:F${last})`, result: r.expense };
  } else {
    totalRow.getCell("in").value = 0;
    totalRow.getCell("out").value = 0;
  }
  ws.views = [{ state: "frozen", ySplit: 1 }];

  // ---- fill summary ----
  sum.getColumn(1).width = 30;
  sum.getColumn(2).width = 22;
  sum.getCell("A1").value = "Laporan Keuangan HIMMAN UKRI";
  sum.getCell("A1").font = { bold: true, size: 14, color: { argb: NAVY } };
  sum.getCell("A2").value = `Periode ${r.label}`;

  const incRef = `Transaksi!E${last + 1}`;
  const outRef = `Transaksi!F${last + 1}`;
  sum.getCell("A4").value = "Saldo awal";
  sum.getCell("B4").value = r.opening;
  sum.getCell("A5").value = "Total pemasukan";
  sum.getCell("B5").value = { formula: incRef, result: r.income };
  sum.getCell("A6").value = "Total pengeluaran";
  sum.getCell("B6").value = { formula: outRef, result: r.expense };
  sum.getCell("A7").value = "Saldo akhir";
  sum.getCell("B7").value = { formula: "B4+B5-B6", result: r.closing };
  for (const c of ["B4", "B5", "B6", "B7"]) sum.getCell(c).numFmt = RP;
  sum.getRow(7).font = { bold: true };

  sum.getCell("A9").value = "Iuran kas bulan ini";
  sum.getCell("A9").font = { bold: true };
  sum.getCell("A10").value = "Lunas";
  sum.getCell("B10").value = r.dues.paid;
  sum.getCell("A11").value = "Belum bayar";
  sum.getCell("B11").value = r.dues.pending;
  sum.getCell("A12").value = "Terlambat";
  sum.getCell("B12").value = r.dues.overdue;
  if (r.unverifiedExcluded > 0) {
    sum.getCell("A14").value = `Catatan: ${r.unverifiedExcluded} transaksi belum diverifikasi dan tidak dimasukkan.`;
    sum.getCell("A14").font = { italic: true, color: { argb: "FF64748B" } };
  }

  return Buffer.from(await wb.xlsx.writeBuffer());
}
