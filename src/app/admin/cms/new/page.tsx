import { PostForm } from "@/components/post-form";
import { requirePermission } from "@/lib/rbac";

export const metadata = { title: "Tulis Baru — HIMMAN UKRI" };

export default async function NewPost() {
  await requirePermission("cms:write");
  return (
    <div className="space-y-6">
      <h1 className="s-display s-title text-3xl text-[var(--s-head)]">Tulis baru</h1>
      <PostForm />
    </div>
  );
}
