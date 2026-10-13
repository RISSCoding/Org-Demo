import { FilterForm } from "@/components/filter-form";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Badge } from "@/components/badge";
import { formatDateTime } from "@/lib/datetime";
import {
  FEEDBACK_CATEGORIES, FEEDBACK_STATUSES, isFeedbackCategory, isFeedbackStatus, STATUS_LABEL, STATUS_TONE,
} from "@/lib/feedback";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { btnGhost, cardCls, inputCls } from "@/lib/ui";

export const metadata = { title: "Kotak Aspirasi — HIMMAN UKRI" };
export const dynamic = "force-dynamic";

type SP = { q?: string; status?: string; category?: string };

export default async function FeedbackInbox({ searchParams }: { searchParams: Promise<SP> }) {
  await requirePermission("aspirasi:manage");
  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 100);

  const where: Prisma.FeedbackWhereInput = {};
  if (isFeedbackStatus(sp.status)) where.status = sp.status;
  if (isFeedbackCategory(sp.category)) where.category = sp.category;
  if (q) {
    where.OR = [
      { subject: { contains: q, mode: "insensitive" } },
      { message: { contains: q, mode: "insensitive" } },
      { trackingCode: { contains: q, mode: "insensitive" } },
    ];
  }

  const [rows, counts] = await Promise.all([
    // Urutan enum di database: OPEN, REVIEWED, RESOLVED, jadi pesan baru selalu di atas.
    prisma.feedback.findMany({
      where,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 100,
      select: {
        id: true, trackingCode: true, category: true, subject: true, status: true,
        isAnonymous: true, createdAt: true, response: true,
        sender: { select: { fullName: true } },
      },
    }),
    prisma.feedback.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const countOf = (s: (typeof FEEDBACK_STATUSES)[number]) => counts.find((c) => c.status === s)?._count._all ?? 0;

  const th = "px-4 py-3 text-left text-sm font-semibold text-foreground";
  const td = "px-4 py-3 text-sm align-top";
  const filtered = !!(sp.q || sp.status || sp.category);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="s-display s-title text-3xl text-[var(--s-head)]">Kotak aspirasi</h1>
        <p className="text-sm text-muted-foreground">
          Saran, keluhan, dan laporan dari mahasiswa dan pengurus untuk Komisi III Badan Pengawas Pengurus.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {FEEDBACK_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/feedback?status=${s}`}
            className={`${cardCls} p-4 transition hover:bg-muted/50 ${sp.status === s ? "border-[#ffa500]" : ""}`}
          >
            <p className="text-sm text-muted-foreground">{STATUS_LABEL[s]}</p>
            <p className="s-display mt-1 text-2xl">{countOf(s)}</p>
          </Link>
        ))}
      </div>

      <FilterForm action="/admin/feedback" className="flex flex-wrap items-center gap-2">
        <label htmlFor="q" className="sr-only">Cari pesan</label>
        <input id="q" name="q" defaultValue={sp.q ?? ""} placeholder="Cari judul, isi, atau kode…" className={`${inputCls} w-full sm:w-72`} />
        <select name="status" aria-label="Status" defaultValue={sp.status ?? ""} className={`${inputCls} w-auto`}>
          <option value="">Semua status</option>
          {FEEDBACK_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <select name="category" aria-label="Jenis pesan" defaultValue={sp.category ?? ""} className={`${inputCls} w-auto`}>
          <option value="">Semua jenis</option>
          {FEEDBACK_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {filtered && <Link href="/admin/feedback" className={btnGhost}>Reset</Link>}
      </FilterForm>

      <div className={`${cardCls} overflow-x-auto`}>
        <table className="w-full min-w-[860px]">
          <thead className="border-b border-border">
            <tr>
              <th className={th}>Pesan</th><th className={th}>Pengirim</th><th className={th}>Status</th>
              <th className={th}>Dikirim</th><th className={`${th} text-right`}>Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className={`${td} text-muted-foreground`}>
                  {filtered ? "Tidak ada pesan yang cocok dengan filter." : "Belum ada pesan masuk."}
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id}>
                <td className={td}>
                  <Link href={`/admin/feedback/${r.id}`} className="font-medium hover:underline hover:underline-offset-4">
                    {r.subject}
                  </Link>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {r.category} <span className="font-mono">{r.trackingCode}</span>
                  </span>
                </td>
                <td className={td}>
                  {r.isAnonymous || !r.sender ? <span className="text-muted-foreground">Anonim</span> : r.sender.fullName}
                </td>
                <td className={td}>
                  <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                  {r.response && <span className="mt-1 block text-xs text-muted-foreground">Sudah ditanggapi</span>}
                </td>
                <td className={`${td} whitespace-nowrap`}>{formatDateTime(r.createdAt)}</td>
                <td className={`${td} text-right`}>
                  <Link href={`/admin/feedback/${r.id}`} className={btnGhost}>Buka</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 100 && <p className="text-xs text-muted-foreground">Menampilkan 100 pesan. Persempit dengan filter.</p>}
    </div>
  );
}
