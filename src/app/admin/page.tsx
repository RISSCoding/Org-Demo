import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, CalendarDays, CheckCircle2, CircleDollarSign,
  Clock, MessageSquare, Users, Wallet,
} from "lucide-react";
import { auth } from "@/auth";
import { getAdminOverview } from "@/lib/admin-overview";
import { formatDate, formatDateTime } from "@/lib/datetime";
import { rupiah } from "@/lib/finance";
import { btnLine, cardCls } from "@/lib/ui";

export const metadata = { title: "Ringkasan — ORG" };
export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const session = await auth();
  const u = session?.user;
  const can = (perm: string) => u?.role === "SUPER_ADMIN" || !!u?.permissions.includes(perm);

  const overview = await getAdminOverview();
  const { actions, upcomingEvents, finance, recentActivity } = overview;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="s-display s-title text-3xl text-[var(--s-head)]">Ringkasan</h1>
        <p className="text-sm text-muted-foreground">
          Apa yang menunggu, apa yang akan datang, dan apa yang baru terjadi.
        </p>
      </header>

      {/* ===== Antrean tindakan ===== */}
      <section aria-labelledby="tindakan" className={`${cardCls} p-5`}>
        <h2 id="tindakan" className="text-sm font-semibold text-[var(--s-head)]">
          Perlu tindakan
        </h2>
        {actions.length === 0 ? (
          <div className="mt-3 flex items-center gap-3 rounded-md bg-[var(--state-success-bg)] px-4 py-3 text-sm text-[var(--state-success-fg)]">
            <CheckCircle2 className="size-5 shrink-0" aria-hidden />
            <p>Tidak ada yang menunggu. Semua bersih.</p>
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--border-subtle)]">
            {actions.map((a) => (
              <li key={a.key}>
                <Link
                  href={a.href}
                  className="group flex items-center gap-3 py-3 transition-colors hover:bg-[var(--interactive-hover)] -mx-2 rounded-md px-2"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--state-warning-bg)] text-[var(--state-warning-fg)] tabular-nums font-semibold">
                    {a.count > 99 ? "99+" : a.count}
                  </span>
                  <span className="min-w-0 flex-1 text-sm">{a.label}</span>
                  <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                    Tinjau
                    <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ===== Grid: Agenda + Keuangan ===== */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Agenda 30 hari */}
        <section aria-labelledby="agenda" className={`${cardCls} flex flex-col p-5`}>
          <div className="flex items-center justify-between gap-3">
            <h2 id="agenda" className="text-sm font-semibold text-[var(--s-head)]">
              Agenda 30 hari ke depan
            </h2>
            {can("event:manage") && (
              <Link href="/admin/events" className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                Semua event →
              </Link>
            )}
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="mt-3 flex flex-1 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[var(--border-default)] bg-[var(--surface-2)] px-4 py-8 text-center">
              <CalendarDays className="size-5 text-muted-foreground" aria-hidden />
              <p className="text-sm text-muted-foreground">
                Tidak ada event dalam 30 hari ke depan.
              </p>
              {can("event:manage") && (
                <Link href="/admin/events/new" className={`${btnLine} mt-1`}>
                  Buat event
                </Link>
              )}
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {upcomingEvents.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/admin/events/${e.id}`}
                    className="group block rounded-md border border-[var(--border-subtle)] p-3 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--brand-500)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{e.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatDate(e.startDate)} · {e.location}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium ${
                          e.daysUntil <= 3
                            ? "bg-[var(--state-warning-bg)] text-[var(--state-warning-fg)]"
                            : "bg-[var(--surface-2)] text-muted-foreground"
                        }`}
                      >
                        {e.daysUntil === 0 ? "Hari ini" : e.daysUntil === 1 ? "Besok" : `${e.daysUntil} hari lagi`}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3.5" aria-hidden />
                        {e.participantCount} peserta
                      </span>
                      <span className="inline-flex items-center gap-1">
                        {e.committeeCount} panitia
                        {e.committeeOpen && (
                          <span className="ml-1 rounded-full bg-[var(--state-success-bg)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--state-success-fg)]">
                            Pendaftaran dibuka
                          </span>
                        )}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Keuangan bulan ini */}
        <section aria-labelledby="kas" className={`${cardCls} flex flex-col p-5`}>
          <div className="flex items-center justify-between gap-3">
            <h2 id="kas" className="text-sm font-semibold text-[var(--s-head)]">Kondisi kas bulan ini</h2>
            {can("finance:read") && (
              <Link href="/admin/finance" className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                Detail →
              </Link>
            )}
          </div>

          {can("finance:read") ? (
            <>
              <div className="mt-3 rounded-md bg-[var(--surface-2)] p-4">
                <p className="text-xs text-muted-foreground">Saldo kas sekarang</p>
                <p className={`s-display mt-1 text-2xl tabular-nums ${finance.balance < 0 ? "text-[var(--state-danger-fg)]" : "text-foreground"}`}>
                  {rupiah(finance.balance)}
                </p>
              </div>

              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <ArrowUpRight className="size-4 text-[var(--state-success-fg)]" aria-hidden />
                    Pemasukan
                  </dt>
                  <dd className="tabular-nums font-medium text-[var(--state-success-fg)]">
                    +{rupiah(finance.incomeThisMonth)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <ArrowUpRight className="size-4 rotate-90 text-[var(--state-danger-fg)]" aria-hidden />
                    Pengeluaran
                  </dt>
                  <dd className="tabular-nums font-medium text-[var(--state-danger-fg)]">
                    −{rupiah(finance.expenseThisMonth)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-3">
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <CircleDollarSign className="size-4" aria-hidden />
                    Iuran bulan ini
                  </dt>
                  <dd className="tabular-nums text-foreground">
                    {finance.duesTotalThisMonth === 0
                      ? "Belum ada tagihan"
                      : `${finance.duesPaidThisMonth} / ${finance.duesTotalThisMonth} lunas`}
                  </dd>
                </div>
              </dl>

              {finance.incomeLastMonth > 0 || finance.expenseLastMonth > 0 ? (
                <p className="mt-4 text-xs text-muted-foreground">
                  Bulan lalu: +{rupiah(finance.incomeLastMonth)} / −{rupiah(finance.expenseLastMonth)}
                </p>
              ) : null}

              <div className="mt-auto pt-4">
                <Link href="/admin/finance" className={`${btnLine} w-full justify-center`}>
                  <Wallet className="size-4" aria-hidden /> Buka keuangan
                </Link>
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Kamu tidak punya izin membaca data keuangan.
            </p>
          )}
        </section>
      </div>

      {/* ===== Aktivitas terbaru ===== */}
      <section aria-labelledby="aktivitas" className={`${cardCls} p-5`}>
        <div className="flex items-center justify-between gap-3">
          <h2 id="aktivitas" className="text-sm font-semibold text-[var(--s-head)]">
            Aktivitas terbaru
          </h2>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3.5" aria-hidden /> 8 terakhir
          </span>
        </div>

        {recentActivity.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Belum ada aktivitas tercatat.</p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--border-subtle)]">
            {recentActivity.map((a) => (
              <li key={a.id} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 py-2.5 text-sm">
                <span className="font-medium text-foreground">
                  {a.actorName ?? "Sistem"}
                </span>
                <span className="text-muted-foreground">{a.description}</span>
                <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                  {formatDateTime(a.at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ===== Pintasan cepat ===== */}
      <section aria-labelledby="pintasan" className="space-y-2">
        <h2 id="pintasan" className="text-sm font-semibold text-[var(--s-head)]">
          Yang biasanya kamu buka
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            can("event:manage") && { href: "/admin/events/new", icon: CalendarDays, label: "Buat event" },
            can("cms:write") && { href: "/admin/cms/new", icon: MessageSquare, label: "Tulis berita" },
            can("finance:write") && { href: "/admin/finance/transactions/new", icon: Wallet, label: "Catat transaksi" },
            can("member:manage") && { href: "/admin/members/import", icon: Users, label: "Impor anggota" },
          ]
            .filter(Boolean)
            .map((x, i) => {
              const item = x as { href: string; icon: typeof CalendarDays; label: string };
              return (
                <li key={i}>
                  <Link
                    href={item.href}
                    className={`${cardCls} group flex items-center gap-3 p-3 text-sm transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--brand-500)]`}
                  >
                    <item.icon className="size-4 text-[var(--gold-text)]" aria-hidden />
                    <span className="font-medium">{item.label}</span>
                    <ArrowRight className="ml-auto size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                </li>
              );
            })}
        </ul>
      </section>
    </div>
  );
}
