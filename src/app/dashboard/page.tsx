import Link from "next/link";
import { headers } from "next/headers";
import { Award, CalendarDays, CreditCard, MessageSquare, Wallet } from "lucide-react";
import { auth } from "@/auth";
import { KtaCard } from "@/components/kta-card";
import { memberTitle } from "@/lib/member-title";
import { prisma } from "@/lib/prisma";
import { btnLine, btnPrimary, cardCls, cardLink } from "@/lib/ui";

export const metadata = { title: "Dashboard — ORG" };
export const dynamic = "force-dynamic";

const STATUS_LABEL = { ACTIVE: "Aktif", INACTIVE: "Nonaktif", ALUMNI: "Alumni" } as const;

export default async function DashboardHome() {
  const session = await auth();
  const userId = session!.user.id;
  const since = new Date();
  since.setDate(since.getDate() - 14);

  const [user, unpaid, upcoming, results] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        fullName: true,
        nim: true,
        batchYear: true,
        officerRoles: { select: { position: true }, take: 1 },
        member: {
          select: {
            ktaNumber: true,
            status: true,
            divisionRole: true,
            division: { select: { name: true } },
          },
        },
      },
    }),
    prisma.memberDues.count({ where: { userId, status: { in: ["PENDING", "OVERDUE"] } } }),
    prisma.eventRegistration.findMany({
      where: { userId, status: "REGISTERED", event: { startDate: { gte: new Date() } } },
      orderBy: { event: { startDate: "asc" } },
      take: 3,
      select: { id: true, event: { select: { title: true, slug: true, startDate: true, location: true } } },
    }),
    // Hasil seleksi panitia dalam 14 hari terakhir, supaya pendaftar tahu tanpa harus mengecek manual.
    prisma.committeeApplication.findMany({
      where: { userId, status: { in: ["ACCEPTED", "WAITLIST", "REJECTED"] }, decidedAt: { gte: since } },
      orderBy: { decidedAt: "desc" },
      select: { status: true, event: { select: { title: true, slug: true } } },
    }),
  ]);

  const fmt = (d: Date) => d.toLocaleDateString("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" });

  const officerPosition = user.officerRoles[0]?.position ?? null;
  const ktaTitle = user.member
    ? memberTitle({
        officerPosition,
        divisionName: user.member.division?.name ?? null,
        divisionRole: user.member.divisionRole,
      })
    : null;
  const ktaSubtitle = officerPosition && user.member?.division ? `Departemen ${user.member.division.name}` : null;

  // QR berisi URL verifikasi publik; konsisten dengan halaman /dashboard/kta.
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  const ktaPayloadUrl = `${proto}://${host}/verify-member/${user.member!.ktaNumber}`;

  const shortcuts = [
    { href: "/dashboard/kta", icon: CreditCard, title: "KTA Digital", desc: "Kartu anggota dengan kode QR." },
    { href: "/dashboard/events", icon: CalendarDays, title: "Event", desc: "Daftar kegiatan dan lihat tiketmu." },
    { href: "/dashboard/certificates", icon: Award, title: "Sertifikat", desc: "Unduh sertifikat dari event yang kamu hadiri." },
    { href: "/dashboard/dues", icon: Wallet, title: "Iuran Kas", desc: "Lihat tagihan dan kirim bukti transfer." },
    { href: "/dashboard/feedback", icon: MessageSquare, title: "Pesan Saya", desc: "Pantau tanggapan atas aspirasimu." },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="s-display s-title text-3xl text-[var(--s-head)]">Halo, {user.fullName.split(" ")[0]}</h1>
        <p className="text-sm text-muted-foreground">
          Status keanggotaan:{" "}
          <span className={`inline-block rounded-sm px-2 py-0.5 text-xs font-semibold ${user.member ? "bg-[var(--state-success-bg)] text-[var(--emerald)]" : "bg-[#ffa500]/20 text-[var(--state-warning-fg)]"}`}>
            {user.member ? STATUS_LABEL[user.member.status] : "Belum terdaftar"}
          </span>
          {ktaTitle && <> · {ktaTitle}</>}
        </p>
      </div>

      {unpaid > 0 && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-[var(--state-warning-border)] bg-[var(--state-warning-bg)] px-4 py-3 text-sm">
          <p>
            Kamu punya <strong>{unpaid}</strong> tagihan iuran kas yang belum lunas.
          </p>
          <Link href="/dashboard/dues" className={`${btnLine} h-9`}>Bayar dan kirim bukti</Link>
        </div>
      )}

      {results.map((r: { status: string; event: { title: string; slug: string } }) => (
        <div key={r.event.slug} role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-[#ffa500]/50 bg-[#ffa500]/10 px-4 py-3 text-sm">
          <p>
            Hasil seleksi panitia <strong>{r.event.title}</strong> sudah keluar:{" "}
            <strong>{r.status === "ACCEPTED" ? "kamu diterima" : r.status === "WAITLIST" ? "kamu masuk cadangan" : "belum diterima kali ini"}</strong>.
          </p>
          <Link href={`/dashboard/events/${r.event.slug}/panitia`} className={`${btnLine} h-9`}>Lihat detail</Link>
        </div>
      ))}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="min-w-0 space-y-3">
          <h2 className="text-lg font-semibold text-[var(--s-head)]">KTA Digital</h2>
          {user.member ? (
            <>
              <KtaCard
                name={user.fullName}
                nim={user.nim}
                batchYear={user.batchYear}
                ktaNumber={user.member.ktaNumber}
                title={ktaTitle!}
                subtitle={ktaSubtitle}
                payload={ktaPayloadUrl}
                status={user.member.status}
              />
              <Link href="/dashboard/kta" className={btnPrimary}>
                Lihat ukuran penuh
              </Link>
            </>
          ) : (
            <p className={`${cardCls} p-4 text-sm text-muted-foreground`}>KTA akan tersedia setelah keanggotaanmu disetujui pengurus.</p>
          )}
        </section>

        <section className="min-w-0 space-y-3">
          <h2 className="text-lg font-semibold text-[var(--s-head)]">Event mendatang</h2>
          {upcoming.length === 0 ? (
            <div className={`${cardCls} space-y-3 p-5`}>
              <p className="text-sm text-muted-foreground">Kamu belum mendaftar event apa pun yang akan datang.</p>
              <Link href="/dashboard/events" className={btnLine}>Lihat daftar event</Link>
            </div>
          ) : (
            <ul className={`${cardCls} divide-y divide-border`}>
              {upcoming.map((r) => (
                <li key={r.id}>
                  <Link href={`/dashboard/events/${r.event.slug}`} className="group block p-4 transition-colors hover:bg-muted/60">
                    <p className="font-medium group-hover:underline group-hover:underline-offset-4">{r.event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {fmt(r.event.startDate)} · {r.event.location}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="space-y-3" aria-labelledby="pintasan">
        <h2 id="pintasan" className="text-lg font-semibold text-[var(--s-head)]">Apa yang bisa kamu lakukan di sini</h2>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {shortcuts.map(({ href, icon: Icon, title, desc }) => (
            <li key={href}>
              <Link href={href} className={`${cardLink} flex h-full items-start gap-3 p-4`}>
                <Icon className="mt-0.5 size-5 shrink-0 text-[var(--state-warning-fg)]" aria-hidden />
                <span>
                  <span className="block font-medium">{title}</span>
                  <span className="block text-sm text-muted-foreground">{desc}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
