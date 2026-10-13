import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { formatDateTime } from "@/lib/datetime";
import { memberTitle } from "@/lib/member-title";
import { prisma } from "@/lib/prisma";
import { verifySig } from "@/lib/security";

export const metadata = { title: "Verifikasi Anggota — HIMMAN UKRI", robots: { index: false } };
export const dynamic = "force-dynamic";

const TOKEN_RE = /^(\d{6,20})\.([a-f0-9]{32})$/;
const STATUS_LABEL = { ACTIVE: "Aktif", INACTIVE: "Tidak aktif", ALUMNI: "Alumni" } as const;

export default async function VerifyMember({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const m = TOKEN_RE.exec(decodeURIComponent(token).trim().toLowerCase());
  // Tanda tangan dicek sebelum menyentuh database: NPM yang ditebak tanpa QR asli tidak akan menampilkan apa pun.
  const user =
    m && verifySig(`KTA:${m[1]}`, m[2])
      ? await prisma.user.findUnique({
          where: { nim: m[1] },
          select: {
            fullName: true,
            nim: true,
            batchYear: true,
            approvalStatus: true,
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
        })
      : null;

  if (!user || !user.member || user.approvalStatus !== "APPROVED") {
    return (
      <div className="flex items-start gap-3 border border-l-4 border-[var(--s-line)] border-l-red-600 p-5">
        <XCircle className="mt-0.5 size-6 shrink-0 text-[var(--state-danger-fg)]" aria-hidden />
        <div>
          <h1 className="s-display text-2xl text-[var(--s-head)]">Anggota tidak ditemukan</h1>
          <p className="s-serif mt-2 text-[var(--s-muted)]">
            KTA ini tidak terdaftar sebagai anggota HIMMAN UKRI, atau QR-nya tidak valid.
          </p>
        </div>
      </div>
    );
  }

  const status = user.member.status;
  const ok = status !== "INACTIVE";
  const title = memberTitle({
    officerPosition: user.officerRoles[0]?.position ?? null,
    divisionName: user.member.division?.name ?? null,
    divisionRole: user.member.divisionRole,
  });
  const rows = [
    ["Nama", user.fullName],
    ["NPM", user.nim],
    ["Nomor KTA", user.member.ktaNumber],
    ["Angkatan", String(user.batchYear)],
    ["Jabatan", title],
    ["Status keanggotaan", STATUS_LABEL[status]],
    ["Diperiksa", formatDateTime(new Date())],
  ];

  return (
    <div className="space-y-6">
      <div
        className={`flex items-start gap-3 border border-l-4 border-[var(--s-line)] p-5 ${
          ok ? "border-l-[var(--emerald)]" : "border-l-[var(--gold)]"
        }`}
      >
        {ok ? (
          <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-[var(--emerald)]" aria-hidden />
        ) : (
          <AlertTriangle className="mt-0.5 size-6 shrink-0 text-[var(--state-warning-fg)]" aria-hidden />
        )}
        <div>
          <h1 className="s-display text-2xl text-[var(--s-head)]">
            {status === "ACTIVE" ? "Anggota terverifikasi" : status === "ALUMNI" ? "Alumni terverifikasi" : "Terdaftar, tidak aktif"}
          </h1>
          <p className="s-serif mt-2 text-[var(--s-muted)]">
            {ok ? "KTA ini tercatat resmi di HIMMAN UKRI." : "KTA ini tercatat di HIMMAN UKRI, tetapi keanggotaannya sedang tidak aktif."}
          </p>
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
