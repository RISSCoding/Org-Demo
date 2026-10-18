import Link from "next/link";
import { ClipboardCheck, Download } from "lucide-react";
import { IssueCertificatesForm } from "@/components/issue-certificates-form";
import { btnGhost, btnLine, cardCls } from "@/lib/ui";

export function CertificatePanel({
  eventId,
  attended,
  issued,
}: {
  eventId: string;
  attended: number;
  issued: number;
}) {
  const pending = Math.max(0, attended - issued);
  return (
    <section className={`${cardCls} space-y-4 p-5`}>
      <div>
        <h2 className="text-lg font-semibold text-[var(--s-head)]">Sertifikat</h2>
        <p className="text-sm text-muted-foreground">
          Diterbitkan untuk peserta berstatus <strong>Hadir</strong>. {issued} dari {attended} sudah terbit
          {pending > 0 ? `, ${pending} menunggu.` : "."}
        </p>
      </div>
      <div className="flex flex-wrap items-start gap-3">
        <IssueCertificatesForm eventId={eventId} disabled={pending === 0} />
        {issued > 0 && (
          <a href={`/api/events/${eventId}/certificates/zip`} className={`${btnGhost} h-10 border border-border`}>
            <Download className="size-4" /> Unduh semua (ZIP)
          </a>
        )}
        <Link href={`/admin/events/${eventId}/certificates`} className={btnLine}>
          <ClipboardCheck className="size-4" aria-hidden /> Audit
        </Link>
      </div>
    </section>
  );
}
