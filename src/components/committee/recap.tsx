import Link from "next/link";
import { DayAttendanceToggle } from "@/components/committee/meetings";
import { IssueCommitteeCertificates } from "@/components/committee/issue-form";
import { roleLabel } from "@/lib/committee-meta";
import { prisma } from "@/lib/prisma";
import { cardCls } from "@/lib/ui";

/** Rekap kehadiran panitia (hari-H dan rapat) dan penerbitan sertifikat panitia. */
export async function CommitteeRecap({ eventId, meetingsHref }: { eventId: string; meetingsHref: string }) {
  const [members, meetings, certs] = await Promise.all([
    prisma.committeeApplication.findMany({
      where: { eventId, status: "ACCEPTED" },
      orderBy: [{ role: "asc" }, { user: { fullName: "asc" } }],
      select: { id: true, userId: true, role: true, attendedAt: true, user: { select: { fullName: true } }, assignedDivision: { select: { name: true } } },
    }),
    prisma.committeeMeeting.findMany({
      where: { eventId },
      select: { id: true, attendances: { where: { status: "PRESENT" }, select: { userId: true } } },
    }),
    prisma.certificate.findMany({ where: { eventId, kind: "COMMITTEE" }, select: { userId: true, certificateNumber: true } }),
  ]);
  const certOf = new Map(certs.map((c) => [c.userId, c.certificateNumber]));
  const total = meetings.length;
  const eligible = members.filter((m) => m.attendedAt && !certOf.has(m.userId));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Hari-H tercatat otomatis lewat scanner saat panitia menunjukkan QR KTA. Rapat tercatat lewat absensi kode.{" "}
          <Link href={meetingsHref} className="font-medium text-[var(--gold-text)] underline underline-offset-4">Kelola rapat</Link>
        </p>
      </div>

      {members.length === 0 ? (
        <p className={`${cardCls} p-4 text-sm text-muted-foreground`}>Belum ada panitia yang diterima.</p>
      ) : (
        <IssueCommitteeCertificates eventId={eventId} canIssue={eligible.length > 0}>
          <div className="overflow-x-auto rounded-sm border border-border">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="bg-muted/60 text-xs text-muted-foreground">
                <tr>
                  <th className="w-10 px-3 py-2"><span className="sr-only">Pilih</span></th>
                  <th className="px-3 py-2 font-medium">Panitia</th>
                  <th className="px-3 py-2 font-medium">Hari-H</th>
                  <th className="px-3 py-2 font-medium">Rapat</th>
                  <th className="px-3 py-2 font-medium">Sertifikat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {members.map((m) => {
                  const hadir = meetings.filter((x) => x.attendances.some((a) => a.userId === m.userId)).length;
                  const cert = certOf.get(m.userId);
                  const can = !!m.attendedAt && !cert;
                  return (
                    <tr key={m.id} className="transition-colors hover:bg-muted/40">
                      <td className="px-3 py-2">
                        {can && <input type="checkbox" name="applicationId" value={m.id} defaultChecked aria-label={`Terbitkan sertifikat untuk ${m.user.fullName}`} className="size-4 accent-[#ffa500]" />}
                      </td>
                      <td className="px-3 py-2">
                        <p className="font-medium">{m.user.fullName}</p>
                        <p className="text-xs text-muted-foreground">{roleLabel(m.role)}{m.assignedDivision ? ` · ${m.assignedDivision.name}` : ""}</p>
                      </td>
                      <td className="px-3 py-2"><DayAttendanceToggle applicationId={m.id} present={!!m.attendedAt} name={m.user.fullName} /></td>
                      <td className="tabular px-3 py-2">
                        {total === 0 ? <span className="text-muted-foreground">Belum ada rapat</span> : <>{hadir}/{total} <span className="text-muted-foreground">({Math.round((hadir / total) * 100)}%)</span></>}
                      </td>
                      <td className="px-3 py-2">
                        {cert ? (
                          <Link href={`/verify-certificate/${cert}`} target="_blank" className="text-[var(--emerald)] underline underline-offset-4">Terbit</Link>
                        ) : m.attendedAt ? (
                          <span className="text-[var(--gold-text)]">Memenuhi syarat</span>
                        ) : (
                          <span className="text-muted-foreground">Belum hadir hari-H</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </IssueCommitteeCertificates>
      )}
    </div>
  );
}
