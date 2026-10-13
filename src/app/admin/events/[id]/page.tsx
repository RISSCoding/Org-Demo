import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, ScanLine, UsersRound } from "lucide-react";
import { CertificatePanel } from "@/components/certificate-panel";
import { eventPhase } from "@/components/event-card";
import { formatDateTime } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { btnGhost, btnPrimary, cardCls } from "@/lib/ui";

const statusStyle = {
  REGISTERED: "bg-muted text-muted-foreground",
  ATTENDED: "bg-[var(--emerald)]/15 text-[var(--emerald)]",
  CANCELLED: "bg-red-500/10 text-red-600 dark:text-red-400",
} as const;
const statusLabel = { REGISTERED: "Terdaftar", ATTENDED: "Hadir", CANCELLED: "Batal" } as const;

export default async function AdminEventDetail({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("event:manage");
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      registrations: {
        orderBy: [{ status: "asc" }, { user: { fullName: "asc" } }],
        select: {
          id: true, status: true, attendedAt: true,
          user: { select: { fullName: true, nim: true, batchYear: true } },
        },
      },
    },
  });
  if (!event) notFound();
  const [issued, committeeGroups] = await Promise.all([
    prisma.certificate.count({ where: { eventId: event.id } }),
    prisma.committeeApplication.groupBy({ by: ["status"], where: { eventId: event.id }, _count: true }),
  ]);
  const cn = (k: string) => committeeGroups.find((g: { status: string; _count: number }) => g.status === k)?._count ?? 0;

  const active = event.registrations.filter((r) => r.status !== "CANCELLED");
  const attended = event.registrations.filter((r) => r.status === "ATTENDED").length;
  const phase = eventPhase(event);

  const th = "px-4 py-3 text-left text-sm font-semibold text-foreground";
  const td = "px-4 py-3 text-sm";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <span className={`rounded-sm px-2 py-0.5 text-xs font-semibold ${phase.cls}`}>{phase.label}</span>
          <h1 className="s-display s-title text-3xl text-[var(--s-head)]">{event.title}</h1>
          <p className="text-sm text-muted-foreground">
            {formatDateTime(event.startDate)} – {formatDateTime(event.endDate)} · {event.location}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/events/${event.id}/edit`} className={`${btnGhost} border border-border`}>
            <Pencil className="size-4" /> Edit
          </Link>
          <Link href={`/admin/events/${event.id}/committee`} className={`${btnGhost} border border-border`}>
            <UsersRound className="size-4" /> Kepanitiaan
          </Link>
          <Link href={`/admin/events/${event.id}/scan`} className={btnPrimary}>
            <ScanLine className="size-4" /> Buka scanner
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Terdaftar", value: active.length + (event.quota !== null ? ` / ${event.quota}` : "") },
          { label: "Hadir", value: attended },
          { label: "Belum hadir", value: active.length - attended },
        ].map((s) => (
          <div key={s.label} className={`${cardCls} p-5`}>
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="s-display mt-2 text-3xl">{s.value}</p>
          </div>
        ))}
      </div>

      <Link
        href={`/admin/events/${event.id}/committee`}
        className={`${cardCls} group flex flex-wrap items-center justify-between gap-3 p-5 transition-[border-color] duration-200 hover:border-[#ffa500]`}
      >
        <div>
          <p className="font-medium">Kepanitiaan</p>
          <p className="text-sm text-muted-foreground">
            Pendaftaran {event.committeeOpen ? "dibuka" : "ditutup"} · {cn("ACCEPTED")} diterima · {cn("PENDING")} menunggu seleksi · {cn("WAITLIST")} cadangan
          </p>
        </div>
        <span className="text-sm font-medium group-hover:underline group-hover:underline-offset-4">Kelola</span>
      </Link>

      <CertificatePanel eventId={event.id} attended={attended} issued={issued} />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--s-head)]">Peserta</h2>
        <div className={`${cardCls} overflow-x-auto`}>
          <table className="w-full min-w-[620px]">
            <thead className="border-b border-border">
              <tr>
                <th className={th}>Nama</th><th className={th}>NPM</th><th className={th}>Angkatan</th>
                <th className={th}>Status</th><th className={th}>Waktu hadir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {event.registrations.length === 0 && (
                <tr><td colSpan={5} className={`${td} text-muted-foreground`}>Belum ada pendaftar.</td></tr>
              )}
              {event.registrations.map((r) => (
                <tr key={r.id}>
                  <td className={td}>{r.user.fullName}</td>
                  <td className={td}>{r.user.nim}</td>
                  <td className={td}>{r.user.batchYear}</td>
                  <td className={td}>
                    <span className={`rounded-sm px-2 py-0.5 text-xs font-semibold ${statusStyle[r.status]}`}>
                      {statusLabel[r.status]}
                    </span>
                  </td>
                  <td className={td}>{r.attendedAt ? formatDateTime(r.attendedAt) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
