"use client";

import { useActionState } from "react";
import { changePasswordAction, updateProfileAction } from "@/actions/profile";
import { Field } from "@/components/auth/field";
import { btnPrimary } from "@/lib/ui";
import type { FormState } from "@/types/forms";

function Status({ state }: { state: FormState }) {
  if (state.error) return <p role="alert" className="rounded-sm bg-[var(--state-danger-bg)] px-3 py-2 text-sm text-[var(--state-danger-fg)]">{state.error}</p>;
  if (state.success) return <p role="status" className="rounded-sm bg-[var(--state-success-bg)] px-3 py-2 text-sm text-[var(--state-success-fg)]">{state.success}</p>;
  return null;
}

export function ProfileForm({ phoneNumber, avatarUrl }: { phoneNumber: string | null; avatarUrl: string | null }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateProfileAction, {});
  const fe = state.fieldErrors ?? {};
  return (
    <form action={action} className="max-w-md space-y-4">
      <div className="flex items-center gap-4">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="Foto profil" className="size-20 rounded-sm border border-border object-cover" />
        ) : (
          <div className="grid size-20 place-items-center rounded-sm border border-border bg-muted text-xs text-muted-foreground">Belum ada</div>
        )}
        <div className="space-y-1.5">
          <label htmlFor="avatar" className="text-sm font-medium">Foto profil (maks. 3 MB)</label>
          <input id="avatar" name="avatar" type="file" accept="image/png,image/jpeg,image/webp" className="block w-full text-sm file:mr-3 file:h-9 file:rounded-sm file:border-0 file:bg-muted file:px-3 file:text-sm hover:file:bg-border" />
          {fe.avatar?.map((e) => <p key={e} className="text-xs text-[var(--state-danger-fg)]">{e}</p>)}
        </div>
      </div>
      <Field label="Nomor HP" name="phoneNumber" type="tel" defaultValue={phoneNumber ?? ""} errors={fe.phoneNumber} hint="Kosongkan untuk menghapus." />
      <Status state={state} />
      <button type="submit" disabled={pending} className={btnPrimary}>{pending ? "Menyimpan…" : "Simpan profil"}</button>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(changePasswordAction, {});
  const fe = state.fieldErrors ?? {};
  return (
    <form action={action} key={state.success ? "done" : "form"} className="max-w-md space-y-4">
      <Field label="Password saat ini" name="current" type="password" autoComplete="current-password" errors={fe.current} required />
      <Field label="Password baru" name="next" type="password" autoComplete="new-password" minLength={8} errors={fe.next} required />
      <Field label="Ulangi password baru" name="confirm" type="password" autoComplete="new-password" errors={fe.confirm} required />
      <Status state={state} />
      <button type="submit" disabled={pending} className={btnPrimary}>{pending ? "Menyimpan…" : "Ganti password"}</button>
    </form>
  );
}
