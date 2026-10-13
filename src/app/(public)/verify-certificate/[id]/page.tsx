import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { CERT_NUMBER_RE } from "@/lib/certificate-service";
import { formatDate } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import { linkText } from "@/lib/site-ui";

export const metadata = { title: "Hasil Verifikasi — HIMMAN UKRI", robots: { index: false } };

export default async function VerifyResult({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const number = decodeURIComponent(id).trim().toUpperCase();

  const cert = CERT_NUMBER_RE.test(number)
    ? await prisma.certificate.findUnique({
        where: { certificateNumber: number },
        select: {
          certificateNumber: true,
          issuedAt: true,
          roleTitle: true,
          user: { select: { fullName: true } },
          event: { select: { title: true, startDate: true, endDate: true, location: true } },
        },
      })
    : null;

  if (!cert) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3 border border-l-4 border-[var(--s-line)] border-l-red-600 p-5">
          <XCircle className="mt-0.5 size-6 shrink-0 text-red-600 dark:text-red-400" aria-hidden />
          <div>
            <h1 className="s-display text-2xl text-[var(--s-head)]">Sertifikat tidak ditemukan</h1>
            <p className="s-serif mt-2 text-[var(--s-muted)]">
              Nomor <span className="font-mono">{number}</span> tidak terdaftar di HIMMAN UKRI. Periksa kembali nomor
              atau QR-nya.
            </p>
          </div>
        </div>
        <Link href="/verify-certificate" className={linkText}>
          Coba nomor lain
        </Link>
      </div>
    );
  }

  const rows = [
    ["Diberikan kepada", cert.user.fullName],
    ...(cert.roleTitle ? [["Sebagai", cert.roleTitle]] : [["Sebagai", "Peserta"]]),
    ["Kegiatan", cert.event.title],
    ["Tanggal kegiatan", formatDate(cert.event.startDate)],
    ["Lokasi", cert.event.location],
    ["Nomor sertifikat", cert.certificateNumber],
    ["Diterbitkan", formatDate(cert.issuedAt)],
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 border border-l-4 border-[var(--s-line)] border-l-[var(--emerald)] p-5">
        <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-[var(--emerald)]" aria-hidden />
        <div>
          <h1 className="s-display text-2xl text-[var(--s-head)]">Sertifikat valid</h1>
          <p className="s-serif mt-2 text-[var(--s-muted)]">Sertifikat ini tercatat resmi di HIMMAN UKRI.</p>
        </div>
      </div>

      <dl>
        {rows.map(([k, v]) => (
          <div key={k} className="grid gap-1 border-t border-[var(--s-line)] py-4 sm:grid-cols-3 sm:gap-6">
            <dt className="text-sm text-[var(--s-muted)]">{k}</dt>
            <dd className="font-semibold text-[var(--s-head)] sm:col-span-2">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
