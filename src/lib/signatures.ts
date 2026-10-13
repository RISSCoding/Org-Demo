import { deletePrivate, readPrivate, signatureFileName } from "@/lib/private-files";

export type SignatureImage = { data: Buffer; format: "png" | "jpg" };

/** Isi gambar tanda tangan untuk disematkan ke PDF. null bila URL bukan milik kita atau berkasnya sudah hilang. */
export async function loadSignature(url: string | null | undefined): Promise<SignatureImage | null> {
  const name = signatureFileName(url);
  if (!name) return null;
  const data = await readPrivate("signatures", name);
  return data ? { data, format: name.endsWith(".png") ? "png" : "jpg" } : null;
}

/** Hapus berkas tanda tangan lama setelah baris database diperbarui. Galat storage hanya dicatat: berkas yatim tidak boleh menggagalkan aksi. */
export async function discardSignature(url: string | null | undefined): Promise<void> {
  const name = signatureFileName(url);
  if (!name) return;
  try {
    await deletePrivate("signatures", name);
  } catch (e) {
    console.error(`Gagal menghapus tanda tangan ${name}:`, e);
  }
}
