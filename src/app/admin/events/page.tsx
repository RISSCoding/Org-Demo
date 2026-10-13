import Link from "next/link";
import { Plus } from "lucide-react";
import { eventPhase } from "@/components/event-card";
import { formatDateTime } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { btnPrimary, cardCls } from "@/lib/ui";

export const metadata = { title: "Event — HIMMAN UKRI" };

export default async function AdminEvents() {
  await requirePermission("event:manage");

  const [events, attended] = await Promise.all([
    prisma.event.findMany({
      orderBy: { startDate: "desc" },
      select: {
        id: true, title: true, startDate: true, endDate: true, location: true, quota: true, isPublic: true,
        _count: { select: { registrations: { where: { status: { not: "CANCELLED" } } } } },
      },
    }),
    prisma.eventRegistration.groupBy({ by: ["eventId"], where: { status: "ATTENDED" }, _count: true }),
  ]);
  const attendedMap = new Map(attended.map((a) => [a.eventId, a._count]));

  const th = "px-4 py-3 text-left text-sm font-semibold text-foreground";
  const td = "px-4 py-3 text-sm";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="s-display s-title text-3xl text-[var(--s-head)]">Event</h1>
          <p className="text-sm text-muted-foreground">Kelola kegiatan, pendaftaran, dan kehadiran.</p>
        </div>
        <Link href="/admin/events/new" className={btnPrimary}>
          <Plus className="size-4" /> Buat event
        </Link>
      </div>

      <div className={`${cardCls} overflow-x-auto`}>
        <table className="w-full min-w-[760px]">
          <thead className="border-b border-border">
            <tr>
              <th className={th}>Event</th><th className={th}>Waktu</th><th className={th}>Status</th>
              <th className={th}>Terdaftar</th><th className={th}>Hadir</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {events.length === 0 && (
              <tr><td colSpan={5} className={`${td} text-muted-foreground`}>Belum ada event.</td></tr>
            )}
            {events.map((e) => {
              const phase = eventPhase(e);
              return (
                <tr key={e.id} className="hover:bg-muted/50">
                  <td className={td}>
                    <Link href={`/admin/events/${e.id}`} className="font-medium hover:underline hover:underline-offset-4">{e.title}</Link>
                    <p className="text-xs text-muted-foreground">{e.location}{e.isPublic ? " · publik" : ""}</p>
                  </td>
                  <td className={td}>{formatDateTime(e.startDate)}</td>
                  <td className={td}>
                    <span className={`rounded-sm px-2 py-0.5 text-xs font-semibold ${phase.cls}`}>{phase.label}</span>
                  </td>
                  <td className={td}>{e._count.registrations}{e.quota !== null ? ` / ${e.quota}` : ""}</td>
                  <td className={td}>{attendedMap.get(e.id) ?? 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
