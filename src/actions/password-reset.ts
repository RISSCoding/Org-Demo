"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { renderPasswordResetEmail } from "@/lib/email-templates";
import { createResetToken, markTokenUsed, verifyResetToken } from "@/lib/password-reset";
import type { FormState } from "@/types/forms";

const TOKEN_TTL_MINUTES = 30;

const emailSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email tidak valid"),
});

const resetSchema = z
  .object({
    token: z.string().min(10),
    password: z
      .string()
      .min(8, "Minimal 8 karakter")
      .max(72, "Maksimal 72 karakter")
      .regex(/[A-Z]/, "Harus ada huruf kapital")
      .regex(/\d/, "Harus ada angka"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "Konfirmasi tidak sama",
  });

/**
 * Minta reset password. Selalu balas sukses meski email tidak terdaftar
 * (anti-enumeration). Rate limit per email + per IP.
 */
export async function requestPasswordResetAction(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = emailSchema.safeParse({ email: fd.get("email") });
  if (!parsed.success) {
    return { error: "Periksa kembali isian.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const email = parsed.data.email;

  // Rate limit: 3/jam per email.
  const rlEmail = await rateLimit(`pwreset:email:${email}`, 3, 60 * 60);
  if (rlEmail.limited) {
    return {
      error: `Terlalu banyak permintaan untuk email ini. Coba lagi dalam ${Math.ceil(rlEmail.retryAfterSec / 60)} menit.`,
    };
  }

  // Rate limit: 10/jam per IP.
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "unknown";
  const rlIp = await rateLimit(`pwreset:ip:${ip}`, 10, 60 * 60);
  if (rlIp.limited) {
    return { error: "Terlalu banyak permintaan. Coba lagi nanti." };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, fullName: true, approvalStatus: true },
  });

  // Kalau user tidak ada atau belum approved, tetap balas sukses.
  // Log ke console untuk investigasi (tidak disimpan ke DB).
  if (!user || user.approvalStatus !== "APPROVED") {
    console.warn(`[pwreset] permintaan untuk email tidak valid: ${email}`);
    return { success: "Kalau emailmu terdaftar, kami sudah mengirim tautan reset. Cek inbox (dan folder spam)." };
  }

  // Generate token + URL
  const { token } = await createResetToken(user.id, ip);
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const resetUrl = `${proto}://${host}/reset-password/${token}`;

  // Kirim email langsung (bukan queue — user sedang menunggu).
  try {
    const { html, text, subject } = renderPasswordResetEmail({
      recipientName: user.fullName,
      resetUrl,
      expiresMinutes: TOKEN_TTL_MINUTES,
      appUrl: `${proto}://${host}`,
    });
    await sendEmail({ to: email, subject, html, text });
    await prisma.auditLog.create({
      data: { userId: user.id, action: "PASSWORD_RESET_REQUEST", entity: "users", entityId: user.id },
    });
  } catch (e) {
    console.error("[pwreset] gagal kirim email:", e);
    // Tetap balas sukses supaya tidak membocorkan status user.
  }

  return { success: "Kalau emailmu terdaftar, kami sudah mengirim tautan reset. Cek inbox (dan folder spam)." };
}

/** Reset password dengan token. */
export async function resetPasswordAction(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = resetSchema.safeParse({
    token: fd.get("token"),
    password: fd.get("password"),
    confirm: fd.get("confirm"),
  });
  if (!parsed.success) {
    return { error: "Periksa kembali isian.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { token, password } = parsed.data;

  const verify = await verifyResetToken(token);
  if (!verify.ok) {
    const msg =
      verify.reason === "expired"
        ? "Tautan reset sudah kadaluarsa. Minta tautan baru."
        : verify.reason === "used"
          ? "Tautan reset sudah pernah dipakai. Minta tautan baru."
          : "Tautan reset tidak valid. Periksa kembali atau minta tautan baru.";
    return { error: msg };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: verify.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: verify.tokenId },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { userId: verify.userId, NOT: { id: verify.tokenId } },
    }),
    prisma.auditLog.create({
      data: { userId: verify.userId, action: "PASSWORD_RESET_SUCCESS", entity: "users", entityId: verify.userId },
    }),
  ]);

  return { success: "Password berhasil diganti. Silakan masuk dengan password baru." };
}
