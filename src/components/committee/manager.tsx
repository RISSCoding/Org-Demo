import Link from "next/link";
import { Badge } from "@/components/badge";
import { CommitteeRecap } from "@/components/committee/recap";
import { CommitteeSettingsForm } from "@/components/committee/settings-form";
import { DivisionEditor } from "@/components/committee/division-editor";
import { ReviewForm } from "@/components/committee/review-form";
import { COMMITTEE_STATUS, roleLabel, type CommitteeStatusKey } from "@/lib/committee-meta";
import { divisionsWithCounts } from "@/lib/committee";
import { formatDateTime, toInputValue } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import { cardCls } from "@/lib/ui";

const TABS: CommitteeStatusKey[] = ["PENDING", "ACCEPTED", "WAITLIST", "REJECTED", "WITHDRAWN"];

/** Pengaturan, divisi, seleksi pendaftar, dan daftar panitia. Dipakai halaman admin dan halaman ketua panitia. */
export async function CommitteeManager({
  eventId,
  isAdmin,
  basePath,
  meetingsHref,
  status,
}: {
  eventId: string;
  isAdmin: boolean;
  basePath: string;
  meetingsHref: string;
  status?: string;
}) {
  const active: CommitteeStatusKey = TABS.includes(status as CommitteeStatusKey) ? (status as CommitteeStatusKey) : "PENDING";

  const [event, divisions, grouped, applications, accepted] = await Promise.all([
    prisma.event.findUniqueOrThrow({ where: { id: eventId }, select: { committeeOpen: true, committeeDeadline: true } }),
    divisionsWithCounts(eventId),
    prisma.committeeApplication.groupBy({ by: ["status"], where: { eventId }, _count: true }),
    prisma.committeeApplication.findMany({
      where: { eventId, status: active },
      orderBy: { createdAt: "asc" },
      select: {
        id: true, status: true, role: true, motivation: true, experience: true, createdAt: true,
        assignedDivisionId: true, firstChoiceId: true,
        user: { select: { fullName: true, nim: true, batchYear: true } },
        firstChoice: { select: { name: true } },
        secondChoice: { select: { name: true } },
      },
    }),
    prisma.committeeApplication.findMany({
      where: { eventId, status: "ACCEPTED" },
      orderBy: [{ role: "asc" }, { user: { fullName: "asc" } }],
      select: { id: true, role: true, assignedDivisionId: true, user: { select: { fullName: true, nim: true } } },
    }),
  ]);
  const count = (k: CommitteeStatusKey) => grouped.find((g) => g.status === k)?._count ?? 0;
  const options = divisions.map((d) => ({ id: d.id, name: d.name, quota: d.quota, accepted: d.accepted }));
  const h2 = "text-lg font-semibold text-[var(--s-head)]";

  return (
    <div className="space-y-10">
      <section className="space-y-3" aria-labelledby="pengaturan">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="pengaturan" className={h2}>Pengaturan pendaftaran</h2>
          <Badge tone={event.committeeOpen ? "ok" : "muted"}>{event.committeeOpen ? "Dibuka" : "Ditutup"}</Badge>
          {event.committeeOpen && event.committeeDeadline && (
            <span className="text-sm text-muted-foreground">sampai {formatDateTime(event.committeeDeadline)}</span>
          )}
        </div>
        <CommitteeSettingsForm
          eventId={eventId}
          open={event.committeeOpen}
          deadline={event.committeeDeadline ? toInputValue(event.committeeDeadline) : ""}
        />
      </section>

      <section className="space-y-3" aria-labelledby="divisi">
        <h2 id="divisi" className={h2}>Divisi</h2>
        <DivisionEditor eventId={eventId} divisions={divisions} />
      </section>

      <section className="space-y-4" aria-labelledby="seleksi">
        <h2 id="seleksi" className={h2}>Seleksi pendaftar</h2>
        <nav aria-label="Filter status pendaftar" className="flex flex-wrap gap-2">
          {TABS.map((k) => (
            <Link
              key={k}
              href={`${basePath}?s=${k}#seleksi`}
              scroll={false}
              aria-current={k === active ? "page" : undefined}
              className={`inline-flex min-h-9 items-center gap-2 rounded-sm border px-3 text-sm transition-colors ${
                k === active ? "border-[#ffa500] bg-[#ffa500]/15 font-semibold" : "border-border hover:bg-muted"
              }`}
            >
              {COMMITTEE_STATUS[k].label}
              <span className="tabular text-xs text-muted-foreground">{count(k)}</span>
            </Link>
          ))}
        </nav>

        {applications.length === 0 && (
          <p className={`${cardCls} p-4 text-sm text-muted-foreground`}>
            {active === "PENDING" ? "Tidak ada pendaftar yang menunggu seleksi." : "Belum ada pendaftar dengan status ini."}
          </p>
        )}
        <ul className="space-y-3">
          {applications.map((a) => (
            <li key={a.id} className={`${cardCls} space-y-3 p-5`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{a.user.fullName}</p>
                  <p className="text-sm text-muted-foreground">NPM {a.user.nim} · Angkatan {a.user.batchYear} · mendaftar {formatDateTime(a.createdAt)}</p>
                </div>
                <Badge tone={COMMITTEE_STATUS[a.status as CommitteeStatusKey].tone}>{COMMITTEE_STATUS[a.status as CommitteeStatusKey].label}</Badge>
              </div>
              <p className="text-sm">
                <span className="text-muted-foreground">Pilihan:</span> {a.firstChoice.name}
                {a.secondChoice ? `, lalu ${a.secondChoice.name}` : ""}
              </p>
              <div className="space-y-1 text-sm">
                <p className="font-medium">Alasan</p>
                <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">{a.motivation}</p>
              </div>
              {a.experience && (
                <div className="space-y-1 text-sm">
                  <p className="font-medium">Pengalaman</p>
                  <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">{a.experience}</p>
                </div>
              )}
              {a.status !== "WITHDRAWN" && (
                <ReviewForm
                  key={`${a.id}-${a.status}-${a.assignedDivisionId}-${a.role}`}
                  application={{ id: a.id, status: a.status, role: a.role, assignedDivisionId: a.assignedDivisionId, firstChoiceId: a.firstChoiceId }}
                  divisions={options}
                  isAdmin={isAdmin}
                />
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3" aria-labelledby="roster">
        <h2 id="roster" className={h2}>Susunan panitia ({accepted.length})</h2>
        <CommitteeRoster divisions={divisions} accepted={accepted} />
      </section>

      <section className="space-y-3" aria-labelledby="rekap">
        <h2 id="rekap" className={h2}>Kehadiran dan sertifikat</h2>
        <CommitteeRecap eventId={eventId} meetingsHref={meetingsHref} />
      </section>
    </div>
  );
}

/** Daftar panitia per divisi. Juga dipakai di halaman panitia (hanya-baca). */
export function CommitteeRoster({
  divisions,
  accepted,
}: {
  divisions: { id: number; name: string; quota: number | null }[];
  accepted: { id: string; role: string; assignedDivisionId: number | null; user: { fullName: string; nim: string } }[];
}) {
  if (accepted.length === 0) return <p className="text-sm text-muted-foreground">Belum ada panitia yang diterima.</p>;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {divisions.map((d) => {
        const members = accepted.filter((m) => m.assignedDivisionId === d.id);
        if (members.length === 0) return null;
        return (
          <div key={d.id} className={`${cardCls} p-4`}>
            <p className="font-medium">
              {d.name} <span className="tabular text-sm font-normal text-muted-foreground">({members.length}{d.quota !== null ? `/${d.quota}` : ""})</span>
            </p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {members.map((m) => (
                <li key={m.id} className="flex items-baseline justify-between gap-2">
                  <span>{m.user.fullName}</span>
                  {m.role !== "MEMBER" && <span className="shrink-0 text-xs font-medium text-[var(--state-warning-fg)]">{roleLabel(m.role)}</span>}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
