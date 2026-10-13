"use client";

import { AlertCircle } from "lucide-react";
import { useActionState, useRef, useState } from "react";
import { applyCommitteeAction } from "@/actions/committee";
import { FieldError } from "@/components/auth/field";
import { SubmitButton } from "@/components/submit-button";
import { useFocusFirstInvalid, useFormFeedback, useKeepFormValues } from "@/components/ux/use-form-feedback";
import { slotsLeft, type DivisionOption } from "@/lib/committee-meta";
import { alertErr, inputCls } from "@/lib/ui";
import type { FormState } from "@/types/forms";

const label = (d: DivisionOption) => {
  const left = slotsLeft(d);
  return left === null ? d.name : `${d.name} (sisa ${left} dari ${d.quota} slot)`;
};

export function CommitteeApplyForm({ eventId, divisions }: { eventId: string; divisions: DivisionOption[] }) {
  const [state, action] = useActionState<FormState, FormData>(applyCommitteeAction, {});
  const form = useRef<HTMLFormElement>(null);
  const [len, setLen] = useState(0);
  const [first, setFirst] = useState("");
  const fe = state.fieldErrors ?? {};
  useKeepFormValues(form, state);
  useFocusFirstInvalid(state, form);
  useFormFeedback(state);

  return (
    <form ref={form} action={action} className="max-w-xl space-y-5">
      <input type="hidden" name="eventId" value={eventId} />

      <div className="space-y-1.5">
        <label htmlFor="firstChoiceId" className="text-sm font-medium">Divisi pilihan pertama</label>
        <select
          id="firstChoiceId"
          name="firstChoiceId"
          required
          defaultValue=""
          onChange={(e) => setFirst(e.target.value)}
          aria-invalid={fe.firstChoiceId?.length ? true : undefined}
          className={inputCls}
        >
          <option value="" disabled>Pilih divisi…</option>
          {divisions.map((d) => (
            <option key={d.id} value={d.id}>{label(d)}</option>
          ))}
        </select>
        <FieldError list={fe.firstChoiceId} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="secondChoiceId" className="text-sm font-medium">Divisi pilihan kedua <span className="font-normal text-muted-foreground">(opsional)</span></label>
        <select id="secondChoiceId" name="secondChoiceId" defaultValue="" aria-invalid={fe.secondChoiceId?.length ? true : undefined} className={inputCls}>
          <option value="">Tidak ada</option>
          {divisions.filter((d) => String(d.id) !== first).map((d) => (
            <option key={d.id} value={d.id}>{label(d)}</option>
          ))}
        </select>
        <p className="text-[13px] text-muted-foreground">Dipertimbangkan bila divisi pilihan pertama sudah penuh.</p>
        <FieldError list={fe.secondChoiceId} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="motivation" className="text-sm font-medium">Kenapa kamu ingin jadi panitia?</label>
        <textarea
          id="motivation"
          name="motivation"
          rows={5}
          maxLength={1000}
          required
          onChange={(e) => setLen(e.target.value.length)}
          aria-invalid={fe.motivation?.length ? true : undefined}
          className={`${inputCls} h-auto min-h-28 py-2`}
        />
        <div className="flex justify-between gap-3 text-[13px] text-muted-foreground">
          <p>Ceritakan alasan dan apa yang bisa kamu bantu. Minimal 30 karakter.</p>
          <p className={`tabular shrink-0 ${len > 0 && len < 30 ? "text-[var(--gold-text)]" : ""}`}>{len}/1000</p>
        </div>
        <FieldError list={fe.motivation} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="experience" className="text-sm font-medium">Pengalaman terkait <span className="font-normal text-muted-foreground">(opsional)</span></label>
        <textarea
          id="experience"
          name="experience"
          rows={3}
          maxLength={600}
          aria-invalid={fe.experience?.length ? true : undefined}
          className={`${inputCls} h-auto min-h-20 py-2`}
        />
        <p className="text-[13px] text-muted-foreground">Misalnya kepanitiaan sebelumnya, keahlian desain, atau kemampuan lain.</p>
        <FieldError list={fe.experience} />
      </div>

      {state.error && (
        <p role="alert" className={alertErr}>
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden /> {state.error}
        </p>
      )}
      <SubmitButton pendingLabel="Mengirim pendaftaran…">Kirim pendaftaran panitia</SubmitButton>
    </form>
  );
}
