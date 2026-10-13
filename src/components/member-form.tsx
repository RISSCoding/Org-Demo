"use client";

import { useActionState, useRef } from "react";
import { resetPasswordAction, updateMemberAction } from "@/actions/member-admin";
import { Field } from "@/components/auth/field";
import {
  APPROVAL_OPTIONS, MEMBER_STATUS_OPTIONS, PERMISSION_OPTIONS, ROLE_OPTIONS,
} from "@/lib/permissions-meta";
import { cardCls, inputCls } from "@/lib/ui";
import { SubmitButton } from "@/components/submit-button";
import { useFocusFirstInvalid, useKeepFormValues } from "@/components/ux/use-form-feedback";
import type { FormState } from "@/types/forms";

export type MemberFormValues = {
  id: string;
  fullName: string;
  email: string;
  nim: string;
  phoneNumber: string;
  batchYear: number;
  roleName: string;
  approvalStatus: string;
  memberStatus: string;
  divisionId: number | null;
  department: string;
  perms: string[];
  isSelf: boolean;
  hasMember: boolean;
};

function Msg({ state }: { state: FormState }) {
  return (
    <>
      {state.error && (
        <p role="alert" className="rounded-sm bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      {state.success && (
        <p role="status" className="rounded-sm bg-[var(--emerald)]/10 px-3 py-2 text-sm text-[var(--emerald)]">{state.success}</p>
      )}
    </>
  );
}

function Select({
  label, name, defaultValue, options, disabled,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: readonly { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium">{label}</label>
      <select id={name} name={disabled ? undefined : name} defaultValue={defaultValue} disabled={disabled} className={inputCls}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {disabled && <input type="hidden" name={name} value={defaultValue} />}
    </div>
  );
}

export function MemberForm({ m, divisions }: { m: MemberFormValues; divisions: { id: number; name: string }[] }) {
  const [state, action] = useActionState<FormState, FormData>(updateMemberAction, {});
  const formRef = useRef<HTMLFormElement>(null);
  useKeepFormValues(formRef, state);
  useFocusFirstInvalid(state, formRef);
  const fe = state.fieldErrors ?? {};

  return (
    <form ref={formRef} action={action} className="space-y-6">
      <input type="hidden" name="id" value={m.id} />

      <section className={`${cardCls} space-y-4 p-5`}>
        <h2 className="text-lg font-semibold text-[var(--s-head)]">Profil</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama lengkap" name="fullName" defaultValue={m.fullName} errors={fe.fullName} required />
          <Field label="NPM" name="nim" defaultValue={m.nim} inputMode="numeric" errors={fe.nim} required
            hint="Mengubah NPM juga mengubah isi QR KTA." />
          <Field label="Email" name="email" type="email" defaultValue={m.email} errors={fe.email} required />
          <Field label="No. HP" name="phoneNumber" type="tel" defaultValue={m.phoneNumber} errors={fe.phoneNumber} />
          <Field label="Angkatan" name="batchYear" type="number" defaultValue={m.batchYear} errors={fe.batchYear} required />
        </div>
      </section>

      <section className={`${cardCls} space-y-4 p-5`}>
        <h2 className="text-lg font-semibold text-[var(--s-head)]">Keanggotaan</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Status anggota" name="memberStatus" defaultValue={m.memberStatus} options={MEMBER_STATUS_OPTIONS} />
          <div className="space-y-1.5">
            <label htmlFor="divisionId" className="text-sm font-medium">Divisi</label>
            <select id="divisionId" name="divisionId" defaultValue={m.divisionId ?? ""} className={inputCls}>
              <option value="">— Belum ada —</option>
              {divisions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <Field label="Departemen / jabatan" name="department" defaultValue={m.department} errors={fe.department} />
        </div>
        {!m.hasMember && (
          <p className="text-xs text-muted-foreground">
            Akun ini belum punya data keanggotaan. Data dan nomor KTA dibuat otomatis saat status persetujuan “Disetujui”.
          </p>
        )}
      </section>

      <section className={`${cardCls} space-y-4 p-5`}>
        <h2 className="text-lg font-semibold text-[var(--s-head)]">Akses &amp; persetujuan</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Peran" name="roleName" defaultValue={m.roleName} options={ROLE_OPTIONS} disabled={m.isSelf} />
          <Select label="Status persetujuan" name="approvalStatus" defaultValue={m.approvalStatus} options={APPROVAL_OPTIONS} disabled={m.isSelf} />
        </div>
        {m.isSelf && (
          <p className="text-xs text-muted-foreground">Peran dan persetujuan akunmu sendiri dikunci agar tidak terkunci dari sistem.</p>
        )}

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Izin tambahan</legend>
          <p className="text-xs text-muted-foreground">
            Berlaku untuk peran Pengurus. Super Admin otomatis punya semua izin.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {PERMISSION_OPTIONS.map((p) => (
              <label key={p.code} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="perms" value={p.code} defaultChecked={m.perms.includes(p.code)} className="size-4 accent-[var(--gold)]" />
                {p.label}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <Msg state={state} />
      <SubmitButton pendingLabel="Menyimpan…">Simpan perubahan</SubmitButton>
    </form>
  );
}

export function ResetPasswordForm({ id }: { id: string }) {
  const [state, action] = useActionState<FormState, FormData>(resetPasswordAction, {});
  const fe = state.fieldErrors ?? {};
  return (
    <form action={action} className={`${cardCls} space-y-4 p-5`}>
      <div>
        <h2 className="text-lg font-semibold text-[var(--s-head)]">Reset password</h2>
        <p className="text-sm text-muted-foreground">Isi password baru lalu sampaikan ke anggota. Password lama langsung tidak berlaku.</p>
      </div>
      <input type="hidden" name="id" value={id} />
      <div className="max-w-sm">
        <Field label="Password baru" name="password" type="password" autoComplete="new-password"
          hint="Min. 8 karakter, ada huruf kapital dan angka." errors={fe.password} required />
      </div>
      <Msg state={state} />
      <SubmitButton pendingLabel="Mengganti password…">Ganti password</SubmitButton>
    </form>
  );
}
