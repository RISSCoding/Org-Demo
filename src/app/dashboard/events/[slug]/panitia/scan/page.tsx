import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Scanner } from "@/components/scanner";
import { getEventAccess } from "@/lib/committee";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Scanner panitia — HIMMAN UKRI" };

export default async function CommitteeScan({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug }, select: { id: true, title: true, slug: true } });
  if (!event) notFound();

  const access = await getEventAccess(event.id);
  if (!access.canScan) redirect(`/dashboard/events/${event.slug}/panitia`);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link href={`/dashboard/events/${event.slug}/panitia`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden /> Kembali ke kepanitiaan
        </Link>
        <h1 className="s-display s-title text-3xl text-[var(--s-head)]">Check-in: {event.title}</h1>
        <p className="text-sm text-muted-foreground">Scan QR tiket event atau QR KTA peserta. Peserta harus sudah terdaftar.</p>
      </div>
      <Scanner eventId={event.id} />
    </div>
  );
}
