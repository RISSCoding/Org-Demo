"use client";

import Link from "next/link";
import { AlertCircle, Info } from "lucide-react";
import { useActionState } from "react";
import { loginAction } from "@/actions/login";
import { Field } from "@/components/auth/field";
import { SubmitButton } from "@/components/submit-button";
import { alertErr, btnPrimary, linkCls } from "@/lib/ui";
import type { FormState } from "@/types/forms";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, action] = useActionState<FormState, FormData>(loginAction, {});
  return (
    <form action={action} className="space-y-5">
      <div className="space-y-1">
        <h1 className="s-display s-title text-3xl text-[var(--s-head)]">Masuk</h1>
        <p className="text-sm text-muted-foreground">Masuk ke portal anggota HIMMAN UKRI dengan NPM atau email yang kamu daftarkan.</p>
      </div>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <Field label="NPM atau email" name="identifier" autoComplete="username" autoFocus required />
      <Field label="Password" name="password" type="password" autoComplete="current-password" required />
      {state.error && (
        <p role="alert" className={alertErr}>
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden /> {state.error}
        </p>
      )}
      <SubmitButton pendingLabel="Memeriksa…" className={`${btnPrimary} w-full`}>
        Masuk
      </SubmitButton>
      <p className="flex gap-2 rounded-sm bg-muted px-3 py-2 text-[13px] leading-snug text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>Akun baru baru bisa dipakai setelah pengurus menyetujui pendaftaranmu.</span>
      </p>
      <p className="text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <Link href="/register" className={linkCls}>
          Daftar jadi anggota
        </Link>
      </p>
    </form>
  );
}
