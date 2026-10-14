import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { verifyResetToken } from "@/lib/password-reset";
import { linkCls } from "@/lib/ui";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata = { title: "Reset password — ORG" };
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const verify = await verifyResetToken(token);

  if (!verify.ok) {
    return (
      <div className="space-y-5">
        <div className="flex items-start gap-3 border border-l-4 border-[var(--border-default)] border-l-red-600 p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[var(--state-danger-fg)]" aria-hidden />
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              {verify.reason === "expired"
                ? "Tautan sudah kadaluarsa"
                : verify.reason === "used"
                  ? "Tautan sudah pernah dipakai"
                  : "Tautan tidak valid"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {verify.reason === "expired"
                ? "Tautan reset berlaku 30 menit. Minta tautan baru di bawah ini."
                : verify.reason === "used"
                  ? "Tautan hanya bisa dipakai sekali. Minta tautan baru di bawah ini."
                  : "Periksa kembali tautan yang kamu terima, atau minta tautan baru."}
            </p>
          </div>
        </div>
        <Link href="/forgot-password" className={linkCls}>
          Minta tautan reset baru
        </Link>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}
