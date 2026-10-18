import { notFound } from "next/navigation";
import { EventForm } from "@/components/event-form";
import { BackLink } from "@/components/ui/back-link";
import { toInputValue } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import { getTenantPrisma } from "@/lib/prisma-tenant";
import { requirePermission } from "@/lib/rbac";

export default async function EditEvent({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("event:manage");
  const { id } = await params;
  const e = await tenantPrisma.event.findUnique({ where: { id } });
  if (!e) notFound();

  return (
    <div className="space-y-6">
      <BackLink href={`/admin/events/${e.id}`} label="Kembali ke detail event" />
      <h1 className="s-display s-title text-3xl text-[var(--s-head)]">Edit event</h1>
      <EventForm
        event={{
          id: e.id,
          title: e.title,
          description: e.description,
          location: e.location,
          startDate: toInputValue(e.startDate),
          endDate: toInputValue(e.endDate),
          quota: e.quota,
          isPublic: e.isPublic,
          bannerUrl: e.bannerUrl,
        }}
      />
    </div>
  );
}
