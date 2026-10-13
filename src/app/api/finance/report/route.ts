import { buildFinanceReportXlsx } from "@/lib/finance-report-xlsx";
import { renderFinanceReportPdf } from "@/lib/finance-report-pdf";
import { getMonthlyReport } from "@/lib/finance-report";
import { MONTH_RE } from "@/lib/finance";
import { getFinanceSigners } from "@/lib/officers";
import { ForbiddenError, requirePermission, UnauthorizedError } from "@/lib/rbac";

export async function GET(req: Request) {
  try {
    await requirePermission("finance:read");
  } catch (e) {
    if (e instanceof UnauthorizedError) return new Response("Unauthorized", { status: 401 });
    if (e instanceof ForbiddenError) return new Response("Forbidden", { status: 403 });
    throw e;
  }

  const url = new URL(req.url);
  const month = url.searchParams.get("month") ?? "";
  const format = url.searchParams.get("format") === "xlsx" ? "xlsx" : "pdf";
  if (!MONTH_RE.test(month)) return new Response("Invalid month", { status: 400 });

  const report = await getMonthlyReport(month);
  const body = format === "pdf" ? await renderFinanceReportPdf(report, await getFinanceSigners()) : await buildFinanceReportXlsx(report);

  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type":
        format === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="laporan-keuangan-${month}.${format}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
