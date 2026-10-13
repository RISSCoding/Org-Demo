import type { PostCategory } from "@prisma/client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/datetime";
import { CATEGORY_LABEL, excerpt } from "@/lib/site-data";

export type PostRowData = {
  slug: string;
  title: string;
  category: PostCategory;
  publishedAt: Date | null;
  content: unknown;
};

export function PostRow({ post }: { post: PostRowData }) {
  const text = excerpt(post.content);
  return (
    <li className="border-t border-[var(--s-line)] first:border-t-0">
      <Link href={`/berita/${post.slug}`} className="group relative block space-y-1.5 py-5 transition-colors hover:bg-[var(--s-panel)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] sm:-mx-3 sm:px-3">
        <p className="text-sm text-[var(--s-muted)]">
          {CATEGORY_LABEL[post.category]}
          {post.publishedAt ? `, ${formatDate(post.publishedAt)}` : ""}
        </p>
        <h3 className="text-xl font-semibold text-[var(--s-head)] group-hover:underline group-hover:underline-offset-4">
          {post.title}
        </h3>
        {text && <p className="s-serif line-clamp-2 max-w-2xl text-[var(--s-muted)]">{text}</p>}
        <ArrowRight className="absolute right-3 top-1/2 hidden size-5 -translate-x-1 -translate-y-1/2 text-[var(--s-muted)] opacity-0 transition-[transform,opacity] duration-200 ease-[var(--ease-out)] group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 sm:block" aria-hidden />
      </Link>
    </li>
  );
}
