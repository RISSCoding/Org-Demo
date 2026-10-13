"use client";

import type { FeedbackStatus } from "@prisma/client";
import { useActionState, useRef } from "react";
import { updateFeedbackAction } from "@/actions/feedback-admin";
import { FEEDBACK_STATUSES, STATUS_LABEL } from "@/lib/feedback";
import { inputCls } from "@/lib/ui";
import { SubmitButton } from "@/components/submit-button";
import { useFocusFirstInvalid, useKeepFormValues } from "@/components/ux/use-form-feedback";
import type { FormState } from "@/types/forms";

export function FeedbackAdminForm({
  id,
  status,
  response,
}: {
  id: string;
  status: FeedbackStatus;
  response: string | null;
}) {
  const [state, action] = useActionState<FormState, FormData>(updateFeedbackAction, {});
  const formRef = useRef<HTMLFormElement>(null);
  useKeepFormValues(formRef, state);
  useFocusFirstInvalid(state, formRef);
  const fe = state.fieldErrors ?? {};

  return (
    <form ref={formRef} action={action} className="space-y-5">
      <input type="hidden" name="id" value={id} />

      <div className="space-y-1.5">
        <label htmlFor="status" className="text-sm font-medium">Status</label>
        <select id="status" name="status" defaultValue={status} className={`${inputCls} sm:w-60`}>
          {FEEDBACK_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
        {fe.status?.map((e) => <p key={e} className="text-xs text-red-600 dark:text-red-400">{e}</p>)}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="response" className="text-sm font-medium">Tanggapan untuk pengirim</label>
        <textarea
          id="response"
          name="response"
          rows={6}
          maxLength={2000}
          defaultValue={response ?? ""}
          className={`${inputCls} h-auto py-2`}
          aria-describedby="response-hint"
        />
        <p id="response-hint" className="text-xs text-muted-foreground">
          Tanggapan terbaca oleh siapa pun yang memegang kode pelacakan. Jangan menulis nama atau data pribadi.
          Kosongkan bila belum ada tanggapan.
        </p>
        {fe.response?.map((e) => <p key={e} className="text-xs text-red-600 dark:text-red-400">{e}</p>)}
      </div>

      {state.error && (
        <p role="alert" className="rounded-sm bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      {state.success && (
        <p role="status" className="rounded-sm bg-[var(--emerald)]/15 px-3 py-2 text-sm text-[var(--emerald)]">{state.success}</p>
      )}
      <SubmitButton pendingLabel="Menyimpan…">Simpan perubahan</SubmitButton>
    </form>
  );
}
