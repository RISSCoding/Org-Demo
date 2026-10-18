import { auth } from "@/auth";
import { CERT_NUMBER_RE, getCertificatePdf } from "@/lib/certificate-service";
import { prisma } from "@/lib/prisma";
import { getTenantPrisma } from "@/lib/prisma-tenant";

export async function GET(req: Request, ctx: { params: Promise<{ number: string }> }) {
  const session = await auth()

  const tenantPrisma = getTenantPrisma(session!.user.organizationId!);;

  const user = session?.user;
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { number } = await ctx.params;
  if (!CERT_NUMBER_RE.test(number)) return new Response("Not found", { status: 404 });

  const cert = await tenantPrisma.certificate.findUnique({
    where: { certificateNumber: number },
    select: { userId: true },
  });
  if (!cert) return new Response("Not found", { status: 404 });

  const isStaff = user.role === "SUPER_ADMIN" || user.permissions.includes("event:manage");
  if (cert.userId !== user.id && !isStaff) return new Response("Forbidden", { status: 403 });

  const pdf = await getCertificatePdf(number);
  if (!pdf) return new Response("Not found", { status: 404 });

  const inline = new URL(req.url).searchParams.get("inline") === "1";
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="Sertifikat-${number}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
