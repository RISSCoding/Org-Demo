import { PageHead, Section } from "@/components/site/section";
import { PostRow } from "@/components/site/post-row";
import { latestPosts } from "@/lib/site-data";

export const metadata = { title: "Berita — HIMMAN UKRI" };
export const dynamic = "force-dynamic";

export default async function Berita() {
  const posts = await latestPosts();
  return (
    <>
      <PageHead title="Berita dan pengumuman" intro="Informasi resmi dari pengurus HIMMAN." />
      <Section title="Terbaru">
        {posts.length === 0 ? (
          <p className="s-serif text-[var(--s-muted)]">
            Belum ada berita atau pengumuman. Informasi resmi himpunan akan diterbitkan di sini.
          </p>
        ) : (
          <ul className="max-w-3xl">{posts.map((p) => <PostRow key={p.slug} post={p} />)}</ul>
        )}
      </Section>
    </>
  );
}
