"use client";

import { useActionState } from "react";
import { issueCertificatesAction } from "@/actions/certificates";
import { SubmitButton } from "@/components/submit-button";
import { useFormFeedback } from "@/components/ux/use-form-feedback";
import { alertErr } from "@/lib/ui";
import type { FormState } from "@/types/forms";

export function IssueCertificatesForm({ eventId, disabled }: { eventId: string; disabled: boolean }) {
  const [state, action] = useActionState<FormState, FormData>(issueCertificatesAction, {});
  useFormFeedback(state);
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="eventId" value={eventId} />
      <SubmitButton disabled={disabled} pendingLabel="Menerbitkan… jangan tutup halaman">
        Terbitkan sertifikat
      </SubmitButton>
      {disabled && <p className="text-[13px] text-muted-foreground">Belum ada peserta hadir yang menunggu sertifikat.</p>}
      {state.error && <p role="alert" className={alertErr}>{state.error}</p>}
    </form>
  );
}
