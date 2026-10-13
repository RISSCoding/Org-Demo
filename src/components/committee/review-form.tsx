"use client";

import { useActionState, useRef, useState } from "react";
import { decideApplicationAction } from "@/actions/committee";
import { SubmitButton } from "@/components/submit-button";
import { useFormFeedback } from "@/components/ux/use-form-feedback";
import { COMMITTEE_ROLES, slotsLeft, type DivisionOption } from "@/lib/committee-meta";
import { alertErr, inputCls } from "@/lib/ui";
import type { FormState } from "@/types/forms";

type Decision = "ACCEPTED" | "WAITLIST" | "REJECTED" | "PENDING";

export function ReviewForm({
  application,
  divisions,
  isAdmin,
}: {
  application: { id: string; status: string; role: string; assignedDivisionId: number | null; firstChoiceId: number };
  divisions: DivisionOption[];
  isAdmin: boolean;
}) {
  const [state, action] = useActionState<FormState, FormData>(decideApplicationAction, {});
  const form = useRef<HTMLFormElement>(null);
  const [decision, setDecision] = useState<Decision>(
    application.status === "PENDING" || application.status === "WITHDRAWN" ? "ACCEPTED" : (application.status as Decision),
  );
  const [divisionId, setDivisionId] = useState(String(application.assignedDivisionId ?? application.firstChoiceId));
  useFormFeedback(state);

  const chosen = divisions.find((d) => String(d.id) === divisionId);
  const left = chosen ? slotsLeft(chosen) : null;
  const uid = application.id;

  return (
    <form ref={form} action={action} className="space-y-3 border-t border-border pt-4">
      <input type="hidden" name="applicationId" value={application.id} />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <label htmlFor={`d-${uid}`} className="text-sm font-medium">Keputusan</label>
          <select id={`d-${uid}`} name="decision" value={decision} onChange={(e) => setDecision(e.target.value as Decision)} className={inputCls}>
            <option value="ACCEPTED">Terima</option>
            <option value="WAITLIST">Jadikan cadangan</option>
            <option value="REJECTED">Belum diterima</option>
            <option value="PENDING">Kembalikan ke menunggu</option>
          </select>
        </div>
        {decision === "ACCEPTED" && (
          <>
            <div className="space-y-1.5">
              <label htmlFor={`v-${uid}`} className="text-sm font-medium">Ditempatkan di</label>
              <select id={`v-${uid}`} name="divisionId" value={divisionId} onChange={(e) => setDivisionId(e.target.value)} className={inputCls}>
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              {left !== null && (
                <p className={`text-[13px] ${left === 0 && String(application.assignedDivisionId) !== divisionId ? "text-[var(--state-danger-fg)]" : "text-muted-foreground"}`}>
                  {left === 0 && String(application.assignedDivisionId) !== divisionId ? "Kuota divisi ini sudah penuh." : `Sisa ${left} slot.`}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label htmlFor={`r-${uid}`} className="text-sm font-medium">Peran</label>
              <select id={`r-${uid}`} name="role" defaultValue={application.role} className={inputCls}>
                {COMMITTEE_ROLES.filter((r) => isAdmin || r.value !== "CHAIR").map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>
      {state.error && <p role="alert" className={alertErr}>{state.error}</p>}
      <SubmitButton pendingLabel="Menyimpan…" className="inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-[#ffa500] px-4 text-sm font-semibold text-black transition hover:bg-[#ffb733] active:translate-y-px disabled:opacity-60 md:h-9">
        Simpan keputusan
      </SubmitButton>
    </form>
  );
}
