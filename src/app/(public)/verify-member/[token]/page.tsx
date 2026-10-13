import Link from "next/link";
import { headers } from "next/headers";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { formatDateTime } from "@/lib/datetime";
import { memberTitle } from "@/lib/member-title";
import { prisma } from "@/lib/prisma";
import { isValidKtaNumber, verifySig } from "@/lib/security";
import { linkText } from "@/lib/site-ui";

export const metadata = { title: "Verifikasi Anggota — ORG", robots: { index: false } };
// Status keanggotaan harus selalu terbaru, jangan di-cache.
export const dynamic = "force-dynamic";

const LEGACY_RE = /^(\d{6,20})\.([a-f0-9]{32})$/;
const STATUS_LABEL = { ACTIVE: "Aktif", INACTIVE: "Tidak aktif", ALUMNI: "Alumni" } as const;

// Pembatas sederhana di memori proses. Cukup untuk mencegah enumerasi lewat
// nomor berurutan tanpa membebani DB pada setiap kunjungan.
const hits = new Map<string, number[]>();
const HITS_WINDOW = 60 * 60 * 1000;
const HITS_LIMIT = 30;
function limited(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < HITS_WINDOW);
  if (recent.length >= HITS_LIMIT) {
    hits.set(key, recent);
    return true;
  }
  hits.set(key, [...recent, now]);
  return false;
}

async function lookupUser(token: string) {
  const lower = decodeURIComponent(token).trim().toLowerCase();

  // Format baru: nomor KTA (mis. 025207, 025207-2)
  if (isValidKtaNumber(lower)) {
    return prisma.user.findFirst({
      where: { member: { ktaNumber: lower } },
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
    });
  }

  // Format lama: <nim>.<hash> bertanda tangan (QR cetak lama).
  const m = LEGACY_RE.exec(lower);
  if (m && verifySig(`KTA:${m[1]}`, m[2])) {
    return prisma.user.findUnique({
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
    });
  }
  return null;
}

function NotFound({ message }: { message: string }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 border border-l-4 border-[var(--s-line)] border-l-red-600 p-5">
        <XCircle className="mt-0.5 size-6 shrink-0 text-red-600 dark:text-red-400" aria-hidden />
        <div>
          <h1 className="s-display text-2xl text-[var(--s-head)]">Anggota tidak ditemukan</h1>
          <p className="s-serif mt-2 text-[var(--s-muted)]">{message}</p>
        </div>
      </div>
      <Link href="/verify-member" className={linkText}>Coba nomor lain</Link>
    </div>
  );
}

export default async function VerifyMember({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  // Batasi enumerasi: satu IP hanya boleh 30 verifikasi per jam.
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) {
    return (
      <div className="flex items-start gap-3 border border-l-4 border-[var(--s-line)] border-l-[var(--gold)] p-5">
        <AlertTriangle className="mt-0.5 size-6 shrink-0 text-[var(--gold-text)]" aria-hidden />
        <div>
          <h1 className="s-display text-2xl text-[var(--s-head)]">Terlalu banyak percobaan</h1>
          <p className="s-serif mt-2 text-[var(--s-muted)]">
            Coba lagi dalam satu jam. Kalau kamu perlu memverifikasi banyak anggota sekaligus,
            hubungi pengurus untuk bantuan.
          </p>
        </div>
      </div>
    );
  }

  const user = await lookupUser(token);

  if (!user || !user.member || user.approvalStatus !== "APPROVED") {
    return <NotFound message="KTA ini tidak terdaftar sebagai anggota ORG, atau tautannya tidak valid." />;
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
          <AlertTriangle className="mt-0.5 size-6 shrink-0 text-[var(--gold-text)]" aria-hidden />
        )}
        <div>
          <h1 className="s-display text-2xl text-[var(--s-head)]">
            {status === "ACTIVE" ? "Anggota terverifikasi" : status === "ALUMNI" ? "Alumni terverifikasi" : "Terdaftar, tidak aktif"}
          </h1>
          <p className="s-serif mt-2 text-[var(--s-muted)]">
            {ok ? "KTA ini tercatat resmi di ORG." : "KTA ini tercatat di ORG, tetapi keanggotaannya sedang tidak aktif."}
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
