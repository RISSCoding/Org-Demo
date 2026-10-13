import ExcelJS from "exceljs";

/**
 * Impor anggota dari spreadsheet data mahasiswa baru universitas.
 * Format file: judul + header di atas, lalu blok per prodi:
 *   "PRODI MANAJEMEN" (baris judul blok) -> baris data: NO | NO | NPM | NAMA LENGKAP
 * Angkatan diambil dari 4 digit pertama NPM (20261610001 -> 2026).
 */

export type ImportRow = { nim: string; fullName: string; batchYear: number };
export type ImportInvalid = { row: number; reason: string };
export type ImportPreview = {
  error?: string;
  prodiLabel?: string;
  sections?: string[];
  rows?: (ImportRow & { exists: boolean })[];
  invalid?: ImportInvalid[];
};

/** Password generik: NPM + "@ukri" + 2 digit terakhir angkatan. 20251610207, 2025 -> 20251610207@ukri25 */
export const defaultPassword = (nim: string, batchYear: number) => `${nim}@ukri${String(batchYear).slice(-2)}`;

/** Email wajib & unik di skema, sedangkan spreadsheet tidak punya email. Anggota bisa menggantinya di profil. */
export const placeholderEmail = (nim: string) => `${nim}@mahasiswa.himman.local`;

export const batchYearFromNpm = (nim: string) => Number(nim.slice(0, 4));

const norm = (s: string) => s.replace(/\s+/g, " ").trim().toUpperCase();

function cellText(v: ExcelJS.CellValue): string {
  if (v == null) return "";
  if (typeof v === "object") {
    if ("richText" in v) return v.richText.map((t) => t.text).join("");
    if ("result" in v) return v.result == null ? "" : String(v.result);
    if ("text" in v) return String(v.text ?? "");
    return "";
  }
  return String(v);
}

export async function parseNewStudentsSheet(buf: Buffer, prodi: string) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf as unknown as ExcelJS.Buffer);

  const target = `PRODI ${norm(prodi).replace(/^PRODI /, "")}`;
  const sections: string[] = [];
  const rows: ImportRow[] = [];
  const invalid: ImportInvalid[] = [];
  const seen = new Set<string>();
  let found = false;

  for (const ws of wb.worksheets) {
    let current = "";
    ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      const a = norm(cellText(row.getCell(1).value));
      const c = cellText(row.getCell(3).value).trim();
      const d = cellText(row.getCell(4).value).replace(/\s+/g, " ").trim();

      // Judul blok digabung (merge) A:D, dan ExcelJS mengulang teks sel induk di kolom C/D,
      // jadi jangan mensyaratkan kolom NPM kosong. Baris data selalu berawal angka di kolom A.
      if (a.startsWith("PRODI ")) {
        current = a;
        sections.push(a.replace(/^PRODI /, ""));
        if (a === target) found = true;
        return;
      }
      if (current !== target || c === "") return;

      const nim = c.replace(/\s+/g, "");
      if (!/^\d{6,20}$/.test(nim)) return invalid.push({ row: rowNumber, reason: `NPM "${c}" tidak valid` });
      if (d.length < 3) return invalid.push({ row: rowNumber, reason: `Nama kosong/terlalu pendek (NPM ${nim})` });
      const batchYear = batchYearFromNpm(nim);
      if (batchYear < 2000 || batchYear > new Date().getFullYear() + 1) {
        return invalid.push({ row: rowNumber, reason: `Angkatan dari NPM ${nim} tidak wajar` });
      }
      if (seen.has(nim)) return invalid.push({ row: rowNumber, reason: `NPM ${nim} dobel di file` });
      seen.add(nim);
      rows.push({ nim, fullName: d, batchYear });
    });
  }
  return { found, sections, rows, invalid };
}
