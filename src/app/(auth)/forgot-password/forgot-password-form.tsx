"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft, Check } from "lucide-react";
import { useActionState } from "react";
import { requestPasswordResetAction } from "@/actions/password-reset";
import { Field } from "@/components/auth/field";
import { SubmitButton } from "@/components/submit-button";
import { alertErr, btnPrimary, linkCls } from "@/lib/ui";
import type { FormState } from "@/types/forms";

export function ForgotPasswordForm() {
  const [state, action] = useActionState<FormState, FormData>(requestPasswordResetAction, {});

  return (
    <form action={action} className="space-y-5">
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden /> Kembali ke masuk
      </Link>

      <div className="space-y-1">
        <h1 className="s-display s-title text-3xl text-[var(--s-head)]">Lupa password</h1>
        <p className="text-sm text-muted-foreground">
          Masukkan email yang kamu daftarkan. Kami akan kirim tautan untuk membuat password baru.
        </p>
      </div>

      {state.success ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-md border border-[var(--state-success-border)] bg-[var(--state-success-bg)] px-3 py-3 text-sm text-[var(--state-success-fg)]">
            <Check className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>{state.success}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Tidak menerima email? Cek folder spam, atau{" "}
            <Link href="/forgot-password" className={linkCls}>
              coba lagi
            </Link>
            .
          </p>
        </div>
      ) : (
        <>
          <Field label="Email" name="email" type="email" autoComplete="email" autoFocus required />
          {state.error && (
            <p role="alert" className={alertErr}>
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden /> {state.error}
            </p>
          )}
          <SubmitButton pendingLabel="Mengirim…" className={`${btnPrimary} w-full`}>
            Kirim tautan reset
          </SubmitButton>
        </>
      )}
    </form>
  );
}
