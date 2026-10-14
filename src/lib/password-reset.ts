import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

const TOKEN_TTL_MINUTES = 30;

/** Hash token dengan SHA-256. Token high-entropy, jadi tidak butuh slow hash. */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export type ResetToken = { token: string; expiresAt: Date };

/**
 * Buat token baru. Menghapus semua token lama user (satu token aktif per user).
 * Return plaintext token — hanya ini satu-satunya kesempatan melihatnya.
 */
export async function createResetToken(userId: string, ip: string | null): Promise<ResetToken> {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60_000);

  await prisma.$transaction([
    // Invalidasi semua token lama user ini (termasuk yang belum kadaluarsa).
    prisma.passwordResetToken.deleteMany({ where: { userId } }),
    prisma.passwordResetToken.create({
      data: { userId, tokenHash, expiresAt, requestedIp: ip },
    }),
  ]);

  return { token, expiresAt };
}

export type VerifyResult =
  | { ok: true; userId: string; tokenId: string }
  | { ok: false; reason: "not_found" | "expired" | "used" };

/** Verifikasi token. Belum menghapus — penghapusan di markTokenUsed. */
export async function verifyResetToken(token: string): Promise<VerifyResult> {
  const tokenHash = hashToken(token);
  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true, expiresAt: true, usedAt: true },
  });
  if (!row) return { ok: false, reason: "not_found" };
  if (row.usedAt) return { ok: false, reason: "used" };
  if (row.expiresAt < new Date()) return { ok: false, reason: "expired" };
  return { ok: true, userId: row.userId, tokenId: row.id };
}

/** Tandai token sebagai terpakai dan hapus semua token user (sekali pakai). */
export async function markTokenUsed(tokenId: string, userId: string): Promise<void> {
  await prisma.$transaction([
    prisma.passwordResetToken.update({
      where: { id: tokenId },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { userId, NOT: { id: tokenId } },
    }),
  ]);
}

/** Bersihkan token kedaluwarsa. Dipanggil dari cron housekeeping (opsional). */
export async function cleanupExpiredTokens(): Promise<number> {
  const res = await prisma.passwordResetToken.deleteMany({
    where: { expiresAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
  });
  return res.count;
}
