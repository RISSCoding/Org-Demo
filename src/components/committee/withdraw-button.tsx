"use client";

import { useActionState, useRef, useState } from "react";
import { withdrawCommitteeAction } from "@/actions/committee";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useFormFeedback } from "@/components/ux/use-form-feedback";
import { alertErr, btnLine } from "@/lib/ui";
import type { FormState } from "@/types/forms";

export function WithdrawCommitteeButton({ eventId, accepted }: { eventId: string; accepted: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(withdrawCommitteeAction, {});
  const [open, setOpen] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  useFormFeedback(state);

  return (
    <form ref={form} action={action} className="space-y-2">
      <input type="hidden" name="eventId" value={eventId} />
      <button type="button" className={btnLine} onClick={() => setOpen(true)} disabled={pending}>
        Mundur dari kepanitiaan
      </button>
      {state.error && <p role="alert" className={alertErr}>{state.error}</p>}
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Mundur dari kepanitiaan?"
        description={
          accepted
            ? "Slotmu di divisi dilepas dan panitia lain akan diberi tahu lewat daftar. Kamu bisa mendaftar lagi selama pendaftaran masih dibuka."
            : "Pendaftaranmu ditarik dari antrean seleksi. Kamu bisa mendaftar lagi selama pendaftaran masih dibuka."
        }
        confirmLabel="Ya, mundur"
        cancelLabel="Tetap ikut"
        pending={pending}
        onConfirm={() => {
          setOpen(false);
          form.current?.requestSubmit();
        }}
      />
    </form>
  );
}
