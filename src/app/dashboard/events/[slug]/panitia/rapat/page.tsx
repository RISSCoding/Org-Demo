import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, MinusCircle } from "lucide-react";
import { Badge } from "@/components/badge";
import { MeetingControls, MeetingForm, MemberAttendanceSelect, SelfCheckIn } from "@/components/committee/meetings";
import { getEventAccess } from "@/lib/committee";
import { formatDateTime } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import { cardCls } from "@/lib/ui";

export const metadata = { title: "Rapat panitia — HIMMAN UKRI" };

export default async function CommitteeMeetings({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug }, select: { id: true, title: true, slug: true } });
  if (!event) notFound();

  const access = await getEventAccess(event.id);
  if (!access.committee && !access.isAdmin) redirect(`/dashboard/events/${event.slug}/panitia`);

  const [meetings, members] = await Promise.all([
    prisma.committeeMeeting.findMany({
      where: { eventId: event.id },
      orderBy: { startsAt: "desc" },
      select: {
        id: true, title: true, startsAt: true, location: true, code: true, attendanceOpen: true,
        attendances: { select: { userId: true, status: true, method: true } },
      },
    }),
    access.canMeetings
      ? prisma.committeeApplication.findMany({
          where: { eventId: event.id, status: "ACCEPTED" },
          orderBy: { user: { fullName: "asc" } },
          select: { userId: true, role: true, user: { select: { fullName: true } }, assignedDivision: { select: { name: true } } },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="max-w-3xl space-y-8">
      <div className="space-y-2">
        <Link href={`/dashboard/events/${event.slug}/panitia`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden /> Kembali ke kepanitiaan
        </Link>
        <h1 className="s-display s-title text-3xl text-[var(--s-head)]">Rapat panitia</h1>
        <p className="text-sm text-muted-foreground">
          {event.title}.{" "}
          {access.canMeetings
            ? "Buat rapat, buka absensi saat dimulai, lalu bacakan kodenya. Panitia absen sendiri dari HP-nya."
            : "Saat rapat dimulai, sekretaris akan membuka absensi dan menunjukkan kodenya. Masukkan kode itu di sini."}
        </p>
      </div>

      {access.canMeetings && (
        <section className={`${cardCls} space-y-3 p-5`} aria-labelledby="buat">
          <h2 id="buat" className="text-lg font-semibold text-[var(--s-head)]">Buat rapat baru</h2>
          <MeetingForm eventId={event.id} />
        </section>
      )}

      {meetings.length === 0 && <p className={`${cardCls} p-5 text-sm text-muted-foreground`}>Belum ada rapat yang dijadwalkan.</p>}

      <ul className="space-y-4">
        {meetings.map((m) => {
          const mine = m.attendances.find((a) => a.userId === access.user.id);
          const present = m.attendances.filter((a) => a.status === "PRESENT").length;
          const excused = m.attendances.filter((a) => a.status === "EXCUSED").length;
          return (
            <li key={m.id} className={`${cardCls} space-y-4 p-5`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{m.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(m.startsAt)}{m.location ? ` · ${m.location}` : ""}
                  </p>
                </div>
                <Badge tone={m.attendanceOpen ? "ok" : "muted"}>{m.attendanceOpen ? "Absensi dibuka" : "Absensi ditutup"}</Badge>
              </div>

              {access.committee && (
                mine ? (
                  <p className="flex items-center gap-2 text-sm font-medium text-[var(--emerald)]">
                    <CheckCircle2 className="size-4" aria-hidden /> {mine.status === "EXCUSED" ? "Tercatat izin" : "Kehadiranmu tercatat"}
                  </p>
                ) : m.attendanceOpen ? (
                  <SelfCheckIn meetingId={m.id} />
                ) : (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MinusCircle className="size-4" aria-hidden /> Kamu belum tercatat hadir. Absensi dibuka oleh sekretaris saat rapat berlangsung.
                  </p>
                )
              )}

              {access.canMeetings && (
                <div className="space-y-4 border-t border-border pt-4">
                  <MeetingControls meetingId={m.id} title={m.title} code={m.code} open={m.attendanceOpen} />
                  <p className="tabular text-sm text-muted-foreground">
                    {present} hadir · {excused} izin · {Math.max(0, members.length - present - excused)} belum tercatat dari {members.length} panitia
                  </p>
                  <ul className="divide-y divide-border rounded-sm border border-border">
                    {members.map((p) => {
                      const a = m.attendances.find((x) => x.userId === p.userId);
                      return (
                        <li key={p.userId} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
                          <span>
                            {p.user.fullName}
                            {p.assignedDivision && <span className="text-muted-foreground"> · {p.assignedDivision.name}</span>}
                          </span>
                          <MemberAttendanceSelect meetingId={m.id} userId={p.userId} name={p.user.fullName} value={(a?.status ?? "NONE") as "NONE" | "PRESENT" | "EXCUSED"} />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
