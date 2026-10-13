"use client";

import { useActionState, useRef } from "react";
import { addTransactionAction } from "@/actions/finance";
import { Field, FieldError } from "@/components/auth/field";
import { FileDrop } from "@/components/file-drop";
import { SubmitButton } from "@/components/submit-button";
import { useFocusFirstInvalid, useKeepFormValues } from "@/components/ux/use-form-feedback";
import { CATEGORY_LABEL } from "@/lib/finance";
import { alertErr, inputCls } from "@/lib/ui";
import type { FormState } from "@/types/forms";

export function TxForm({ today }: { today: string }) {
  const [state, action] = useActionState<FormState, FormData>(addTransactionAction, {});
  const formRef = useRef<HTMLFormElement>(null);
  useKeepFormValues(formRef, state);
  useFocusFirstInvalid(state, formRef);
  const fe = state.fieldErrors ?? {};
  const err = (k: string) => <FieldError list={fe[k]} />;

  return (
    <form ref={formRef} action={action} className="max-w-xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="type" className="text-sm font-medium">Jenis</label>
          <select id="type" name="type" className={inputCls} defaultValue="EXPENSE">
            <option value="INCOME">Pemasukan</option>
            <option value="EXPENSE">Pengeluaran</option>
          </select>
          {err("type")}
        </div>
        <div className="space-y-1.5">
          <label htmlFor="category" className="text-sm font-medium">Kategori</label>
          <select id="category" name="category" className={inputCls} defaultValue="OPERATIONAL">
            {Object.entries(CATEGORY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          {err("category")}
        </div>
      </div>

      <Field label="Uraian" name="title" errors={fe.title} required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Jumlah (Rp)" name="amount" type="number" min={1} step={1} inputMode="numeric" errors={fe.amount} required />
        <Field label="Tanggal transaksi" name="date" type="date" defaultValue={today} errors={fe.date} required />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="note" className="text-sm font-medium">Catatan (opsional)</label>
        <textarea id="note" name="note" rows={3} className={`${inputCls} h-auto py-2`} />
        {err("note")}
      </div>

      <FileDrop
        name="proof"
        label="Bukti transaksi (opsional)"
        hint="Nota atau bukti transfer. Sangat dianjurkan, terutama untuk pengeluaran."
        errors={fe.proof}
      />

      {state.error && (
        <p role="alert" className={alertErr}>{state.error}</p>
      )}
      <SubmitButton pendingLabel="Menyimpan…">Simpan transaksi</SubmitButton>
    </form>
  );
}
