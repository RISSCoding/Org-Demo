import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, ScanLine, UsersRound, UserX } from "lucide-react";
import { CertificatePanel } from "@/components/certificate-panel";
import { eventPhase } from "@/components/event-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { BackLink } from "@/components/ui/back-link";
import { formatDateTime } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import { getTenantPrisma } from "@/lib/prisma-tenant";
import { requirePermission } from "@/lib/rbac";
import { btnLine, btnPrimary, cardCls } from "@/lib/ui";

const statusStyle = {
  REGISTERED: "bg-[var(--surface-2)] text-muted-foreground",
  ATTENDED: "bg-[var(--state-success-bg)] text-[var(--state-success-fg)]",
  CANCELLED: "bg-[var(--state-danger-bg)] text-[var(--state-danger-fg)]",
} as const;
const statusLabel = { REGISTERED: "Terdaftar", ATTENDED: "Hadir", CANCELLED: "Batal" } as const;

export default async function AdminEventDetail({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("event:manage");
  const { id } = await params;

  const event = await tenantPrisma.event.findUnique({
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
    tenantPrisma.certificate.count({ where: { eventId: event.id } }),
    tenantPrisma.committeeApplication.groupBy({ by: ["status"], where: { eventId: event.id }, _count: true }),
  ]);
  const cn = (k: string) => committeeGroups.find((g: { status: string; _count: number }) => g.status === k)?._count ?? 0;

  const active = event.registrations.filter((r) => r.status !== "CANCELLED");
  const attended = event.registrations.filter((r) => r.status === "ATTENDED").length;
  const phase = eventPhase(event);

  const th = "px-4 py-3 text-left text-sm font-semibold text-foreground";
  const td = "px-4 py-3 text-sm";

  return (
    <div className="space-y-6">
      <BackLink href="/admin/events" label="Kembali ke daftar event" />
      <PageHeader
        before={
          <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${phase.cls}`}>
            {phase.label}
          </span>
        }
        title={event.title}
        description={`${formatDateTime(event.startDate)} – ${formatDateTime(event.endDate)} · ${event.location}`}
        action={
          <>
            <Link href={`/admin/events/${event.id}/edit`} className={btnLine}>
              <Pencil className="size-4" /> Edit
            </Link>
            <Link href={`/admin/events/${event.id}/committee`} className={btnLine}>
              <UsersRound className="size-4" /> Kepanitiaan
            </Link>
            <Link href={`/admin/events/${event.id}/scan`} className={btnPrimary}>
              <ScanLine className="size-4" /> Buka scanner
            </Link>
          </>
        }
      />

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
        className={`${cardCls} group flex flex-wrap items-center justify-between gap-3 p-5 transition-[border-color] duration-200 hover:border-[var(--brand-500)]`}
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
        {event.registrations.length === 0 ? (
          <EmptyState
            icon={UserX}
            title="Belum ada pendaftar"
            description="Peserta yang mendaftar lewat portal anggota akan muncul di sini."
          />
        ) : (
          <div className={`${cardCls} overflow-x-auto`}>
            <table className="w-full min-w-[620px]">
              <thead className="border-b border-border">
                <tr>
                  <th className={th}>Nama</th><th className={th}>NPM</th><th className={th}>Angkatan</th>
                  <th className={th}>Status</th><th className={th}>Waktu hadir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {event.registrations.map((r) => (
                  <tr key={r.id} className="hover:bg-[var(--interactive-hover)]">
                    <td className={td}>{r.user.fullName}</td>
                    <td className={td}>{r.user.nim}</td>
                    <td className={td}>{r.user.batchYear}</td>
                    <td className={td}>
                      <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${statusStyle[r.status]}`}>
                        {statusLabel[r.status]}
                      </span>
                    </td>
                    <td className={td}>{r.attendedAt ? formatDateTime(r.attendedAt) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
