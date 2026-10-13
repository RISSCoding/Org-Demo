"use client";

import { useActionState, useRef } from "react";
import { saveEventAction } from "@/actions/events-admin";
import { Field } from "@/components/auth/field";
import { inputCls } from "@/lib/ui";
import { SubmitButton } from "@/components/submit-button";
import { useFocusFirstInvalid, useKeepFormValues } from "@/components/ux/use-form-feedback";
import type { FormState } from "@/types/forms";

export type EventFormValues = {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string; // "YYYY-MM-DDTHH:mm" (WIB)
  endDate: string;
  quota: number | null;
  isPublic: boolean;
  bannerUrl: string | null;
};

export function EventForm({ event }: { event?: EventFormValues }) {
  const [state, action] = useActionState<FormState, FormData>(saveEventAction, {});
  const formRef = useRef<HTMLFormElement>(null);
  useKeepFormValues(formRef, state);
  useFocusFirstInvalid(state, formRef);
  const fe = state.fieldErrors ?? {};

  return (
    <form ref={formRef} action={action} className="max-w-2xl space-y-5">
      {event && <input type="hidden" name="id" value={event.id} />}

      <Field label="Judul event" name="title" defaultValue={event?.title} errors={fe.title} required />

      <div className="space-y-1.5">
        <label htmlFor="description" className="text-sm font-medium">Deskripsi</label>
        <textarea
          id="description"
          name="description"
          rows={6}
          defaultValue={event?.description}
          required
          className={`${inputCls} h-auto py-2`}
        />
        {fe.description?.map((e) => (
          <p key={e} className="text-xs text-red-600 dark:text-red-400">{e}</p>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Mulai (WIB)" name="startDate" type="datetime-local" defaultValue={event?.startDate} errors={fe.startDate} required />
        <Field label="Selesai (WIB)" name="endDate" type="datetime-local" defaultValue={event?.endDate} errors={fe.endDate} required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Lokasi" name="location" defaultValue={event?.location} errors={fe.location} required />
        <Field
          label="Kuota (opsional)"
          name="quota"
          type="number"
          min={1}
          defaultValue={event?.quota ?? ""}
          hint="Kosongkan jika tidak dibatasi."
          errors={fe.quota}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="banner" className="text-sm font-medium">Banner (PNG/JPG/WebP, maks. 3 MB)</label>
        {event?.bannerUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.bannerUrl} alt="Banner saat ini" className="mb-2 h-32 rounded-sm border border-border object-cover" />
        )}
        <input
          id="banner"
          name="banner"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="block w-full text-sm file:mr-3 file:h-10 file:rounded-sm file:border-0 file:bg-muted file:px-4 file:text-sm hover:file:bg-border"
        />
        {fe.banner?.map((e) => (
          <p key={e} className="text-xs text-red-600 dark:text-red-400">{e}</p>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPublic" defaultChecked={event?.isPublic} className="size-4 accent-[var(--gold)]" />
        Tampilkan di halaman publik
      </label>

      {state.error && (
        <p role="alert" className="rounded-sm bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}

      <SubmitButton pendingLabel="Menyimpan…">{event ? "Simpan perubahan" : "Buat event"}</SubmitButton>
    </form>
  );
}
