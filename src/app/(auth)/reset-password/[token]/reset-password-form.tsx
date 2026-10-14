"use client";

import Link from "next/link";
import { AlertCircle, Check } from "lucide-react";
import { useActionState, useRef, useState } from "react";
import { resetPasswordAction } from "@/actions/password-reset";
import { Field } from "@/components/auth/field";
import { SubmitButton } from "@/components/submit-button";
import { useFocusFirstInvalid } from "@/components/ux/use-form-feedback";
import { alertErr, btnPrimary, linkCls } from "@/lib/ui";
import type { FormState } from "@/types/forms";

const RULES = [
  { label: "Minimal 8 karakter", test: (v: string) => v.length >= 8 },
  { label: "Ada huruf kapital", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Ada angka", test: (v: string) => /\d/.test(v) },
];

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState<FormState, FormData>(resetPasswordAction, {});
  const form = useRef<HTMLFormElement>(null);
  const [pw, setPw] = useState("");
  useFocusFirstInvalid(state, form);

  if (state.success) {
    return (
      <div className="space-y-5">
        <div className="flex items-start gap-3 border border-l-4 border-[var(--border-default)] border-l-[var(--emerald)] p-4">
          <Check className="mt-0.5 size-5 shrink-0 text-[var(--state-success-fg)]" aria-hidden />
          <div>
            <h1 className="text-lg font-semibold text-foreground">Password berhasil diganti</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sekarang masuk dengan password baru.
            </p>
          </div>
        </div>
        <Link href="/login" className={`${btnPrimary} w-full`}>
          Ke halaman masuk
        </Link>
      </div>
    );
  }

  const fe = state.fieldErrors ?? {};

  return (
    <form ref={form} action={action} className="space-y-5">
      <div className="space-y-1">
        <h1 className="s-display s-title text-3xl text-[var(--s-head)]">Password baru</h1>
        <p className="text-sm text-muted-foreground">
          Buat password baru untuk akunmu. Setelah tersimpan, kamu bisa langsung masuk.
        </p>
      </div>

      <input type="hidden" name="token" value={token} />

      <div className="space-y-2">
        <Field
          label="Password baru"
          name="password"
          type="password"
          autoComplete="new-password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          errors={fe.password}
          autoFocus
          required
        />
        <ul className="space-y-1" aria-label="Syarat password">
          {RULES.map((r) => {
            const ok = r.test(pw);
            return (
              <li
                key={r.label}
                className={`flex items-center gap-2 text-[13px] transition-colors ${ok ? "text-[var(--state-success-fg)]" : "text-muted-foreground"}`}
              >
                {ok ? <Check className="size-3.5" aria-hidden /> : <span className="size-3.5" aria-hidden />}
                <span>{r.label}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <Field
        label="Ulangi password baru"
        name="confirm"
        type="password"
        autoComplete="new-password"
        errors={fe.confirm}
        required
      />

      {state.error && (
        <p role="alert" className={alertErr}>
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden /> {state.error}
        </p>
      )}

      <SubmitButton pendingLabel="Menyimpan…" className={`${btnPrimary} w-full`}>
        Simpan password baru
      </SubmitButton>

      <p className="text-center text-sm text-muted-foreground">
        Ingat password?{" "}
        <Link href="/login" className={linkCls}>
          Kembali ke masuk
        </Link>
      </p>
    </form>
  );
}
