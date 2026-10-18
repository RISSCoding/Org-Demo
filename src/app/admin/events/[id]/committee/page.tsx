import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CommitteeManager } from "@/components/committee/manager";
import { formatDateTime } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import { getTenantPrisma } from "@/lib/prisma-tenant";
import { requirePermission } from "@/lib/rbac";

export const metadata = { title: "Kepanitiaan — ORG" };

export default async function AdminCommittee({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ s?: string }>;
}) {
  await requirePermission("event:manage");
  const { id } = await params;
  const { s } = await searchParams;
  const event = await tenantPrisma.event.findUnique({ where: { id }, select: { id: true, slug: true, title: true, startDate: true, location: true } });
  if (!event) notFound();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Link href={`/admin/events/${event.id}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden /> Kembali ke event
        </Link>
        <h1 className="s-display s-title text-3xl text-[var(--s-head)]">Kepanitiaan: {event.title}</h1>
        <p className="text-sm text-muted-foreground">
          {formatDateTime(event.startDate)} · {event.location}. Buka pendaftaran, atur divisi, lalu seleksi pendaftar. Ketua panitia yang kamu tunjuk bisa melanjutkan seleksi dari portal anggotanya.
        </p>
      </div>
      <CommitteeManager eventId={event.id} isAdmin basePath={`/admin/events/${event.id}/committee`} meetingsHref={`/dashboard/events/${event.slug}/panitia/rapat`} status={s} />
    </div>
  );
}
