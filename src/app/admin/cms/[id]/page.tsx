import { notFound } from "next/navigation";
import { deletePostAction } from "@/actions/posts-admin";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { PostForm } from "@/components/post-form";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { toInputValue } from "@/lib/datetime";
import { postRawText } from "@/lib/site-data";
import { btnLine } from "@/lib/ui";

export const metadata = { title: "Edit Tulisan — ORG" };

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("cms:write");
  const { id } = await params;
  const p = await prisma.cmsPost.findUnique({ where: { id } });
  if (!p) notFound();
  const now = new Date();
  const scheduled = p.publishedAt !== null && p.publishedAt > now;

  return (
    <div className="space-y-6">
      <h1 className="s-display s-title text-3xl text-[var(--s-head)]">Edit tulisan</h1>
      <PostForm
        post={{
          id: p.id,
          title: p.title,
          category: p.category,
          content: postRawText(p.content),
          status: !p.publishedAt ? "draft" : scheduled ? "scheduled" : "published",
          publishAt: scheduled && p.publishedAt ? toInputValue(p.publishedAt) : "",
          thumbnailUrl: p.thumbnailUrl,
        }}
      />
      <form action={deletePostAction} className="max-w-2xl border-t border-border pt-5">
        <input type="hidden" name="id" value={p.id} />
        <ConfirmSubmit message="Hapus tulisan ini secara permanen?" className={`${btnLine} text-[var(--state-danger-fg)]`}>
          Hapus tulisan
        </ConfirmSubmit>
      </form>
    </div>
  );
}
