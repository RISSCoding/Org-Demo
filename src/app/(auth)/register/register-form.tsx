"use client";

import Link from "next/link";
import { AlertCircle, Check, Circle } from "lucide-react";
import { useActionState, useRef, useState } from "react";
import { registerAction } from "@/actions/register";
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

export function RegisterForm() {
  const [state, action] = useActionState<FormState, FormData>(registerAction, {});
  const form = useRef<HTMLFormElement>(null);
  const [pw, setPw] = useState("");
  const fe = state.fieldErrors ?? {};
  useFocusFirstInvalid(state, form);

  if (state.success) {
    return (
      <div className="ux-enter space-y-5" role="status">
        <svg viewBox="0 0 56 56" className="ux-check size-14 text-[var(--emerald)]" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="28" cy="28" r="25" />
          <path d="M17 29l8 8 14-17" />
        </svg>
        <h1 className="s-display text-3xl text-[var(--s-head)]">Pendaftaran terkirim</h1>
        <p className="text-sm">{state.success}</p>
        <ol className="space-y-3 border-l-2 border-[#ffa500] pl-4 text-sm">
          <li><strong>Sekarang:</strong> pengurus memeriksa data NPM-mu.</li>
          <li><strong>Setelah disetujui:</strong> kamu bisa masuk dan KTA digitalmu tersedia.</li>
        </ol>
        <Link href="/login" className={`${btnPrimary} w-full`}>
          Ke halaman masuk
        </Link>
      </div>
    );
  }

  return (
    <form ref={form} action={action} className="space-y-4">
      <div className="space-y-1">
        <h1 className="s-display s-title text-3xl text-[var(--s-head)]">Daftar anggota</h1>
        <p className="text-sm text-muted-foreground">Akun aktif setelah disetujui pengurus. Isi data sesuai kartu mahasiswa.</p>
      </div>
      <Field label="NPM" name="nim" inputMode="numeric" autoComplete="off" hint="Hanya angka, sesuai kartu mahasiswa." autoFocus errors={fe.nim} required />
      <Field label="Nama lengkap" name="fullName" autoComplete="name" errors={fe.fullName} required />
      <Field label="Email" name="email" type="email" autoComplete="email" errors={fe.email} required />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Angkatan" name="batchYear" type="number" inputMode="numeric" placeholder="2024" errors={fe.batchYear} required />
        <Field label="No. HP (opsional)" name="phoneNumber" type="tel" autoComplete="tel" errors={fe.phoneNumber} />
      </div>
      <div className="space-y-2">
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          errors={fe.password}
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          required
        />
        <ul className="space-y-1" aria-label="Syarat password">
          {RULES.map((r) => {
            const ok = r.test(pw);
            return (
              <li key={r.label} className={`flex items-center gap-2 text-[13px] transition-colors duration-200 ${ok ? "text-[var(--emerald)]" : "text-muted-foreground"}`}>
                {ok ? <Check className="ux-pop size-3.5" aria-hidden /> : <Circle className="size-3.5" aria-hidden />}
                <span>{r.label}</span>
                <span className="sr-only">{ok ? "terpenuhi" : "belum terpenuhi"}</span>
              </li>
            );
          })}
        </ul>
      </div>
      {state.error && (
        <p role="alert" className={alertErr}>
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden /> {state.error}
        </p>
      )}
      <SubmitButton pendingLabel="Mengirim pendaftaran…" className={`${btnPrimary} w-full`}>
        Kirim pendaftaran
      </SubmitButton>
      <p className="text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <Link href="/login" className={linkCls}>
          Masuk
        </Link>
      </p>
    </form>
  );
}
