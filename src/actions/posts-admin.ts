"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { parseWIB } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { slugify, withSuffix } from "@/lib/slug";
import { deletePublicImage, saveImage, UploadError } from "@/lib/storage";
import type { FormState } from "@/types/forms";

const schema = z.object({
  title: z.string().trim().min(3, "Minimal 3 karakter").max(150),
  category: z.enum(["NEWS", "ANNOUNCEMENT", "ARTICLE"], { message: "Pilih kategori" }),
  // Disimpan sebagai { text }; format ringan (judul, daftar, tebal, tautan) dibaca lib/post-format.ts
  content: z.string().trim().min(10, "Minimal 10 karakter").max(20000, "Maksimal 20.000 karakter"),
  status: z.enum(["draft", "published", "scheduled"]),
  publishAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/).optional(),
});

async function uniqueSlug(title: string) {
  const base = slugify(title);
  let slug = base;
  while (await prisma.cmsPost.findUnique({ where: { slug }, select: { id: true } })) slug = withSuffix(base);
  return slug;
}

function revalidatePublic(slug?: string) {
  revalidatePath("/");
  revalidatePath("/berita");
  if (slug) revalidatePath(`/berita/${slug}`);
}

export async function savePostAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requirePermission("cms:write");
  const id = String(fd.get("id") ?? "");

  const parsed = schema.safeParse({
    title: fd.get("title"),
    category: fd.get("category"),
    content: fd.get("content"),
    status: fd.get("status"),
    publishAt: String(fd.get("publishAt") ?? "") || undefined,
  });
  if (!parsed.success) {
    return { error: "Periksa kembali isian formulir.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;

  const now = new Date();
  let scheduledFor: Date | null = null;
  if (d.status === "scheduled") {
    if (!d.publishAt) return { error: "Periksa kembali isian formulir.", fieldErrors: { publishAt: ["Isi tanggal dan jam terbit"] } };
    scheduledFor = parseWIB(d.publishAt);
    if (Number.isNaN(scheduledFor.getTime()) || scheduledFor.getTime() <= now.getTime()) {
      return { error: "Periksa kembali isian formulir.", fieldErrors: { publishAt: ["Jadwal harus di masa depan (WIB)"] } };
    }
  }

  const existing = id
    ? await prisma.cmsPost.findUnique({ where: { id }, select: { slug: true, publishedAt: true, thumbnailUrl: true } })
    : null;
  if (id && !existing) return { error: "Tulisan tidak ditemukan." };

  let thumbnailUrl: string | undefined;
  const thumb = fd.get("thumbnail");
  if (thumb instanceof File && thumb.size > 0) {
    try {
      thumbnailUrl = await saveImage(thumb, "posts");
    } catch (e) {
      if (e instanceof UploadError) return { error: "Gambar gagal diunggah.", fieldErrors: { thumbnail: [e.message] } };
      throw e;
    }
  }
  const removeThumbnail = fd.get("removeThumbnail") === "on" && !thumbnailUrl;

  // Terbit sekarang: tanggal asli dipertahankan bila sudah pernah terbit; terjadwal: tanggal jadwal; draf: kosong.
  const alreadyLive = existing?.publishedAt && existing.publishedAt.getTime() <= now.getTime();
  const publishedAt =
    d.status === "published" ? (alreadyLive ? existing!.publishedAt : now) : d.status === "scheduled" ? scheduledFor : null;

  const data = {
    title: d.title,
    category: d.category,
    content: { text: d.content },
    publishedAt,
    ...(thumbnailUrl ? { thumbnailUrl } : removeThumbnail ? { thumbnailUrl: null } : {}),
  };

  let postId: string;
  let slug: string;
  if (id && existing) {
    await prisma.cmsPost.update({ where: { id }, data });
    postId = id;
    slug = existing.slug;
    // Berkas sampul lama dibersihkan setelah database berhasil diperbarui.
    if (thumbnailUrl || removeThumbnail) await deletePublicImage(existing.thumbnailUrl);
  } else {
    slug = await uniqueSlug(d.title);
    const created = await prisma.cmsPost.create({ data: { ...data, slug, authorId: user.id } });
    postId = created.id;
  }

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: id ? "UPDATE" : "CREATE",
      entity: "cms_posts",
      entityId: postId,
      meta: { status: d.status, publishedAt: publishedAt?.toISOString() ?? null },
    },
  });
  revalidatePath("/admin/cms");
  revalidatePublic(slug);
  redirect("/admin/cms");
}

export async function deletePostAction(fd: FormData): Promise<void> {
  const user = await requirePermission("cms:write");
  const id = String(fd.get("id") ?? "");
  const post = await prisma.cmsPost.findUnique({ where: { id }, select: { slug: true, title: true, thumbnailUrl: true } });
  if (!post) redirect("/admin/cms");

  await prisma.cmsPost.delete({ where: { id } });
  await deletePublicImage(post.thumbnailUrl);
  await prisma.auditLog.create({
    data: { userId: user.id, action: "DELETE", entity: "cms_posts", entityId: id, meta: { title: post.title } },
  });
  revalidatePath("/admin/cms");
  revalidatePublic(post.slug);
  redirect("/admin/cms");
}
