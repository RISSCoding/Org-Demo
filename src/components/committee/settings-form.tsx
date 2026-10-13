"use client";

import { useActionState, useRef } from "react";
import { saveCommitteeSettingsAction } from "@/actions/committee";
import { Field } from "@/components/auth/field";
import { SubmitButton } from "@/components/submit-button";
import { useFormFeedback, useKeepFormValues } from "@/components/ux/use-form-feedback";
import { alertErr } from "@/lib/ui";
import type { FormState } from "@/types/forms";

export function CommitteeSettingsForm({
  eventId,
  open,
  deadline,
}: {
  eventId: string;
  open: boolean;
  /** "YYYY-MM-DDTHH:mm" dalam WIB, atau string kosong. */
  deadline: string;
}) {
  const [state, action] = useActionState<FormState, FormData>(saveCommitteeSettingsAction, {});
  const form = useRef<HTMLFormElement>(null);
  useKeepFormValues(form, state);
  useFormFeedback(state);

  return (
    <form ref={form} action={action} className="max-w-xl space-y-4">
      <input type="hidden" name="eventId" value={eventId} />
      <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm">
        <input type="checkbox" name="committeeOpen" defaultChecked={open} className="mt-1 size-4 accent-[#ffa500]" />
        <span>
          <span className="block font-medium">Buka pendaftaran panitia</span>
          <span className="block text-[13px] text-muted-foreground">Anggota aktif bisa mendaftar dan memilih divisi. Matikan untuk menutup.</span>
        </span>
      </label>
      <Field
        label="Batas pendaftaran (WIB, opsional)"
        name="committeeDeadline"
        type="datetime-local"
        defaultValue={deadline}
        hint="Setelah waktu ini formulir otomatis tertutup. Kosongkan bila tanpa batas."
        errors={state.fieldErrors?.committeeDeadline}
      />
      {state.error && <p role="alert" className={alertErr}>{state.error}</p>}
      <SubmitButton pendingLabel="Menyimpan…">Simpan pengaturan</SubmitButton>
    </form>
  );
}
