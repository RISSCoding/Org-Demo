import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { auth } from "@/auth";
import { CountUp } from "@/components/ux/count-up";
import { prisma } from "@/lib/prisma";
import { cardCls } from "@/lib/ui";

export const metadata = { title: "Panel Admin — HIMMAN UKRI" };

export default async function AdminHome() {
  const session = await auth();
  const u = session?.user;
  const can = (perm: string) => u?.role === "SUPER_ADMIN" || !!u?.permissions.includes(perm);

  const [pending, active, events, posts] = await Promise.all([
    prisma.user.count({ where: { approvalStatus: "PENDING" } }),
    prisma.member.count({ where: { status: "ACTIVE" } }),
    prisma.event.count({ where: { startDate: { gte: new Date() } } }),
    prisma.cmsPost.count({ where: { publishedAt: { not: null } } }),
  ]);

  const stats = [
    { label: "Menunggu persetujuan", value: pending, accent: "text-[var(--state-warning-fg)]", href: can("member:manage") ? "/admin/members" : null, cta: "Tinjau pendaftar", attention: pending > 0 },
    { label: "Anggota aktif", value: active, accent: "text-[var(--emerald)]", href: can("member:manage") ? "/admin/members" : null, cta: "Lihat anggota", attention: false },
    { label: "Event mendatang", value: events, accent: "text-primary", href: can("event:manage") ? "/admin/events" : null, cta: "Kelola event", attention: false },
    { label: "Artikel terbit", value: posts, accent: "text-primary", href: null, cta: "", attention: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="s-display s-title text-3xl text-[var(--s-head)]">Ringkasan</h1>
        <p className="text-sm text-muted-foreground">Gambaran singkat aktivitas himpunan. Klik kartu untuk membuka halamannya.</p>
      </div>

      {pending > 0 && can("member:manage") && (
        <Link
          href="/admin/members"
          className="group flex flex-wrap items-center gap-3 rounded-sm border border-[var(--state-warning-border)] bg-[var(--state-warning-bg)] px-4 py-3 text-sm transition-colors hover:bg-[var(--gold)]/20"
        >
          <span className="relative grid size-2.5 place-items-center rounded-full bg-[#ffa500] ux-ping" aria-hidden />
          <span>
            <strong>{pending}</strong> pendaftar menunggu persetujuanmu.
          </span>
          <span className="ml-auto inline-flex items-center gap-1 font-medium">
            Tinjau sekarang <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
          </span>
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const body = (
            <>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className={`s-display mt-2 text-3xl ${s.accent}`}>
                <CountUp value={s.value} />
              </p>
              {s.href && (
                <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                  {s.cta} <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
                </p>
              )}
            </>
          );
          return s.href ? (
            <Link
              key={s.label}
              href={s.href}
              className={`${cardCls} group block p-5 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[#ffa500]`}
            >
              {body}
            </Link>
          ) : (
            <div key={s.label} className={`${cardCls} p-5`}>
              {body}
            </div>
          );
        })}
      </div>
    </div>
  );
}
