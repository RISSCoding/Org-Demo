import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CommitteeManager } from "@/components/committee/manager";
import { getEventAccess } from "@/lib/committee";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Kelola kepanitiaan — ORG" };

export default async function ManageCommittee({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ s?: string }>;
}) {
  const { slug } = await params;
  const { s } = await searchParams;
  const event = await prisma.event.findUnique({ where: { slug }, select: { id: true, title: true, slug: true } });
  if (!event) notFound();

  const access = await getEventAccess(event.id);
  if (!access.canManage) redirect(`/dashboard/events/${event.slug}/panitia`);

  return (
    <div className="max-w-3xl space-y-8">
      <div className="space-y-2">
        <Link href={`/dashboard/events/${event.slug}/panitia`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden /> Kembali ke kepanitiaanku
        </Link>
        <h1 className="s-display s-title text-3xl text-[var(--s-head)]">Kelola kepanitiaan</h1>
        <p className="text-sm text-muted-foreground">
          {event.title}.{" "}
          {access.isAdmin ? "Kamu pengurus, jadi bisa menunjuk ketua panitia." : "Sebagai ketua panitia, kamu bisa menyeleksi pendaftar dan mengatur divisi. Penunjukan ketua panitia hanya oleh pengurus."}
        </p>
      </div>
      <CommitteeManager eventId={event.id} isAdmin={access.isAdmin} basePath={`/dashboard/events/${event.slug}/panitia/kelola`} meetingsHref={`/dashboard/events/${event.slug}/panitia/rapat`} status={s} />
    </div>
  );
}
