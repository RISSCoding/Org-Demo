import { randomUUID } from "node:crypto";
import { deleteBlob, putBlob } from "@/lib/blob";

export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

export class UploadError extends Error {}

export const IMAGE_MIME = { png: "image/png", jpg: "image/jpeg", webp: "image/webp" } as const;

/** Detect the real type from magic bytes — never trust file.type / file.name. */
export function sniffImage(b: Buffer): "png" | "jpg" | "webp" | null {
  if (b.length > 12 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "png";
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.length > 12 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") return "webp";
  return null;
}

/** Public images: blob "<folder>/<uuid>.<ext>" (disk atau S3, lihat blob.ts), served by /api/uploads. */
export async function saveImage(file: File, folder: "events" | "posts" | "avatars"): Promise<string> {
  if (file.size > MAX_IMAGE_BYTES) throw new UploadError("Ukuran gambar maksimal 3 MB.");
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = sniffImage(buf);
  if (!ext) throw new UploadError("Format gambar harus PNG, JPG, atau WebP.");

  const key = `${folder}/${randomUUID()}.${ext}`;
  await putBlob(key, buf, IMAGE_MIME[ext]);
  return `/api/uploads/${key}`;
}

/** "/api/uploads/<folder>/<uuid>.<ext>" -> "<folder>/<uuid>.<ext>". Null kalau URL bukan milik kita atau foldernya privat. */
export const publicImageKey = (url: string | null | undefined) =>
  url?.match(/^\/api\/uploads\/((?:events|posts|avatars)\/[a-f0-9-]{36}\.(?:png|jpg|webp))$/)?.[1] ?? null;

/** Hapus gambar publik. Aman dipanggil dengan URL eksternal, null, atau berkas yang sudah hilang; galat storage hanya dicatat. */
export async function deletePublicImage(url: string | null | undefined): Promise<void> {
  const key = publicImageKey(url);
  if (!key) return;
  try {
    await deleteBlob(key);
  } catch (e) {
    console.error(`Gagal menghapus ${key}:`, e);
  }
}
