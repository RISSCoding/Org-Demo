import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/datetime";
import { CATEGORY_LABEL, excerpt, postBySlug, postParagraphs } from "@/lib/site-data";
import { container, linkText } from "@/lib/site-ui";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await postBySlug(slug);
  return p
    ? { title: `${p.title} — ORG`, description: excerpt(p.content, 155) || undefined }
    : { title: "Berita — ORG" };
}

export default async function BeritaDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await postBySlug(slug);
  if (!post) notFound();

  return (
    <article className={`${container} max-w-3xl py-14`}>
      <Link href="/berita" className={`${linkText} text-sm`}>Semua berita</Link>
      <div className="mb-6 mt-8 h-1 w-14 bg-[#ffa500]" aria-hidden />
      <p className="text-sm text-[var(--s-muted)]">
        {CATEGORY_LABEL[post.category]}
        {post.publishedAt ? `, ${formatDate(post.publishedAt)}` : ""}
      </p>
      <h1 className="s-display mt-2 text-3xl text-[var(--s-head)] md:text-4xl">{post.title}</h1>

      {post.thumbnailUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.thumbnailUrl} alt="" className="mt-8 aspect-[16/8] w-full object-cover" />
      )}

      <div className="s-serif mt-8 max-w-prose space-y-5 text-lg">
        {postParagraphs(post.content).map((t, i) => <p key={i}>{t}</p>)}
      </div>
    </article>
  );
}
