import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardList, ScanLine } from "lucide-react";
import { Badge } from "@/components/badge";
import { CommitteeApplyForm } from "@/components/committee/apply-form";
import { CommitteeRoster } from "@/components/committee/manager";
import { WithdrawCommitteeButton } from "@/components/committee/withdraw-button";
import { COMMITTEE_STATUS, roleLabel, type CommitteeStatusKey } from "@/lib/committee-meta";
import { divisionsWithCounts, getEventAccess } from "@/lib/committee";
import { formatDateTime } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import { btnLine, btnPrimary, cardCls } from "@/lib/ui";

export const metadata = { title: "Kepanitiaan — HIMMAN UKRI" };

export default async function MemberCommittee({
  params,
  }: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug },
    select: { id: true, title: true, slug: true, startDate: true, endDate: true, location: true, committeeOpen: true, committeeDeadline: true },
  });
  if (!event) notFound();

  const access = await getEventAccess(event.id);
  const [app, divisions] = await Promise.all([
    prisma.committeeApplication.findUnique({
      where: { eventId_userId: { eventId: event.id, userId: access.user.id } },
      select: {
        status: true, role: true, motivation: true, createdAt: true, assignedDivisionId: true,
        firstChoice: { select: { name: true } }, secondChoice: { select: { name: true } },
      },
    }),
    divisionsWithCounts(event.id),
  ]);

  const now = new Date();
  const deadlinePassed = !!event.committeeDeadline && event.committeeDeadline < now;
  const canApply = event.committeeOpen && !deadlinePassed && event.endDate >= now && (!app || app.status === "WITHDRAWN");
  const options = divisions.map((d) => ({ id: d.id, name: d.name, quota: d.quota, accepted: d.accepted }));
  const h2 = "text-lg font-semibold text-[var(--s-head)]";

  let mine = { dayAt: null as Date | null, meetings: 0, present: 0, cert: null as string | null };
  let accepted: { id: string; role: string; assignedDivisionId: number | null; user: { fullName: string; nim: string } }[] = [];
  let attendance = { registered: 0, attended: 0 };
  if (app?.status === "ACCEPTED") {
    const [acc, regs, myApp, meetingTotal, myPresent, myCert] = await Promise.all([
      prisma.committeeApplication.findMany({
        where: { eventId: event.id, status: "ACCEPTED" },
        orderBy: [{ role: "asc" }, { user: { fullName: "asc" } }],
        select: { id: true, role: true, assignedDivisionId: true, user: { select: { fullName: true, nim: true } } },
      }),
      prisma.eventRegistration.groupBy({ by: ["status"], where: { eventId: event.id }, _count: true }),
      prisma.committeeApplication.findUnique({ where: { eventId_userId: { eventId: event.id, userId: access.user.id } }, select: { attendedAt: true } }),
      prisma.committeeMeeting.count({ where: { eventId: event.id } }),
      prisma.committeeMeetingAttendance.count({ where: { userId: access.user.id, status: "PRESENT", meeting: { eventId: event.id } } }),
      prisma.certificate.findUnique({ where: { eventId_userId: { eventId: event.id, userId: access.user.id } }, select: { certificateNumber: true } }),
    ]);
    accepted = acc;
    mine = { dayAt: myApp?.attendedAt ?? null, meetings: meetingTotal, present: myPresent, cert: myCert?.certificateNumber ?? null };
    const n = (k: string) => regs.find((r: { status: string; _count: number }) => r.status === k)?._count ?? 0;
    attendance = { registered: n("REGISTERED") + n("ATTENDED"), attended: n("ATTENDED") };
  }
  const myDivision = divisions.find((d) => d.id === app?.assignedDivisionId)?.name;

  return (
    <div className="max-w-3xl space-y-8">
      <div className="space-y-2">
        <Link href={`/dashboard/events/${event.slug}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden /> Kembali ke event
        </Link>
        <h1 className="s-display s-title text-3xl text-[var(--s-head)]">Kepanitiaan</h1>
        <p className="text-sm text-muted-foreground">
          {event.title} · {formatDateTime(event.startDate)} · {event.location}
        </p>
      </div>

      {/* 1. Status milik pengguna */}
      {app && app.status !== "WITHDRAWN" && (
        <section className={`${cardCls} space-y-4 p-5`} aria-labelledby="status-saya">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="status-saya" className={h2}>Status pendaftaranmu</h2>
            <Badge tone={COMMITTEE_STATUS[app.status as CommitteeStatusKey].tone}>{COMMITTEE_STATUS[app.status as CommitteeStatusKey].label}</Badge>
          </div>

          {app.status === "ACCEPTED" && (
            <p className="text-sm leading-relaxed">
              Selamat, kamu diterima sebagai <strong>{roleLabel(app.role)}</strong>
              {myDivision ? <> di divisi <strong>{myDivision}</strong></> : null}. Koordinasi lebih lanjut dilakukan lewat ketua panitia.
            </p>
          )}
          {app.status === "PENDING" && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              Pendaftaranmu sudah masuk dan sedang menunggu seleksi. Cek halaman ini lagi nanti untuk melihat hasilnya.
            </p>
          )}
          {app.status === "WAITLIST" && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              Kamu masuk daftar cadangan. Kalau ada slot kosong, status ini bisa berubah menjadi diterima.
            </p>
          )}
          {app.status === "REJECTED" && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              Kali ini kamu belum bisa bergabung sebagai panitia event ini. Kamu masih bisa mendaftar sebagai peserta dan ikut kepanitiaan event berikutnya.
            </p>
          )}

          <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[8rem_1fr]">
            <dt className="text-muted-foreground">Pilihan divisi</dt>
            <dd>{app.firstChoice.name}{app.secondChoice ? `, lalu ${app.secondChoice.name}` : ""}</dd>
            <dt className="text-muted-foreground">Didaftarkan</dt>
            <dd>{formatDateTime(app.createdAt)}</dd>
          </dl>

          {app.status === "ACCEPTED" && (
            <div className="flex flex-wrap gap-3">
              {access.canScan && (
                <Link href={`/dashboard/events/${event.slug}/panitia/scan`} className={btnPrimary}>
                  <ScanLine className="size-4" aria-hidden /> Buka scanner check-in
                </Link>
              )}
              <Link href={`/dashboard/events/${event.slug}/panitia/rapat`} className={btnLine}>
                <ClipboardList className="size-4" aria-hidden /> Rapat dan absensi
              </Link>
            </div>
          )}
          {(app.status === "PENDING" || app.status === "WAITLIST" || app.status === "ACCEPTED") && (
            <WithdrawCommitteeButton eventId={event.id} accepted={app.status === "ACCEPTED"} />
          )}
        </section>
      )}

      {/* 2. Formulir pendaftaran */}
      {canApply && (
        <section className="space-y-4" aria-labelledby="daftar">
          <div className="space-y-1">
            <h2 id="daftar" className={h2}>Daftar jadi panitia</h2>
            <p className="text-sm text-muted-foreground">
              Pilih divisi, ceritakan alasanmu, lalu tunggu hasil seleksi di halaman ini.
              {event.committeeDeadline && <> Pendaftaran ditutup <strong>{formatDateTime(event.committeeDeadline)}</strong>.</>}
            </p>
          </div>
          {divisions.some((d) => d.description) && (
            <ul className="grid gap-3 sm:grid-cols-2">
              {divisions.map((d) => (
                <li key={d.id} className={`${cardCls} p-4 text-sm`}>
                  <p className="font-medium">{d.name}</p>
                  {d.description && <p className="mt-1 text-muted-foreground">{d.description}</p>}
                </li>
              ))}
            </ul>
          )}
          <CommitteeApplyForm eventId={event.id} divisions={options} />
        </section>
      )}
      {!canApply && !app && !access.canManage && (
        <p className={`${cardCls} p-5 text-sm text-muted-foreground`}>
          {event.endDate < now
            ? "Event ini sudah berakhir."
            : deadlinePassed
              ? "Pendaftaran panitia untuk event ini sudah ditutup."
              : "Pendaftaran panitia untuk event ini belum dibuka. Pantau halaman ini atau pengumuman himpunan."}
        </p>
      )}

      {/* 3. Panitia biasa: susunan dan ringkasan kehadiran */}
      {app?.status === "ACCEPTED" && (
        <>
          <section className="space-y-3" aria-labelledby="ringkasan">
            <h2 id="ringkasan" className={h2}>Ringkasan hari-H</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className={`${cardCls} p-5`}>
                <p className="text-sm text-muted-foreground">Peserta terdaftar</p>
                <p className="s-display tabular mt-2 text-3xl">{attendance.registered}</p>
              </div>
              <div className={`${cardCls} p-5`}>
                <p className="text-sm text-muted-foreground">Sudah check-in</p>
                <p className="s-display tabular mt-2 text-3xl">{attendance.attended}</p>
              </div>
            </div>
          </section>
          <section className={`${cardCls} space-y-2 p-5`} aria-labelledby="kehadiranku">
            <h2 id="kehadiranku" className={h2}>Kehadiranmu</h2>
            <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[10rem_1fr]">
              <dt className="text-muted-foreground">Hari-H</dt>
              <dd>{mine.dayAt ? `Tercatat hadir, ${formatDateTime(mine.dayAt)}` : "Belum tercatat. Tunjukkan QR KTA-mu ke petugas scanner."}</dd>
              <dt className="text-muted-foreground">Rapat</dt>
              <dd className="tabular">{mine.meetings === 0 ? "Belum ada rapat" : `${mine.present} dari ${mine.meetings} rapat`}</dd>
              <dt className="text-muted-foreground">Sertifikat</dt>
              <dd>
                {mine.cert ? (
                  <Link href="/dashboard/certificates" className="font-medium text-[var(--emerald)] underline underline-offset-4">Sudah terbit, lihat di brankas sertifikat</Link>
                ) : (
                  "Belum terbit. Terbit setelah kehadiran hari-H tercatat dan diproses ketua."
                )}
              </dd>
            </dl>
          </section>
          <section className="space-y-3" aria-labelledby="susunan">
            <h2 id="susunan" className={h2}>Susunan panitia</h2>
            <CommitteeRoster divisions={divisions} accepted={accepted} />
          </section>
        </>
      )}

      {/* 4. Ketua panitia dan pengurus: pintu ke halaman kelola (terpisah dari urusan pribadi di atas) */}
      {access.canManage && (
        <section className={`${cardCls} flex flex-wrap items-center justify-between gap-3 border-l-4 border-l-[#ffa500] p-5`} aria-labelledby="kelola">
          <div className="space-y-1">
            <h2 id="kelola" className="font-semibold">Kelola kepanitiaan</h2>
            <p className="text-sm text-muted-foreground">Buka pendaftaran, atur divisi, dan seleksi pendaftar.</p>
          </div>
          <Link href={`/dashboard/events/${event.slug}/panitia/kelola`} className={btnLine}>
            Buka halaman kelola
          </Link>
        </section>
      )}
    </div>
  );
}
