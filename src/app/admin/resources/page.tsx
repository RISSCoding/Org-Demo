import { ExternalLink, FolderOpen } from "lucide-react";
import { createResourceAction, deleteResourceAction } from "@/actions/resources-admin";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { formatDate } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { RESOURCE_CATEGORIES, categoryLabel } from "@/lib/resources";
import { alertErr, alertOk, btnLine, btnPrimary, cardCls, inputCls } from "@/lib/ui";

export const metadata = { title: "Materi — ORG" };
export const dynamic = "force-dynamic";

export default async function AdminResources({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  await requirePermission("cms:write");
  const { error, ok } = await searchParams;
  const items = await prisma.resource.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Materi"
        description="Tautan materi, template, dan panduan yang tampil di portal anggota. Simpan filenya di Google Drive lalu tempel tautannya."
      />

      {error && <p role="alert" className={alertErr}>{error}</p>}
      {ok && <p role="status" className={alertOk}>{ok}</p>}

      <form action={createResourceAction} className={`${cardCls} grid gap-4 p-4 sm:grid-cols-2`}>
        <div className="space-y-1.5">
          <label htmlFor="r-title" className="text-sm font-medium">Judul</label>
          <input id="r-title" name="title" required minLength={3} maxLength={150} className={inputCls} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="r-cat" className="text-sm font-medium">Kategori</label>
          <select id="r-cat" name="category" className={inputCls} defaultValue="MODUL">
            {RESOURCE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="r-url" className="text-sm font-medium">Tautan (https://…)</label>
          <input id="r-url" name="url" type="url" required className={inputCls} placeholder="https://drive.google.com/…" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="r-desc" className="text-sm font-medium">Deskripsi (opsional)</label>
          <input id="r-desc" name="description" maxLength={500} className={inputCls} />
        </div>
        <div className="sm:col-span-2"><button type="submit" className={btnPrimary}>Tambah materi</button></div>
      </form>

      {items.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Belum ada materi"
          description="Tambahkan tautan materi pertama lewat form di atas. Pastikan filenya bisa diakses oleh anggota (mis. sharing “anyone with the link”)."
        />
      ) : (
      <div className={`${cardCls} divide-y divide-border`}>
        {items.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-medium hover:underline hover:underline-offset-4">
                {r.title} <ExternalLink className="size-3.5" aria-hidden />
              </a>
              <p className="text-xs text-muted-foreground">{categoryLabel(r.category)} · {formatDate(r.createdAt)}</p>
            </div>
            <form action={deleteResourceAction}>
              <input type="hidden" name="id" value={r.id} />
              <ConfirmSubmit message={`Hapus materi "${r.title}"?`} className={`${btnLine} text-[var(--state-danger-fg)]`}>Hapus</ConfirmSubmit>
            </form>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
