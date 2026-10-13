import type { PostCategory } from "@prisma/client";
import { TZ } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";

const eventSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  bannerUrl: true,
  startDate: true,
  endDate: true,
  location: true,
  quota: true,
} as const;

/** Kegiatan publik yang belum selesai, terdekat lebih dulu. */
export const upcomingPublicEvents = (take?: number) =>
  prisma.event.findMany({
    where: { isPublic: true, endDate: { gte: new Date() } },
    orderBy: { startDate: "asc" },
    take,
    select: eventSelect,
  });

export const pastPublicEvents = (take = 12) =>
  prisma.event.findMany({
    where: { isPublic: true, endDate: { lt: new Date() } },
    orderBy: { startDate: "desc" },
    take,
    select: eventSelect,
  });

const postSelect = {
  id: true,
  slug: true,
  title: true,
  category: true,
  thumbnailUrl: true,
  publishedAt: true,
  content: true,
} as const;

const published = () => ({ publishedAt: { not: null, lte: new Date() } });

export const latestPosts = (take?: number) =>
  prisma.cmsPost.findMany({
    where: published(),
    orderBy: { publishedAt: "desc" },
    take,
    select: postSelect,
  });

export const postBySlug = (slug: string) =>
  prisma.cmsPost.findFirst({ where: { slug, ...published() }, select: postSelect });

export const CATEGORY_LABEL: Record<PostCategory, string> = {
  NEWS: "Berita",
  ANNOUNCEMENT: "Pengumuman",
  ARTICLE: "Artikel",
};

/**
 * CmsPost.content bertipe Json dan editor CMS belum ada, jadi bentuknya belum pasti.
 * Fungsi ini menerima string, {text}, {blocks:[...]}, atau array string/blok {text}.
 * Sesuaikan bila format dari editor CMS sudah ditetapkan.
 */
export function postParagraphs(content: unknown): string[] {
  const out: string[] = [];
  const walk = (v: unknown) => {
    if (typeof v === "string") {
      v.split(/\n{2,}/).forEach((p) => p.trim() && out.push(p.trim()));
    } else if (Array.isArray(v)) {
      v.forEach(walk);
    } else if (v && typeof v === "object") {
      const o = v as Record<string, unknown>;
      if (typeof o.text === "string") walk(o.text);
      else if (o.blocks) walk(o.blocks);
    }
  };
  walk(content);
  return out;
}

/** Teks mentah untuk editor CMS: kebalikan dari penyimpanan `{ text }` di posts-admin. */
export function postRawText(content: unknown): string {
  if (content && typeof content === "object" && !Array.isArray(content)) {
    const t = (content as { text?: unknown }).text;
    if (typeof t === "string") return t;
  }
  return postParagraphs(content).join("\n\n");
}

export const excerpt = (content: unknown, max = 160) => {
  const t = postParagraphs(content)[0] ?? "";
  return t.length > max ? `${t.slice(0, max).trimEnd()}…` : t;
};

/** Hari dan bulan singkat dalam WIB, untuk blok tanggal. */
export function dateParts(d: Date) {
  const f = (opt: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("id-ID", { timeZone: TZ, ...opt }).format(d);
  return { day: f({ day: "numeric" }), month: f({ month: "short" }), year: f({ year: "numeric" }) };
}
