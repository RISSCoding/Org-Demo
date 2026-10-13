import JSZip from "jszip";
import { getCertificatePdf } from "@/lib/certificate-service";
import { prisma } from "@/lib/prisma";
import { ForbiddenError, requirePermission, UnauthorizedError } from "@/lib/rbac";
import { slugify } from "@/lib/slug";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("event:manage");
  } catch (e) {
    if (e instanceof UnauthorizedError) return new Response("Unauthorized", { status: 401 });
    if (e instanceof ForbiddenError) return new Response("Forbidden", { status: 403 });
    throw e;
  }

  const { id } = await ctx.params;
  const event = await prisma.event.findUnique({
    where: { id },
    select: {
      slug: true,
      certificates: {
        orderBy: { user: { fullName: "asc" } },
        select: { certificateNumber: true, user: { select: { fullName: true } } },
      },
    },
  });
  if (!event || event.certificates.length === 0) return new Response("Not found", { status: 404 });

  const zip = new JSZip();
  for (const c of event.certificates) {
    const pdf = await getCertificatePdf(c.certificateNumber);
    if (pdf) zip.file(`${slugify(c.user.fullName)}-${c.certificateNumber}.pdf`, pdf);
  }
  const out = await zip.generateAsync({ type: "uint8array", compression: "STORE" }); // PDFs are already compressed

  return new Response(out as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="sertifikat-${event.slug}.zip"`,
      "Cache-Control": "private, no-store",
    },
  });
}
