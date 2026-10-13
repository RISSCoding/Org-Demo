import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { formatDateTime } from "@/lib/datetime";
import { dateParts } from "@/lib/site-data";

export type EventRowData = { slug: string; title: string; startDate: Date; location: string };

export function EventRow({ event, past = false }: { event: EventRowData; past?: boolean }) {
  const { day, month, year } = dateParts(event.startDate);
  return (
    <li className="border-t border-[var(--s-line)] first:border-t-0">
      <Link href={`/kegiatan/${event.slug}`} className="group grid grid-cols-[4.5rem_1fr_auto] gap-5 py-5 transition-colors hover:bg-[var(--s-panel)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] sm:px-3 sm:-mx-3">
        <div className={`border-t-4 pt-2 ${past ? "border-[var(--s-line)]" : "border-[#ffa500]"}`}>
          <p className="s-display text-3xl text-[var(--s-head)]">{day}</p>
          <p className="text-sm text-[var(--s-muted)]">
            {month} {year}
          </p>
        </div>
        <div className="min-w-0 space-y-1.5">
          <h3 className="text-xl font-semibold text-[var(--s-head)] group-hover:underline group-hover:underline-offset-4">
            {event.title}
          </h3>
          <p className="flex items-center gap-2 text-sm text-[var(--s-muted)]">
            <CalendarDays className="size-4 shrink-0" aria-hidden /> {formatDateTime(event.startDate)}
          </p>
          <p className="flex items-center gap-2 text-sm text-[var(--s-muted)]">
            <MapPin className="size-4 shrink-0" aria-hidden /> <span className="truncate">{event.location}</span>
          </p>
        </div>
        <ArrowRight className="mt-2 hidden size-5 shrink-0 -translate-x-1 text-[var(--s-muted)] opacity-0 transition-[transform,opacity] duration-200 ease-[var(--ease-out)] group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 sm:block" aria-hidden />
      </Link>
    </li>
  );
}
