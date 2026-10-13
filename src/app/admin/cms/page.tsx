import Link from "next/link";
import type { PostCategory, Prisma } from "@prisma/client";
import { ExternalLink, Newspaper, Plus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { formatDate, formatDateTime } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { CATEGORY_LABEL } from "@/lib/site-data";
import { btnGhost, btnPrimary, cardCls, inputCls } from "@/lib/ui";

export const metadata = { title: "Berita & Artikel — ORG" };
export const dynamic = "force-dynamic";

type SP = { q?: string; status?: string; kategori?: string };
const STATUSES = ["draft", "scheduled", "published"] as const;
const STATUS_LABEL = { draft: "Draf", scheduled: "Terjadwal", published: "Terbit" } as const;

export default async function AdminCms({ searchParams }: { searchParams: Promise<SP> }) {
  await requirePermission("cms:write");
  const sp = await searchParams;
  const now = new Date();
  const q = sp.q?.trim().slice(0, 100);
  const status = STATUSES.find((s) => s === sp.status);
  const category = (Object.keys(CATEGORY_LABEL) as PostCategory[]).find((c) => c === sp.kategori);

  const where: Prisma.CmsPostWhereInput = {};
  if (q) where.title = { contains: q, mode: "insensitive" };
  if (category) where.category = category;
  if (status === "draft") where.publishedAt = null;
  if (status === "scheduled") where.publishedAt = { gt: now };
  if (status === "published") where.publishedAt = { lte: now };

  const posts = await prisma.cmsPost.findMany({
    where,
    orderBy: [{ publishedAt: { sort: "desc", nulls: "first" } }, { title: "asc" }],
    take: 200,
    select: { id: true, slug: true, title: true, category: true, publishedAt: true, author: { select: { fullName: true } } },
  });

  const th = "px-4 py-3 text-left text-sm font-semibold text-foreground";
  const td = "px-4 py-3 text-sm";
  const sel = `${inputCls} w-auto`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Berita & Artikel"
        description="Tulis dan terbitkan informasi resmi untuk halaman Berita."
        action={
          <Link href="/admin/cms/new" className={btnPrimary}>
            <Plus className="size-4" /> Tulis baru
          </Link>
        }
      />

      <form method="get" className="flex flex-wrap items-center gap-2">
        <input name="q" defaultValue={sp.q ?? ""} placeholder="Cari judul…" className={`${inputCls} w-full sm:w-64`} />
        <select name="status" defaultValue={status ?? ""} className={sel}>
          <option value="">Semua status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <select name="kategori" defaultValue={category ?? ""} className={sel}>
          <option value="">Semua kategori</option>
          {Object.entries(CATEGORY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button type="submit" className={`${btnGhost} h-10 border border-border`}>Terapkan</button>
        {(q || status || category) && <Link href="/admin/cms" className={btnGhost}>Reset</Link>}
      </form>

      {posts.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title={q || status || category ? "Tidak ada tulisan yang cocok" : "Belum ada tulisan"}
          description={
            q || status || category
              ? "Coba ubah filter atau kosongkan pencarian."
              : "Tulis berita atau pengumuman pertama. Bisa disimpan sebagai draf dulu."
          }
          action={
            q || status || category ? (
              <Link href="/admin/cms" className={btnGhost}>Hapus semua filter</Link>
            ) : (
              <Link href="/admin/cms/new" className={btnPrimary}>
                <Plus className="size-4" /> Tulis yang pertama
              </Link>
            )
          }
        />
      ) : (
      <div className={`${cardCls} overflow-x-auto`}>
        <table className="w-full min-w-[720px]">
          <thead className="border-b border-border">
            <tr><th className={th}>Judul</th><th className={th}>Kategori</th><th className={th}>Status</th><th className={th}>Penulis</th><th className={th} /></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {posts.map((p) => {
              const live = p.publishedAt && p.publishedAt <= now;
              return (
                <tr key={p.id} className="hover:bg-muted/50">
                  <td className={td}>
                    <Link href={`/admin/cms/${p.id}`} className="font-medium hover:underline hover:underline-offset-4">{p.title}</Link>
                  </td>
                  <td className={td}>{CATEGORY_LABEL[p.category]}</td>
                  <td className={td}>
                    {!p.publishedAt ? (
                      <span className="rounded-sm bg-muted px-2 py-0.5 text-xs font-semibold">Draf</span>
                    ) : live ? (
                      <span className="text-xs font-semibold">Terbit {formatDate(p.publishedAt)}</span>
                    ) : (
                      <span className="rounded-sm bg-[#ffa500]/20 px-2 py-0.5 text-xs font-semibold">Terjadwal {formatDateTime(p.publishedAt)}</span>
                    )}
                  </td>
                  <td className={td}>{p.author.fullName}</td>
                  <td className={`${td} text-right`}>
                    {live && (
                      <Link href={`/berita/${p.slug}`} target="_blank" className={btnGhost} aria-label={`Lihat ${p.title} di situs`}>
                        <ExternalLink className="size-4" />
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}
      {posts.length === 200 && <p className="text-xs text-muted-foreground">Menampilkan 200 tulisan teratas. Persempit dengan filter.</p>}
    </div>
  );
}
