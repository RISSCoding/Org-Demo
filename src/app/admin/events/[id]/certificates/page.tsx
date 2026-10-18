import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTenantPrisma } from "@/lib/prisma-tenant";
import { requirePermission } from "@/lib/rbac";
import { PageHeader } from "@/components/ui/page-header";
import { BackLink } from "@/components/ui/back-link";
import { CertificateAudit } from "@/components/certificate-audit";

export const metadata = { title: "Audit Sertifikat — ORG" };
export const dynamic = "force-dynamic";

export default async function CertificatesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("event:manage");
  const { id } = await params;

  const event = await tenantPrisma.event.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      startDate: true,
      registrations: {
        orderBy: [{ status: "asc" }, { user: { fullName: "asc" } }],
        select: {
          id: true,
          status: true,
          attendedAt: true,
          user: { select: { id: true, fullName: true, nim: true } },
        },
      },
      certificates: {
        select: {
          userId: true,
          certificateNumber: true,
          issuedAt: true,
          kind: true,
          roleTitle: true,
        },
      },
    },
  });
  if (!event) notFound();

  const certByUser = new Map(event.certificates.map((c) => [c.userId, c]));

  const rows = event.registrations.map((r) => {
    const cert = certByUser.get(r.user.id);
    return {
      userId: r.user.id,
      fullName: r.user.fullName,
      nim: r.user.nim,
      regStatus: r.status,
      attendedAt: r.attendedAt?.toISOString() ?? null,
      certificate: cert
        ? {
            number: cert.certificateNumber,
            issuedAt: cert.issuedAt.toISOString(),
            kind: cert.kind,
            roleTitle: cert.roleTitle,
          }
        : null,
    };
  });

  const stats = {
    total: rows.length,
    attended: rows.filter((r) => r.regStatus === "ATTENDED").length,
    withCert: rows.filter((r) => r.certificate).length,
    missing: rows.filter((r) => r.regStatus === "ATTENDED" && !r.certificate).length,
    notCheckedIn: rows.filter((r) => r.regStatus === "REGISTERED").length,
  };

  return (
    <div className="space-y-6">
      <BackLink href={`/admin/events/${event.id}`} label="Kembali ke detail event" />
      <PageHeader
        title="Audit sertifikat"
        description={`Kelola penerbitan sertifikat untuk ${event.title}. Lihat siapa yang sudah dan belum dapat.`}
      />
      <CertificateAudit eventId={event.id} rows={rows} stats={stats} />
    </div>
  );
}
