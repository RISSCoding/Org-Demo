import { FilterForm } from "@/components/filter-form";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Mail, Paperclip, Plus } from "lucide-react";
import { Badge } from "@/components/badge";
import { formatDate } from "@/lib/datetime";
import { isLetterKind, isLetterType, KIND_LABEL, LETTER_KINDS, LETTER_LABEL, LETTER_TYPES, PARTY_LABEL } from "@/lib/letters";
import { prisma } from "@/lib/prisma";
import { getTenantPrisma } from "@/lib/prisma-tenant";
import { requirePermission } from "@/lib/rbac";
import { btnGhost, btnPrimary, cardCls, inputCls } from "@/lib/ui";

export const metadata = { title: "Sekretariat — ORG" };

type SP = { type?: string; kind?: string; q?: string; year?: string };

export default async function SecretariatPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requirePermission("secretariat:manage");
  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 100);
  const year = /^\d{4}$/.test(sp.year ?? "") ? Number(sp.year) : undefined;

  const where: Prisma.OfficialLetterWhereInput = {};
  if (isLetterType(sp.type)) where.type = sp.type;
  if (isLetterKind(sp.kind)) where.kind = sp.kind;
  if (year) where.letterDate = { gte: new Date(Date.UTC(year, 0, 1) - 7 * 3600_000), lt: new Date(Date.UTC(year + 1, 0, 1) - 7 * 3600_000) };
  if (q) {
    where.OR = [
      { subject: { contains: q, mode: "insensitive" } },
      { senderReceiver: { contains: q, mode: "insensitive" } },
      { letterNumber: { contains: q, mode: "insensitive" } },
    ];
  }

  const [rows, counts, oldest] = await Promise.all([
    tenantPrisma.officialLetter.findMany({ where, orderBy: [{ letterDate: "desc" }, { createdAt: "desc" }], take: 200 }),
    tenantPrisma.officialLetter.groupBy({ by: ["type"], _count: { _all: true } }),
    tenantPrisma.officialLetter.findFirst({ orderBy: { letterDate: "asc" }, select: { letterDate: true } }),
  ]);

  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: thisYear - (oldest?.letterDate.getFullYear() ?? thisYear) + 1 }, (_, i) => thisYear - i);

  const th = "px-4 py-3 text-left text-sm font-semibold text-foreground";
  const td = "px-4 py-3 text-sm align-top";
  const sel = `${inputCls} w-auto`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sekretariat"
        description="Arsip surat masuk, surat keluar, proposal, dan LPJ."
        action={
          <Link href="/admin/secretariat/new" className={btnPrimary}>
            <Plus className="size-4" /> Arsip baru
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {LETTER_TYPES.map((t) => (
          <Link key={t} href={`/admin/secretariat?type=${t}`} className={`${cardCls} p-4 transition hover:bg-muted/50`}>
            <p className="text-sm text-muted-foreground">{LETTER_LABEL[t]}</p>
            <p className="s-display mt-1 text-2xl">{counts.find((c) => c.type === t)?._count._all ?? 0}</p>
          </Link>
        ))}
      </div>

      <FilterForm action="/admin/secretariat" className="flex flex-wrap items-center gap-2">
        <input name="q" defaultValue={sp.q ?? ""} placeholder="Cari nomor, perihal, pihak terkait…" className={`${inputCls} w-full sm:w-72`} />
        <select name="type" defaultValue={sp.type ?? ""} className={sel}>
          <option value="">Semua jenis</option>
          {LETTER_TYPES.map((t) => <option key={t} value={t}>{LETTER_LABEL[t]}</option>)}
        </select>
        <select name="kind" defaultValue={sp.kind ?? ""} className={sel}>
          <option value="">Semua jenis surat</option>
          {LETTER_KINDS.map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
        </select>
        <select name="year" defaultValue={sp.year ?? ""} className={sel}>
          <option value="">Semua tahun</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        {(sp.q || sp.type || sp.kind || sp.year) && <Link href="/admin/secretariat" className={btnGhost}>Reset</Link>}
      </FilterForm>

      {rows.length === 0 ? (
        <EmptyState
          icon={Mail}
          title={sp.q || sp.type || sp.kind || sp.year ? "Tidak ada arsip yang cocok" : "Belum ada arsip"}
          description={
            sp.q || sp.type || sp.kind || sp.year
              ? "Coba ubah filter atau kosongkan pencarian."
              : "Arsipkan surat pertama lewat tombol di atas. Nomor surat keluar dibuat otomatis."
          }
          action={
            sp.q || sp.type || sp.kind || sp.year ? (
              <Link href="/admin/secretariat" className={btnGhost}>Hapus semua filter</Link>
            ) : (
              <Link href="/admin/secretariat/new" className={btnPrimary}>
                <Plus className="size-4" /> Arsip baru
              </Link>
            )
          }
        />
      ) : (
      <div className={`${cardCls} overflow-x-auto`}>
        <table className="w-full min-w-[960px]">
          <thead className="border-b border-border">
            <tr>
              <th className={th}>Nomor</th><th className={th}>Jenis</th><th className={th}>Perihal</th>
              <th className={th}>Pihak terkait</th><th className={th}>Tanggal surat</th><th className={th}>Status</th><th className={`${th} text-right`}>Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className={`${td} whitespace-nowrap font-medium`}>{r.letterNumber ?? "—"}</td>
                <td className={td}>
                  <Badge tone={r.type === "SURAT_MASUK" ? "warn" : "muted"}>{LETTER_LABEL[r.type]}</Badge>
                  {r.kind && <span className="mt-1 block text-xs text-muted-foreground">{KIND_LABEL[r.kind]}</span>}
                </td>
                <td className={td}>
                  {r.subject}
                  {r.documentUrl && (
                    <a href={r.documentUrl} target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-1 text-xs font-medium text-[var(--state-warning-fg)] underline underline-offset-4 hover:no-underline">
                      <Paperclip className="size-3" /> Dokumen PDF
                    </a>
                  )}
                </td>
                <td className={td}>
                  <span className="block text-xs text-muted-foreground">{PARTY_LABEL[r.type]}</span>
                  {r.senderReceiver}
                </td>
                <td className={`${td} whitespace-nowrap`}>
                  {formatDate(r.letterDate)}
                  {r.receivedAt && <span className="block text-xs text-muted-foreground">Diterima {formatDate(r.receivedAt)}</span>}
                </td>
                <td className={td}>
                  {r.type === "SURAT_MASUK" ? (r.forwardedAt ? <Badge tone="ok">Diteruskan</Badge> : <Badge tone="warn">Belum diteruskan</Badge>) : "—"}
                </td>
                <td className={`${td} text-right`}>
                  <Link href={`/admin/secretariat/${r.id}`} className={btnGhost}>Detail</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
      {rows.length === 200 && <p className="text-xs text-muted-foreground">Menampilkan 200 arsip terbaru. Persempit dengan filter.</p>}
    </div>
  );
}
