"use client";

import { useActionState } from "react";
import { submitDuesProofAction } from "@/actions/dues";
import { FileDrop } from "@/components/file-drop";
import { SubmitButton } from "@/components/submit-button";
import { useFormFeedback } from "@/components/ux/use-form-feedback";
import type { FormState } from "@/types/forms";

export function DuesProofForm({ duesId }: { duesId: string }) {
  const [state, action] = useActionState<FormState, FormData>(submitDuesProofAction, {});
  useFormFeedback(state);
  return (
    <form action={action} className="w-full min-w-[15rem] max-w-xs space-y-2 text-left">
      <input type="hidden" name="duesId" value={duesId} />
      <FileDrop name="proof" compact required errors={state.error ? [state.error] : undefined} />
      <SubmitButton pendingLabel="Mengirim bukti…" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-sm bg-[#ffa500] px-4 text-sm font-semibold text-black transition hover:bg-[#ffb733] active:translate-y-px disabled:opacity-60 md:h-9">
        Kirim bukti transfer
      </SubmitButton>
    </form>
  );
}
