import { randomUUID } from "node:crypto";
import { deleteBlob, getBlob, putBlob } from "@/lib/blob";
import { IMAGE_MIME, MAX_IMAGE_BYTES, sniffImage, UploadError } from "@/lib/storage";

type Folder = "certificates" | "proofs" | "letters";

export const MAX_PDF_BYTES = 10 * 1024 * 1024;

const contentTypeOf = (name: string) =>
  name.endsWith(".pdf") ? "application/pdf" : IMAGE_MIME[name.split(".").pop() as keyof typeof IMAGE_MIME] ?? "application/octet-stream";

/** Private files live under blob "<folder>/<name>" and are only served through authenticated routes. */
export async function writePrivate(folder: Folder, name: string, data: Buffer) {
  await putBlob(`${folder}/${name}`, data, contentTypeOf(name));
}

export async function readPrivate(folder: Folder, name: string): Promise<Buffer | null> {
  return getBlob(`${folder}/${name}`);
}

export async function deletePrivate(folder: Folder, name: string) {
  await deleteBlob(`${folder}/${name}`);
}

/** Proof-of-payment image -> "/api/proofs/<uuid>.<ext>" (auth-gated route). */
export async function saveProofImage(file: File): Promise<string> {
  if (file.size > MAX_IMAGE_BYTES) throw new UploadError("Ukuran gambar maksimal 3 MB.");
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = sniffImage(buf);
  if (!ext) throw new UploadError("Bukti harus berupa gambar PNG, JPG, atau WebP.");
  const name = `${randomUUID()}.${ext}`;
  await writePrivate("proofs", name, buf);
  return `/api/proofs/${name}`;
}

/** Letter document (PDF only, checked by magic bytes) -> "/api/letters/<uuid>.pdf" (auth-gated route). */
export async function saveLetterPdf(file: File): Promise<string> {
  if (file.size > MAX_PDF_BYTES) throw new UploadError("Ukuran dokumen maksimal 10 MB.");
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length < 5 || buf.toString("ascii", 0, 5) !== "%PDF-") throw new UploadError("Dokumen harus berupa file PDF.");
  const name = `${randomUUID()}.pdf`;
  await writePrivate("letters", name, buf);
  return `/api/letters/${name}`;
}

/** "/api/letters/<uuid>.pdf" -> "<uuid>.pdf" (null if the URL isn't one of ours). */
export const letterFileName = (url: string | null | undefined) =>
  url?.match(/^\/api\/letters\/([a-f0-9-]{36}\.pdf)$/)?.[1] ?? null;

/** "/api/proofs/<uuid>.<ext>" -> "<uuid>.<ext>" (null if the URL isn't one of ours). */
export const proofFileName = (url: string | null | undefined) =>
  url?.match(/^\/api\/proofs\/([a-f0-9-]{36}\.(?:png|jpg|webp))$/)?.[1] ?? null;
