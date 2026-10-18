import { notFound } from "next/navigation";
import { Scanner } from "@/components/scanner";
import { BackLink } from "@/components/ui/back-link";
import { prisma } from "@/lib/prisma";
import { getTenantPrisma } from "@/lib/prisma-tenant";
import { requirePermission } from "@/lib/rbac";

export const metadata = { title: "Scanner — ORG" };

export default async function ScanPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("event:manage");
  const { id } = await params;
  const event = await tenantPrisma.event.findUnique({ where: { id }, select: { id: true, title: true } });
  if (!event) notFound();

  return (
    <div className="space-y-6">
      <BackLink href={`/admin/events/${event.id}`} label="Kembali ke detail event" />
      <div>
        <h1 className="s-display s-title text-3xl text-[var(--s-head)]">Check-in: {event.title}</h1>
        <p className="text-sm text-muted-foreground">
          Scan QR tiket event atau QR KTA peserta. Peserta harus sudah terdaftar.
        </p>
      </div>
      <Scanner eventId={event.id} />
    </div>
  );
}
