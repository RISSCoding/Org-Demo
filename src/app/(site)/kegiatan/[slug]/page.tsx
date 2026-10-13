import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { formatDateTime } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import { btnLine, btnOrange, container, linkText } from "@/lib/site-ui";

export const dynamic = "force-dynamic";

const getEvent = (slug: string) => prisma.event.findFirst({ where: { slug, isPublic: true } });

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const e = await getEvent(slug);
  return { title: e ? `${e.title} — ORG` : "Kegiatan — ORG" };
}

export default async function KegiatanDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const ended = event.endDate < new Date();

  return (
    <article className={`${container} max-w-4xl py-14`}>
      <Link href="/kegiatan" className={`${linkText} text-sm`}>Semua kegiatan</Link>

      {event.bannerUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={event.bannerUrl} alt="" className="mt-6 aspect-[16/7] w-full object-cover" />
      )}

      <div className="mb-6 mt-8 h-1 w-14 bg-[#ffa500]" aria-hidden />
      <h1 className="s-display text-3xl text-[var(--s-head)] md:text-4xl">{event.title}</h1>

      <ul className="mt-6 space-y-2 text-[var(--s-muted)]">
        <li className="flex items-center gap-2">
          <CalendarDays className="size-4 shrink-0" aria-hidden />
          {formatDateTime(event.startDate)} sampai {formatDateTime(event.endDate)}
        </li>
        <li className="flex items-center gap-2"><MapPin className="size-4 shrink-0" aria-hidden />{event.location}</li>
        {event.quota !== null && (
          <li className="flex items-center gap-2"><Users className="size-4 shrink-0" aria-hidden />Kuota {event.quota} peserta</li>
        )}
      </ul>

      <p className="s-serif mt-8 max-w-prose whitespace-pre-line">{event.description}</p>

      <div className="mt-10 border-t border-[var(--s-line)] pt-8">
        {ended ? (
          <p className="s-serif text-[var(--s-muted)]">Kegiatan ini sudah selesai.</p>
        ) : (
          <div className="space-y-3">
            {/* Middleware mengarahkan ke /login dan kembali ke halaman ini bila belum masuk. */}
            <Link href={`/dashboard/events/${event.slug}`} className={btnOrange}>Daftar ke kegiatan ini</Link>
            <p className="text-sm text-[var(--s-muted)]">
              Kamu perlu masuk dulu. Belum punya akun?{" "}
              <Link href="/register" className={linkText}>Daftar sebagai anggota</Link>.
            </p>
          </div>
        )}
        <p className="mt-6">
          <Link href="/kegiatan" className={btnLine}>Kembali ke daftar kegiatan</Link>
        </p>
      </div>
    </article>
  );
}
