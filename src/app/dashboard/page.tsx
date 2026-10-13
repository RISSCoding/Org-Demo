import Link from "next/link";
import { Award, CalendarDays, Check, CreditCard, MessageSquare, Wallet } from "lucide-react";
import { auth } from "@/auth";
import { KtaCard } from "@/components/kta-card";
import { prisma } from "@/lib/prisma";
import { ktaPayload } from "@/lib/security";
import { btnLine, btnPrimary, cardCls, cardLink } from "@/lib/ui";

export const metadata = { title: "Dashboard — HIMMAN UKRI" };

const STATUS_LABEL = { ACTIVE: "Aktif", INACTIVE: "Nonaktif", ALUMNI: "Alumni" } as const;

export default async function DashboardHome() {
  const session = await auth();
  const userId = session!.user.id;
  const since = new Date();
  since.setDate(since.getDate() - 14);

  const [user, unpaid, upcoming, registrations, results] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        fullName: true,
        nim: true,
        batchYear: true,
        member: { select: { ktaNumber: true, status: true, division: { select: { name: true } } } },
      },
    }),
    prisma.memberDues.count({ where: { userId, status: { in: ["PENDING", "OVERDUE"] } } }),
    prisma.eventRegistration.findMany({
      where: { userId, status: "REGISTERED", event: { startDate: { gte: new Date() } } },
      orderBy: { event: { startDate: "asc" } },
      take: 3,
      select: { id: true, event: { select: { title: true, slug: true, startDate: true, location: true } } },
    }),
    prisma.eventRegistration.count({ where: { userId, status: { not: "CANCELLED" } } }),
    // Hasil seleksi panitia dalam 14 hari terakhir, supaya pendaftar tahu tanpa harus mengecek manual.
    prisma.committeeApplication.findMany({
      where: { userId, status: { in: ["ACCEPTED", "WAITLIST", "REJECTED"] }, decidedAt: { gte: since } },
      orderBy: { decidedAt: "desc" },
      select: { status: true, event: { select: { title: true, slug: true } } },
    }),
  ]);

  const fmt = (d: Date) => d.toLocaleDateString("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" });

  // Langkah awal untuk anggota baru: hanya tampil sampai ketiganya selesai.
  const steps = [
    { done: !!user.member, title: "KTA digital tersedia", hint: "Muncul otomatis setelah pengurus menyetujui keanggotaanmu.", href: "/dashboard/kta", cta: "Lihat KTA" },
    { done: registrations > 0, title: "Daftar satu event", hint: "Pilih kegiatan, daftar, lalu tunjukkan tiket QR saat hadir.", href: "/dashboard/events", cta: "Cari event" },
    { done: unpaid === 0, title: "Iuran kas lunas", hint: "Transfer ke bendahara lalu unggah foto bukti transfernya.", href: "/dashboard/dues", cta: "Buka iuran kas" },
  ];
  const doneCount = steps.filter((s) => s.done).length;

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
          <span className={`inline-block rounded-sm px-2 py-0.5 text-xs font-semibold ${user.member ? "bg-[var(--emerald)]/15 text-[var(--emerald)]" : "bg-[#ffa500]/20 text-[var(--gold-text)]"}`}>
            {user.member ? STATUS_LABEL[user.member.status] : "Belum terdaftar"}
          </span>
        </p>
      </div>

      {unpaid > 0 && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-4 py-3 text-sm">
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

      {doneCount < steps.length && (
        <section aria-labelledby="langkah-awal" className={`${cardCls} space-y-4 p-5`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h2 id="langkah-awal" className="text-lg font-semibold text-[var(--s-head)]">Mulai dari sini</h2>
              <p className="text-sm text-muted-foreground">Tiga hal yang biasanya dilakukan anggota baru.</p>
            </div>
            <p className="tabular text-sm font-medium">{doneCount} dari {steps.length} selesai</p>
          </div>
          <div className="h-1.5 overflow-hidden bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={doneCount} aria-label="Kemajuan langkah awal">
            <div className="h-full bg-[#ffa500] transition-[width] duration-700 ease-[var(--ease-out)]" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
          </div>
          <ol className="divide-y divide-border">
            {steps.map((s) => (
              <li key={s.title} className="flex items-start gap-3 py-3">
                <span
                  className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border text-xs ${s.done ? "border-[var(--emerald)] bg-[var(--emerald)] text-white" : "border-input text-transparent"}`}
                  aria-hidden
                >
                  <Check className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`font-medium ${s.done ? "text-muted-foreground line-through decoration-1" : ""}`}>
                    {s.title}
                    <span className="sr-only">{s.done ? " (selesai)" : " (belum)"}</span>
                  </p>
                  {!s.done && <p className="text-sm text-muted-foreground">{s.hint}</p>}
                </div>
                {!s.done && (
                  <Link href={s.href} className={`${btnLine} h-9 shrink-0`}>
                    {s.cta}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

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
                division={user.member.division?.name}
                payload={ktaPayload(user.nim)}
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
                <Icon className="mt-0.5 size-5 shrink-0 text-[var(--gold-text)]" aria-hidden />
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
