"use client";

import { useActionState, useRef, useState } from "react";
import { Copy, Dices } from "lucide-react";
import { createMemberAction } from "@/actions/member-create";
import { Field } from "@/components/auth/field";
import { MEMBER_STATUS_OPTIONS, PERMISSION_OPTIONS, ROLE_OPTIONS } from "@/lib/permissions-meta";
import { btnGhost, cardCls, inputCls } from "@/lib/ui";
import { SubmitButton } from "@/components/submit-button";
import { useFocusFirstInvalid, useKeepFormValues } from "@/components/ux/use-form-feedback";
import type { FormState } from "@/types/forms";

function generatePassword() {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const digit = "23456789";
  const all = upper + lower + digit;
  const r = new Uint32Array(10);
  crypto.getRandomValues(r);
  const body = Array.from(r.slice(0, 8), (n) => all[n % all.length]).join("");
  return `${upper[r[8] % upper.length]}${body}${digit[r[9] % digit.length]}`;
}

export function NewMemberForm({ divisions, thisYear }: { divisions: { id: number; name: string }[]; thisYear: number }) {
  const [state, action] = useActionState<FormState, FormData>(createMemberAction, {});
  const formRef = useRef<HTMLFormElement>(null);
  useKeepFormValues(formRef, state);
  useFocusFirstInvalid(state, formRef);
  const [pw, setPw] = useState("");
  const [copied, setCopied] = useState(false);
  const fe = state.fieldErrors ?? {};

  return (
    <form ref={formRef} action={action} className="space-y-6">
      <section className={`${cardCls} space-y-4 p-5`}>
        <h2 className="text-lg font-semibold text-[var(--s-head)]">Profil</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama lengkap" name="fullName" errors={fe.fullName} required />
          <Field label="NPM" name="nim" inputMode="numeric" errors={fe.nim} required />
          <Field label="Email" name="email" type="email" errors={fe.email} required />
          <Field label="No. HP (opsional)" name="phoneNumber" type="tel" errors={fe.phoneNumber} />
          <Field label="Angkatan" name="batchYear" type="number" defaultValue={thisYear} errors={fe.batchYear} required />
        </div>
      </section>

      <section className={`${cardCls} space-y-3 p-5`}>
        <div>
          <h2 className="text-lg font-semibold text-[var(--s-head)]">Password sementara</h2>
          <p className="text-sm text-muted-foreground">
            Sampaikan ke anggota setelah akun dibuat. Password tidak bisa dilihat lagi setelah disimpan, hanya bisa direset.
          </p>
        </div>
        <div className="flex max-w-md items-start gap-2">
          <div className="flex-1">
            <Field
              label="Password"
              name="password"
              type="text"
              autoComplete="off"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              hint="Min. 8 karakter, ada huruf kapital dan angka."
              errors={fe.password}
              required
            />
          </div>
          <div className="mt-[26px] flex gap-1">
            <button type="button" className={`${btnGhost} h-10 border border-border`} title="Buat otomatis"
              onClick={() => { setPw(generatePassword()); setCopied(false); }}>
              <Dices className="size-4" />
            </button>
            <button type="button" className={`${btnGhost} h-10 border border-border`} title="Salin" disabled={!pw}
              onClick={async () => { await navigator.clipboard.writeText(pw); setCopied(true); }}>
              <Copy className="size-4" />
            </button>
          </div>
        </div>
        {copied && <p className="text-xs text-[var(--emerald)]">Password disalin.</p>}
      </section>

      <section className={`${cardCls} space-y-4 p-5`}>
        <h2 className="text-lg font-semibold text-[var(--s-head)]">Keanggotaan</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="memberStatus" className="text-sm font-medium">Status anggota</label>
            <select id="memberStatus" name="memberStatus" defaultValue="ACTIVE" className={inputCls}>
              {MEMBER_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="divisionId" className="text-sm font-medium">Divisi</label>
            <select id="divisionId" name="divisionId" defaultValue="" className={inputCls}>
              <option value="">— Belum ada —</option>
              {divisions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <Field label="Departemen / jabatan" name="department" errors={fe.department} />
        </div>
      </section>

      <section className={`${cardCls} space-y-4 p-5`}>
        <h2 className="text-lg font-semibold text-[var(--s-head)]">Akses</h2>
        <div className="max-w-sm space-y-1.5">
          <label htmlFor="roleName" className="text-sm font-medium">Peran</label>
          <select id="roleName" name="roleName" defaultValue="MEMBER" className={inputCls}>
            {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Izin tambahan</legend>
          <p className="text-xs text-muted-foreground">Untuk peran Pengurus. Super Admin otomatis punya semua izin.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {PERMISSION_OPTIONS.map((p) => (
              <label key={p.code} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="perms" value={p.code} className="size-4 accent-[var(--gold)]" />
                {p.label}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {state.error && (
        <p role="alert" className="rounded-sm bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      <SubmitButton pendingLabel="Membuat…">Tambah anggota</SubmitButton>
    </form>
  );
}
