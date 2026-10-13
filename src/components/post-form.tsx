"use client";

import { useActionState, useState } from "react";
import { savePostAction } from "@/actions/posts-admin";
import { Field } from "@/components/auth/field";
import { PostBody } from "@/components/site/post-body";
import { btnPrimary, inputCls } from "@/lib/ui";
import type { FormState } from "@/types/forms";

export type PostStatus = "draft" | "published" | "scheduled";

export type PostFormValues = {
  id: string;
  title: string;
  category: "NEWS" | "ANNOUNCEMENT" | "ARTICLE";
  content: string;
  status: PostStatus;
  /** "YYYY-MM-DDTHH:mm" (WIB), terisi bila terjadwal */
  publishAt: string;
  thumbnailUrl: string | null;
};

const Err = ({ list }: { list?: string[] }) =>
  list?.map((e) => (
    <p key={e} className="text-xs text-[var(--state-danger-fg)]">{e}</p>
  )) ?? null;

const tabCls = (on: boolean) =>
  `h-9 rounded-sm px-3 text-sm font-medium ${on ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"}`;

export function PostForm({ post }: { post?: PostFormValues }) {
  const [state, action, pending] = useActionState<FormState, FormData>(savePostAction, {});
  const [status, setStatus] = useState<PostStatus>(post?.status ?? "draft");
  const [content, setContent] = useState(post?.content ?? "");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="max-w-2xl space-y-5">
      {post && <input type="hidden" name="id" value={post.id} />}

      <Field label="Judul" name="title" defaultValue={post?.title} errors={fe.title} required />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="category" className="text-sm font-medium">Kategori</label>
          <select id="category" name="category" defaultValue={post?.category ?? "NEWS"} className={inputCls}>
            <option value="NEWS">Berita</option>
            <option value="ANNOUNCEMENT">Pengumuman</option>
            <option value="ARTICLE">Artikel</option>
          </select>
          <Err list={fe.category} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="status" className="text-sm font-medium">Status</label>
          <select id="status" name="status" value={status} onChange={(e) => setStatus(e.target.value as PostStatus)} className={inputCls}>
            <option value="draft">Draf (belum tampil)</option>
            <option value="published">Terbitkan sekarang</option>
            <option value="scheduled">Jadwalkan terbit</option>
          </select>
        </div>
      </div>

      {status === "scheduled" && (
        <Field
          label="Tanggal & jam terbit (WIB)"
          name="publishAt"
          type="datetime-local"
          defaultValue={post?.publishAt}
          errors={fe.publishAt}
          hint="Tulisan otomatis tampil di halaman Berita pada waktu ini."
          required
        />
      )}

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="content" className="text-sm font-medium">Isi tulisan</label>
          <div className="flex gap-1" role="tablist" aria-label="Mode isi tulisan">
            <button type="button" role="tab" aria-selected={tab === "write"} onClick={() => setTab("write")} className={tabCls(tab === "write")}>Tulis</button>
            <button type="button" role="tab" aria-selected={tab === "preview"} onClick={() => setTab("preview")} className={tabCls(tab === "preview")}>Pratinjau</button>
          </div>
        </div>
        {/* Tetap ada di DOM saat pratinjau agar ikut terkirim. */}
        <textarea
          id="content"
          name="content"
          rows={16}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className={`${inputCls} h-auto py-2 leading-relaxed ${tab === "preview" ? "hidden" : ""}`}
        />
        {tab === "preview" && (
          <div className="min-h-64 rounded-sm border border-border bg-[var(--s-bg,transparent)] p-5">
            {content.trim() ? <PostBody text={content} /> : <p className="text-sm text-muted-foreground">Belum ada isi.</p>}
          </div>
        )}
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer">Cara memformat</summary>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            <li>Pisahkan paragraf dengan satu baris kosong.</li>
            <li><code>## Judul bagian</code> dan <code>### Sub-judul</code></li>
            <li><code>- butir</code> untuk daftar, <code>1. langkah</code> untuk daftar bernomor, <code>&gt; kutipan</code></li>
            <li><code>**tebal**</code>, <code>*miring*</code>, <code>[teks tautan](https://alamat)</code></li>
          </ul>
        </details>
        <Err list={fe.content} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="thumbnail" className="text-sm font-medium">Gambar sampul (PNG/JPG/WebP, maks. 3 MB)</label>
        {post?.thumbnailUrl && (
          <div className="mb-2 space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.thumbnailUrl} alt="Sampul saat ini" className="h-32 rounded-sm border border-border object-cover" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="removeThumbnail" className="size-4" /> Hapus gambar sampul
            </label>
          </div>
        )}
        <input
          id="thumbnail"
          name="thumbnail"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="block w-full text-sm file:mr-3 file:h-10 file:rounded-sm file:border-0 file:bg-muted file:px-4 file:text-sm hover:file:bg-border"
        />
        <Err list={fe.thumbnail} />
      </div>

      {state.error && (
        <p role="alert" className="rounded-sm bg-[var(--state-danger-bg)] px-3 py-2 text-sm text-[var(--state-danger-fg)]">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={btnPrimary}>
        {pending ? "Menyimpan…" : post ? "Simpan perubahan" : "Simpan tulisan"}
      </button>
    </form>
  );
}
