"use client";

import { useActionState } from "react";
import { issueCommitteeCertificatesAction } from "@/actions/certificates";
import { SubmitButton } from "@/components/submit-button";
import { useFormFeedback } from "@/components/ux/use-form-feedback";
import { alertErr } from "@/lib/ui";
import type { FormState } from "@/types/forms";

/** Pembungkus formulir; baris dengan kotak centang dikirim dari server sebagai children. */
export function IssueCommitteeCertificates({ eventId, canIssue, children }: { eventId: string; canIssue: boolean; children: React.ReactNode }) {
  const [state, action] = useActionState<FormState, FormData>(issueCommitteeCertificatesAction, {});
  useFormFeedback(state);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="eventId" value={eventId} />
      {children}
      {state.error && <p role="alert" className={alertErr}>{state.error}</p>}
      <SubmitButton disabled={!canIssue} pendingLabel="Menerbitkan… jangan tutup halaman">
        Terbitkan sertifikat panitia terpilih
      </SubmitButton>
      {!canIssue && <p className="text-[13px] text-muted-foreground">Belum ada panitia yang memenuhi syarat (diterima, hadir hari-H, belum punya sertifikat).</p>}
    </form>
  );
}
