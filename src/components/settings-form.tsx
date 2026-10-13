"use client";

import { useActionState } from "react";
import { saveDuesAmountAction } from "@/actions/settings";
import { Field } from "@/components/auth/field";
import { btnPrimary } from "@/lib/ui";
import type { FormState } from "@/types/forms";

export function DuesAmountForm({ amount }: { amount: number }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveDuesAmountAction, {});
  return (
    <form action={action} className="max-w-sm space-y-4">
      <Field label="Iuran kas per bulan (Rp)" name="amount" type="number" min={1000} step={500} defaultValue={amount} errors={state.fieldErrors?.amount} required />
      {state.error && <p role="alert" className="rounded-sm bg-[var(--state-danger-bg)] px-3 py-2 text-sm text-[var(--state-danger-fg)]">{state.error}</p>}
      {state.success && <p role="status" className="rounded-sm bg-[var(--state-success-bg)] px-3 py-2 text-sm text-[var(--state-success-fg)]">{state.success}</p>}
      <button type="submit" disabled={pending} className={btnPrimary}>{pending ? "Menyimpan…" : "Simpan"}</button>
    </form>
  );
}
