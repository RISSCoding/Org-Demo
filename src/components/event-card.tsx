import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { formatDateTime } from "@/lib/datetime";
import { cardLink } from "@/lib/ui";

export type EventCardData = {
  slug: string;
  title: string;
  bannerUrl: string | null;
  startDate: Date;
  endDate: Date;
  location: string;
  quota: number | null;
  registered: number;
};

export function eventPhase(e: { startDate: Date; endDate: Date }, now = new Date()) {
  if (e.endDate < now) return { label: "Selesai", cls: "bg-muted text-muted-foreground" };
  if (e.startDate <= now) return { label: "Berlangsung", cls: "bg-[var(--state-success-bg)] text-[var(--emerald)]" };
  return { label: "Akan datang", cls: "bg-[#ffa500]/20 text-[var(--state-warning-fg)]" };
}

export function EventCard({
  event,
  href,
  badge,
}: {
  event: EventCardData;
  href: string;
  badge?: string;
}) {
  const phase = eventPhase(event);
  return (
    <Link href={href} className={`${cardLink} group block overflow-hidden`}>
      <div className="relative aspect-[16/7] overflow-hidden border-b-4 border-[#ffa500] bg-black">
        {event.bannerUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.bannerUrl} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-slower ease-[var(--ease-out)] group-hover:scale-105" />
        )}
        <span className="absolute left-3 top-3 rounded-sm bg-card">
          <span className={`block rounded-sm px-2 py-0.5 text-xs font-semibold ${phase.cls}`}>{phase.label}</span>
        </span>
        {badge && (
          <span className="absolute right-3 top-3 rounded-sm bg-[var(--emerald)] px-2 py-0.5 text-xs font-semibold text-white">
            {badge}
          </span>
        )}
      </div>
      <div className="space-y-2 p-4">
        <h3 className="font-semibold leading-snug group-hover:underline group-hover:underline-offset-4">{event.title}</h3>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="size-4 shrink-0" /> {formatDateTime(event.startDate)}
        </p>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0" /> <span className="truncate">{event.location}</span>
        </p>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="size-4 shrink-0" />
          {event.registered}
          {event.quota !== null ? ` / ${event.quota}` : ""} peserta
        </p>
      </div>
    </Link>
  );
}
