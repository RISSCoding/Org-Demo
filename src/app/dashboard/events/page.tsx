import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { auth } from "@/auth";
import { EventCard, type EventCardData } from "@/components/event-card";
import { formatDateTime } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import { cardLink } from "@/lib/ui";

export const metadata = { title: "Event — ORG" };

const select = {
  id: true, slug: true, title: true, bannerUrl: true, startDate: true, endDate: true, location: true, quota: true,
  _count: { select: { registrations: { where: { status: { not: "CANCELLED" as const } } } } },
} as const;

export default async function MemberEvents() {
  const session = await auth();
  const userId = session!.user.id;
  const now = new Date();

  const [recruiting, upcoming, past, mine] = await Promise.all([
    prisma.event.findMany({
      where: { committeeOpen: true, endDate: { gte: now }, OR: [{ committeeDeadline: null }, { committeeDeadline: { gte: now } }] },
      orderBy: { startDate: "asc" },
      select: { id: true, slug: true, title: true, committeeDeadline: true },
    }),
    prisma.event.findMany({ where: { endDate: { gte: now } }, orderBy: { startDate: "asc" }, select }),
    prisma.event.findMany({ where: { endDate: { lt: now } }, orderBy: { startDate: "desc" }, take: 12, select }),
    prisma.eventRegistration.findMany({ where: { userId }, select: { eventId: true, status: true } }),
  ]);
  const myStatus = new Map(mine.map((m) => [m.eventId, m.status]));

  const toCard = (e: (typeof upcoming)[number]): EventCardData => ({ ...e, registered: e._count.registrations });
  const badge = (id: string) => {
    const s = myStatus.get(id);
    return s === "ATTENDED" ? "Hadir" : s === "REGISTERED" ? "Terdaftar" : undefined;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="s-display s-title text-3xl text-[var(--s-head)]">Event</h1>
        <p className="text-sm text-muted-foreground">Daftar kegiatan himpunan dan tiket QR-mu.</p>
      </div>

      {recruiting.length > 0 && (
        <section className="space-y-3" aria-labelledby="open-panitia">
          <h2 id="open-panitia" className="text-lg font-semibold text-[var(--s-head)]">Pendaftaran panitia dibuka</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {recruiting.map((e: { id: string; slug: string; title: string; committeeDeadline: Date | null }) => (
              <li key={e.id}>
                <Link href={`/dashboard/events/${e.slug}/panitia`} className={`${cardLink} group flex items-center justify-between gap-3 border-l-4 border-l-[#ffa500] p-4`}>
                  <span>
                    <span className="block font-medium">{e.title}</span>
                    <span className="block text-sm text-muted-foreground">
                      {e.committeeDeadline ? `Daftar sampai ${formatDateTime(e.committeeDeadline)}` : "Tanpa batas waktu"}
                    </span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--s-head)]">Akan datang &amp; berlangsung</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada event terjadwal.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {upcoming.map((e) => (
              <EventCard key={e.id} event={toCard(e)} href={`/dashboard/events/${e.slug}`} badge={badge(e.id)} />
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[var(--s-head)]">Sudah selesai</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {past.map((e) => (
              <EventCard key={e.id} event={toCard(e)} href={`/dashboard/events/${e.slug}`} badge={badge(e.id)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
