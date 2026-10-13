import type { Prisma } from "@prisma/client";

/**
 * Aturan nomor keanggotaan: 3 digit terakhir angkatan + 3 digit terakhir NPM.
 * Contoh: angkatan 2025 + NPM berakhiran 207 -> "025207".
 * (Satu-satunya tempat aturan ini ditulis; ubah di sini bila pengurus menafsirkan lain.)
 */
export function ktaBase(npm: string, batchYear: number) {
  const angkatan = String(batchYear).slice(-3);
  const tail = npm.replace(/\D/g, "").slice(-3).padStart(3, "0");
  return `${angkatan}${tail}`;
}

/** Kolom `kta_number` unik: bila nomor dasar sudah terpakai, ditambah akhiran -2, -3, … */
export async function allocateKtaNumber(
  db: Pick<Prisma.TransactionClient, "member">,
  npm: string,
  batchYear: number,
) {
  const base = ktaBase(npm, batchYear);
  for (let i = 1; i <= 20; i++) {
    const candidate = i === 1 ? base : `${base}-${i}`;
    const taken = await db.member.findUnique({ where: { ktaNumber: candidate }, select: { id: true } });
    if (!taken) return candidate;
  }
  throw new Error("Tidak bisa mengalokasikan nomor KTA unik");
}
