"use client";

import { useActionState } from "react";
import { generateDuesAction } from "@/actions/finance";
import { monthLabel } from "@/lib/finance";
import { SubmitButton } from "@/components/submit-button";
import { useFormFeedback } from "@/components/ux/use-form-feedback";
import { alertErr, inputCls } from "@/lib/ui";
import type { FormState } from "@/types/forms";

export function GenerateDuesForm({
  months,
  defaultMonth,
  defaultAmount,
}: {
  months: string[];
  defaultMonth: string;
  defaultAmount: number;
}) {
  const [state, action] = useActionState<FormState, FormData>(generateDuesAction, {});
  const fe = state.fieldErrors ?? {};
  useFormFeedback(state);
  return (
    <form action={action} className="space-y-2">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <label htmlFor="g-month" className="text-sm font-medium">Bulan</label>
          <select id="g-month" name="month" defaultValue={defaultMonth} className={`${inputCls} w-44`}>
            {months.map((m) => (
              <option key={m} value={m}>{monthLabel(m)}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="g-amount" className="text-sm font-medium">Nominal per anggota (Rp)</label>
          <input id="g-amount" name="amount" type="number" min={1000} step={500} defaultValue={defaultAmount} className={`${inputCls} w-44`} />
        </div>
        <SubmitButton pendingLabel="Membuat tagihan…">Buat tagihan</SubmitButton>
      </div>
      {fe.amount?.map((e) => <p key={e} className="text-xs text-[var(--state-danger-fg)]">{e}</p>)}
      {state.success && <p className="text-sm text-[var(--emerald)]">{state.success}</p>}
      {state.error && <p role="alert" className={alertErr}>{state.error}</p>}
    </form>
  );
}
