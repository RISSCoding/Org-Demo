import { Award, Download, ShieldCheck } from "lucide-react";
import { auth } from "@/auth";
import { formatDate } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import { btnGhost, btnPrimary, cardCls } from "@/lib/ui";

export const metadata = { title: "Sertifikat — HIMMAN UKRI" };

export default async function CertificateVault() {
  const session = await auth();
  const certs = await prisma.certificate.findMany({
    where: { userId: session!.user.id },
    orderBy: { issuedAt: "desc" },
    select: {
      id: true,
      certificateNumber: true,
      issuedAt: true,
      roleTitle: true,
      event: { select: { title: true, startDate: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="s-display s-title text-3xl text-[var(--s-head)]">Sertifikat</h1>
        <p className="text-sm text-muted-foreground">Semua sertifikat kegiatan yang pernah kamu ikuti, sebagai peserta maupun panitia.</p>
      </div>

      {certs.length === 0 ? (
        <p className={`${cardCls} p-6 text-sm text-muted-foreground`}>
          Belum ada sertifikat. Sertifikat terbit setelah kehadiranmu di sebuah event dicatat, sebagai peserta atau sebagai panitia.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {certs.map((c) => (
            <div key={c.id} className={`${cardCls} flex gap-4 p-5`}>
              <div className="grid size-11 shrink-0 place-items-center rounded-sm bg-[var(--gold)]/15 text-[var(--state-warning-fg)]">
                <Award className="size-5" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-medium leading-snug">{c.event.title}</p>
                <p className="text-xs font-semibold text-[var(--state-warning-fg)]">{c.roleTitle ?? "Peserta"}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(c.event.startDate)} · {c.certificateNumber}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <a href={`/api/certificates/${c.certificateNumber}/pdf`} className={btnPrimary}>
                    <Download className="size-4" /> Unduh PDF
                  </a>
                  <a
                    href={`/verify-certificate/${c.certificateNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className={`${btnGhost} h-10 border border-border`}
                  >
                    <ShieldCheck className="size-4" /> Verifikasi
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
