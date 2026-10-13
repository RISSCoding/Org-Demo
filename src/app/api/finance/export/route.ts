import { buildFinanceWorkbook, isExportReport } from "@/lib/finance-export-xlsx";
import { parsePeriod } from "@/lib/finance-ledger";
import { hasFinanceRead, loadBook, loadTransactionsForExport, resolveExportScope } from "@/lib/finance-statements";
import { requirePermission, UnauthorizedError } from "@/lib/rbac";

/**
 * Unduhan Excel untuk panel admin dan panel anggota.
 * - Anggota (login biasa): selalu hanya transaksi terverifikasi, tanpa catatan.
 * - Staf keuangan (finance:read): boleh meminta scope=all untuk menyertakan yang belum diverifikasi.
 */
export async function GET(req: Request) {
  let user;
  try {
    user = await requirePermission();
  } catch (e) {
    if (e instanceof UnauthorizedError) return new Response("Unauthorized", { status: 401 });
    throw e;
  }

  const q = new URL(req.url).searchParams;
  const requested = q.get("report") ?? "all";
  if (!isExportReport(requested)) return new Response("Invalid report", { status: 400 });

  const staff = hasFinanceRead(user);
  const scope = resolveExportScope(staff, q.get("scope"));
  const keys = parsePeriod({ from: q.get("from") ?? undefined, to: q.get("to") ?? undefined });

  const [book, transactions] = await Promise.all([
    loadBook({ keys, scope }),
    requested === "all" ? loadTransactionsForExport({ keys, scope }) : Promise.resolve(undefined),
  ]);
  const body = await buildFinanceWorkbook({ report: requested, book, transactions, staff });

  const name = `keuangan-${requested === "all" ? "lengkap" : requested}-${keys.from ?? "awal"}_${keys.to ?? "kini"}.xlsx`;
  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
