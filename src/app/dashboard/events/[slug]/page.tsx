import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { auth } from "@/auth";
import { EventActions } from "@/components/event-actions";
import { eventPhase } from "@/components/event-card";
import { Badge } from "@/components/badge";
import { QrBox } from "@/components/qr-box";
import { COMMITTEE_STATUS, type CommitteeStatusKey } from "@/lib/committee-meta";
import { formatDateTime } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import { ticketPayload } from "@/lib/qr";
import Link from "next/link";
import { btnLine, cardCls } from "@/lib/ui";
import { BackLink } from "@/components/ui/back-link";

export default async function MemberEventDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const event = await prisma.event.findUnique({
    where: { slug },
    include: { _count: { select: { registrations: { where: { status: { not: "CANCELLED" } } } } } },
  });
  if (!event) notFound();

  const reg = await prisma.eventRegistration.findUnique({
    where: { eventId_userId: { eventId: event.id, userId } },
  });

  const committeeApp = await prisma.committeeApplication.findUnique({
    where: { eventId_userId: { eventId: event.id, userId } },
    select: { status: true },
  });
  const onCommittee = !!committeeApp && ["PENDING", "ACCEPTED", "WAITLIST"].includes(committeeApp.status);
  const recruiting = event.committeeOpen && event.endDate >= new Date() && (!event.committeeDeadline || event.committeeDeadline >= new Date());

  const phase = eventPhase(event);
  const ended = event.endDate < new Date();
  const full = event.quota !== null && event._count.registrations >= event.quota;
  const registered = !!reg && reg.status !== "CANCELLED";

  return (
    <div className="max-w-3xl space-y-6">
      <BackLink href="/dashboard/events" label="Kembali ke daftar event" />
      <div className="overflow-hidden rounded-sm border-b-4 border-[#ffa500] bg-black">
        {event.bannerUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.bannerUrl} alt="" className="aspect-[16/7] w-full object-cover" />
        )}
        {!event.bannerUrl && <div className="aspect-[16/5]" />}
      </div>

      <div className="space-y-2">
        <span className={`rounded-sm px-2 py-0.5 text-xs font-semibold ${phase.cls}`}>{phase.label}</span>
        <h1 className="s-display s-title text-3xl text-[var(--s-head)]">{event.title}</h1>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p className="flex items-center gap-2"><CalendarDays className="size-4" />{formatDateTime(event.startDate)} – {formatDateTime(event.endDate)}</p>
          <p className="flex items-center gap-2"><MapPin className="size-4" />{event.location}</p>
          <p className="flex items-center gap-2">
            <Users className="size-4" />
            {event._count.registrations}{event.quota !== null ? ` / ${event.quota}` : ""} peserta
          </p>
        </div>
      </div>

      <p className="whitespace-pre-wrap text-sm leading-relaxed">{event.description}</p>

      {(onCommittee || (committeeApp && committeeApp.status !== "WITHDRAWN") || recruiting) && (
        <section className={`${cardCls} flex flex-wrap items-center justify-between gap-3 p-5`}>
          <div className="space-y-1">
            <p className="font-medium">Kepanitiaan</p>
            {committeeApp && committeeApp.status !== "WITHDRAWN" ? (
              <p className="text-sm text-muted-foreground">
                Statusmu: <Badge tone={COMMITTEE_STATUS[committeeApp.status as CommitteeStatusKey].tone}>{COMMITTEE_STATUS[committeeApp.status as CommitteeStatusKey].label}</Badge>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Event ini membuka pendaftaran panitia{event.committeeDeadline ? ` sampai ${formatDateTime(event.committeeDeadline)}` : ""}.
              </p>
            )}
          </div>
          <Link href={`/dashboard/events/${event.slug}/panitia`} className={btnLine}>
            {committeeApp && committeeApp.status !== "WITHDRAWN" ? "Lihat kepanitiaan" : "Daftar jadi panitia"}
          </Link>
        </section>
      )}

      {onCommittee && !registered ? (
        <p className="rounded-sm border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
          Kamu terdaftar sebagai panitia di event ini, jadi tidak perlu mendaftar sebagai peserta.
        </p>
      ) : reg?.status === "ATTENDED" ? (
        <div className="rounded-sm border border-[var(--emerald)]/40 bg-[var(--emerald)]/10 px-4 py-3 text-sm">
          Kehadiranmu sudah tercatat{reg.attendedAt ? ` pada ${formatDateTime(reg.attendedAt)}` : ""}.
        </div>
      ) : (
        <EventActions
          eventId={event.id}
          registered={registered}
          canRegister={!ended && !full}
          disabledReason={ended ? "Event ini sudah berakhir." : full ? "Kuota sudah penuh." : undefined}
        />
      )}

      {registered && reg?.status === "REGISTERED" && (
        <section className={`${cardCls} space-y-3 p-5`}>
          <h2 className="text-lg font-semibold text-[var(--s-head)]">Tiket kamu</h2>
          <p className="text-sm text-muted-foreground">Tunjukkan QR ini ke panitia saat check-in (QR KTA juga bisa dipakai).</p>
          <QrBox value={ticketPayload(reg.qrCodeHash)} />
        </section>
      )}
    </div>
  );
}
