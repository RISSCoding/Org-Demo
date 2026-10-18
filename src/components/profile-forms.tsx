"use client";

import { AlertCircle, Camera, LockKeyhole } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { updateProfileAction, changePasswordAction } from "@/actions/profile";
import { SubmitButton } from "@/components/submit-button";
import { Field } from "@/components/ui/field";
import { alertErr, alertOk, btnPrimary, inputCls } from "@/lib/ui";
import type { FormState } from "@/types/forms";

// ==========================================
// 1. FORM DATA DIRI & FOTO
// ==========================================
export function ProfileForm({
  email,
  phoneNumber,
  avatarUrl,
}: {
  email: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
}) {
  const [state, action] = useActionState<FormState, FormData>(updateProfileAction, {});
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <form action={action} className="space-y-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        {/* Avatar */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group relative flex size-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[var(--border-strong)] bg-[var(--surface-2)] transition-colors hover:border-[var(--gold-text)] focus-visible:outline-2 focus-visible:outline-offset-2"
            aria-label="Ubah foto profil"
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="size-full object-cover" />
            ) : (
              <Camera className="size-8 text-muted-foreground transition-colors group-hover:text-[var(--gold-text)]" aria-hidden />
            )}
            <div className="absolute inset-0 grid place-items-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="text-xs font-medium text-white">Ubah Foto</span>
            </div>
          </button>
          <input
            ref={fileRef}
            type="file"
            name="avatar"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          <p className="mt-2 text-center text-[10px] text-muted-foreground uppercase tracking-wider">Max 3 MB</p>
        </div>

        {/* Fields */}
        <div className="flex-1 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className={`${inputCls} bg-[var(--surface-2)] text-muted-foreground`}
              />
              <p className="text-[11px] text-muted-foreground">Hubungi admin untuk mengubah email.</p>
            </div>
            <Field
              label="Nomor HP"
              htmlFor="phoneNumber"
              hint="Format: 08xx, 628xx, atau +628xx."
              errors={state.fieldErrors?.phoneNumber}
            >
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                defaultValue={phoneNumber ?? ""}
                placeholder="081234567890"
                className={inputCls}
                autoComplete="tel"
              />
            </Field>
          </div>
        </div>
      </div>

      {state.error && <p role="alert" className={alertErr}><AlertCircle className="mt-0.5 size-4 shrink-0" /> {state.error}</p>}
      {state.success && <p role="status" className={alertOk}>Profil berhasil disimpan.</p>}

      <div className="flex justify-end pt-2">
        <SubmitButton pendingLabel="Menyimpan…" className={btnPrimary}>
          Simpan Profil
        </SubmitButton>
      </div>
    </form>
  );
}

// ==========================================
// 2. FORM GANTI PASSWORD
// ==========================================
export function PasswordForm() {
  const [state, action] = useActionState<FormState, FormData>(changePasswordAction, {});

  return (
    <form action={action} className="max-w-md space-y-4">
      <Field
        label="Password Saat Ini"
        htmlFor="current"
        errors={state.fieldErrors?.current}
        required
      >
        <input
          id="current"
          name="current"
          type="password"
          autoComplete="current-password"
          className={inputCls}
          required
        />
      </Field>

      <Field
        label="Password Baru"
        htmlFor="next"
        hint="Minimal 8 karakter, ada huruf kapital dan angka."
        errors={state.fieldErrors?.next}
        required
      >
        <input
          id="next"
          name="next"
          type="password"
          autoComplete="new-password"
          className={inputCls}
          required
        />
      </Field>

      <Field
        label="Ulangi Password Baru"
        htmlFor="confirm"
        errors={state.fieldErrors?.confirm}
        required
      >
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          className={inputCls}
          required
        />
      </Field>

      {state.error && <p role="alert" className={alertErr}><AlertCircle className="mt-0.5 size-4 shrink-0" /> {state.error}</p>}
      {state.success && <p role="status" className={alertOk}>Password berhasil diganti.</p>}

      <div className="pt-2">
        <SubmitButton pendingLabel="Mengganti…" className={btnPrimary}>
          <LockKeyhole className="size-4 mr-2" /> Ganti Password
        </SubmitButton>
      </div>
    </form>
  );
}
