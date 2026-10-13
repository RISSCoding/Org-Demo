"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { deleteDivisionAction, saveDivisionAction } from "@/actions/committee";
import { FieldError } from "@/components/auth/field";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { SubmitButton } from "@/components/submit-button";
import { useFormFeedback, useKeepFormValues } from "@/components/ux/use-form-feedback";
import { alertErr, btnGhost, btnLine, cardCls, inputCls } from "@/lib/ui";
import type { FormState } from "@/types/forms";

type Division = { id: number; name: string; description: string | null; quota: number | null; accepted: number };

function DivisionForm({ eventId, division, onDone }: { eventId: string; division?: Division; onDone?: () => void }) {
  const [state, action] = useActionState<FormState, FormData>(saveDivisionAction, {});
  const uid = useId();
  const form = useRef<HTMLFormElement>(null);
  useKeepFormValues(form, state);
  useFormFeedback(state);
  useEffect(() => {
    if (state.success) {
      if (!division) form.current?.reset();
      onDone?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
  const fe = state.fieldErrors ?? {};

  return (
    <form ref={form} action={action} className="space-y-3">
      <input type="hidden" name="eventId" value={eventId} />
      {division && <input type="hidden" name="id" value={division.id} />}
      <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
        <div className="space-y-1.5">
          <label htmlFor={`${uid}-name`} className="text-sm font-medium">Nama divisi</label>
          <input id={`${uid}-name`} name="name" defaultValue={division?.name} required maxLength={60} aria-invalid={fe.name?.length ? true : undefined} className={inputCls} />
          <FieldError list={fe.name} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor={`${uid}-quota`} className="text-sm font-medium">Kuota <span className="font-normal text-muted-foreground">(opsional)</span></label>
          <input id={`${uid}-quota`} name="quota" type="number" inputMode="numeric" min={1} defaultValue={division?.quota ?? ""} aria-invalid={fe.quota?.length ? true : undefined} className={inputCls} />
          <FieldError list={fe.quota} />
        </div>
      </div>
      <div className="space-y-1.5">
        <label htmlFor={`${uid}-desc`} className="text-sm font-medium">Deskripsi singkat <span className="font-normal text-muted-foreground">(opsional)</span></label>
        <textarea id={`${uid}-desc`} name="description" rows={2} maxLength={300} defaultValue={division?.description ?? ""} className={`${inputCls} h-auto py-2`} placeholder="Apa yang dikerjakan divisi ini?" />
        <FieldError list={fe.description} />
      </div>
      {state.error && <p role="alert" className={alertErr}>{state.error}</p>}
      <div className="flex gap-2">
        <SubmitButton pendingLabel="Menyimpan…">{division ? "Simpan divisi" : "Tambah divisi"}</SubmitButton>
        {onDone && <button type="button" className={btnLine} onClick={onDone}>Batal</button>}
      </div>
    </form>
  );
}

function DeleteDivision({ eventId, division }: { eventId: string; division: Division }) {
  const [state, action, pending] = useActionState<FormState, FormData>(deleteDivisionAction, {});
  const [open, setOpen] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  useFormFeedback(state);
  return (
    <form ref={form} action={action}>
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="id" value={division.id} />
      <button type="button" className={`${btnGhost} text-[var(--state-danger-fg)]`} onClick={() => setOpen(true)} aria-label={`Hapus divisi ${division.name}`}>
        <Trash2 className="size-4" />
      </button>
      {state.error && <p role="alert" className="mt-2 text-[13px] text-[var(--state-danger-fg)]">{state.error}</p>}
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Hapus divisi ${division.name}?`}
        description="Divisi hanya bisa dihapus bila belum dipilih satu pendaftar pun."
        confirmLabel="Hapus divisi"
        pending={pending}
        onConfirm={() => {
          setOpen(false);
          form.current?.requestSubmit();
        }}
      />
    </form>
  );
}

export function DivisionEditor({ eventId, divisions }: { eventId: string; divisions: Division[] }) {
  const [editing, setEditing] = useState<number | null>(null);
  const [adding, setAdding] = useState(divisions.length === 0);

  return (
    <div className="space-y-3">
      {divisions.length === 0 && <p className="text-sm text-muted-foreground">Belum ada divisi. Tambahkan dulu, misalnya Acara, Humas, atau Dokumentasi.</p>}
      <ul className="space-y-2">
        {divisions.map((d) => (
          <li key={d.id} className={`${cardCls} p-4`}>
            {editing === d.id ? (
              <DivisionForm eventId={eventId} division={d} onDone={() => setEditing(null)} />
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{d.name}</p>
                  {d.description && <p className="text-sm text-muted-foreground">{d.description}</p>}
                  <p className="tabular mt-1 text-xs text-muted-foreground">
                    {d.accepted} diterima{d.quota !== null ? ` dari ${d.quota} slot` : ", tanpa batas kuota"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button type="button" className={btnGhost} onClick={() => setEditing(d.id)} aria-label={`Ubah divisi ${d.name}`}>
                    <Pencil className="size-4" />
                  </button>
                  <DeleteDivision eventId={eventId} division={d} />
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      {adding ? (
        <div className={`${cardCls} p-4`}>
          <DivisionForm eventId={eventId} onDone={divisions.length > 0 ? () => setAdding(false) : undefined} />
        </div>
      ) : (
        <button type="button" className={btnLine} onClick={() => setAdding(true)}>
          <Plus className="size-4" /> Tambah divisi
        </button>
      )}
    </div>
  );
}
