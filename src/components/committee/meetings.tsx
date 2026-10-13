"use client";

import { Check, Lock, LockOpen, Trash2 } from "lucide-react";
import { useActionState, useRef, useState, useTransition } from "react";
import {
  createMeetingAction,
  deleteMeetingAction,
  markCommitteeDayAttendanceAction,
  markMeetingAttendanceAction,
  selfCheckInMeetingAction,
  setMeetingAttendanceOpenAction,
} from "@/actions/committee-meetings";
import { FieldError } from "@/components/auth/field";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { SubmitButton } from "@/components/submit-button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useFormFeedback, useKeepFormValues } from "@/components/ux/use-form-feedback";
import { alertErr, btnGhost, btnLine, inputCls } from "@/lib/ui";
import type { FormState } from "@/types/forms";

export function MeetingForm({ eventId }: { eventId: string }) {
  const [state, action] = useActionState<FormState, FormData>(createMeetingAction, {});
  const form = useRef<HTMLFormElement>(null);
  const fe = state.fieldErrors ?? {};
  useKeepFormValues(form, state);
  useFormFeedback(state);

  return (
    <form ref={form} action={action} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="eventId" value={eventId} />
      <div className="space-y-1.5 sm:col-span-2">
        <label htmlFor="m-title" className="text-sm font-medium">Nama rapat</label>
        <input id="m-title" name="title" required placeholder="Contoh: Rapat koordinasi 1" aria-invalid={fe.title?.length ? true : undefined} className={inputCls} />
        <FieldError list={fe.title} />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="m-start" className="text-sm font-medium">Waktu (WIB)</label>
        <input id="m-start" name="startsAt" type="datetime-local" required aria-invalid={fe.startsAt?.length ? true : undefined} className={inputCls} />
        <FieldError list={fe.startsAt} />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="m-loc" className="text-sm font-medium">Tempat <span className="font-normal text-muted-foreground">(opsional)</span></label>
        <input id="m-loc" name="location" className={inputCls} />
      </div>
      {state.error && !state.fieldErrors && <p role="alert" className={`${alertErr} sm:col-span-2`}>{state.error}</p>}
      <div className="sm:col-span-2">
        <SubmitButton pendingLabel="Membuat…">Buat rapat</SubmitButton>
      </div>
    </form>
  );
}

/** Panitia memasukkan kode yang tampil di layar sekretaris. */
export function SelfCheckIn({ meetingId }: { meetingId: string }) {
  const [state, action] = useActionState<FormState, FormData>(selfCheckInMeetingAction, {});
  useFormFeedback(state);
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="meetingId" value={meetingId} />
      <div className="flex gap-2">
        <label htmlFor={`c-${meetingId}`} className="sr-only">Kode absensi</label>
        <input
          id={`c-${meetingId}`}
          name="code"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={6}
          placeholder="Kode 6 karakter"
          aria-invalid={state.fieldErrors?.code?.length ? true : undefined}
          className={`${inputCls} w-44 font-mono uppercase tracking-[0.25em]`}
        />
        <SubmitButton pendingLabel="Memeriksa…">Saya hadir</SubmitButton>
      </div>
      {state.error && <p role="alert" className={alertErr}>{state.error}</p>}
    </form>
  );
}

/** Kode besar untuk dibacakan atau diproyeksikan, plus buka/tutup absensi dan hapus rapat. */
export function MeetingControls({ meetingId, title, code, open }: { meetingId: string; title: string; code: string; open: boolean }) {
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, done?: string) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) toast.add({ title: "Belum berhasil", description: r.error, type: "error" });
      else if (done) toast.add({ title: done, type: "success" });
      setConfirming(false);
    });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Kode absensi</p>
          <p className={`font-mono text-3xl font-bold tracking-[0.3em] ${open ? "" : "text-muted-foreground/60"}`} aria-label={`Kode absensi ${code.split("").join(" ")}`}>
            {code}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            aria-busy={pending || undefined}
            className={open ? btnLine : "inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-[#ffa500] px-4 text-sm font-semibold text-black transition hover:bg-[#ffb733] active:translate-y-px disabled:opacity-60 md:h-10"}
            onClick={() => run(() => setMeetingAttendanceOpenAction(meetingId, !open), open ? "Absensi ditutup." : "Absensi dibuka. Bacakan atau tampilkan kodenya.")}
          >
            {pending ? <Spinner /> : open ? <Lock className="size-4" aria-hidden /> : <LockOpen className="size-4" aria-hidden />}
            {open ? "Tutup absensi" : "Buka absensi"}
          </button>
          <button type="button" className={`${btnGhost} text-[var(--state-danger-fg)]`} onClick={() => setConfirming(true)} aria-label={`Hapus rapat ${title}`}>
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={`Hapus rapat “${title}”?`}
        description="Seluruh catatan kehadiran rapat ini ikut terhapus dan tidak bisa dikembalikan."
        confirmLabel="Hapus rapat"
        pending={pending}
        onConfirm={() => run(() => deleteMeetingAction(meetingId), "Rapat dihapus.")}
      />
    </div>
  );
}

const STATUS = [
  { value: "NONE", label: "Belum hadir" },
  { value: "PRESENT", label: "Hadir" },
  { value: "EXCUSED", label: "Izin" },
] as const;

/** Koreksi kehadiran seseorang. Perubahan langsung tersimpan. */
export function MemberAttendanceSelect({ meetingId, userId, name, value }: { meetingId: string; userId: string; name: string; value: "NONE" | "PRESENT" | "EXCUSED" }) {
  const [pending, start] = useTransition();
  return (
    <span className="inline-flex items-center gap-2">
      <label className="sr-only" htmlFor={`a-${meetingId}-${userId}`}>Kehadiran {name}</label>
      <select
        id={`a-${meetingId}-${userId}`}
        value={value}
        disabled={pending}
        onChange={(e) =>
          start(async () => {
            const r = await markMeetingAttendanceAction(meetingId, userId, e.target.value as "NONE" | "PRESENT" | "EXCUSED");
            if (!r.ok) toast.add({ title: "Belum berhasil", description: r.error, type: "error" });
          })
        }
        className="h-9 rounded-sm border border-input bg-transparent px-2 text-sm"
      >
        {STATUS.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      {pending && <Spinner />}
    </span>
  );
}

/** Tandai hadir/tidak hadir di hari-H untuk panitia yang QR-nya bermasalah. */
export function DayAttendanceToggle({ applicationId, present, name }: { applicationId: string; present: boolean; name: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      aria-label={`${present ? "Batalkan" : "Tandai"} hadir hari-H untuk ${name}`}
      className={`${btnGhost} h-9 border border-border`}
      onClick={() =>
        start(async () => {
          const r = await markCommitteeDayAttendanceAction(applicationId, !present);
          if (!r.ok) toast.add({ title: "Belum berhasil", description: r.error, type: "error" });
        })
      }
    >
      {pending ? <Spinner /> : present ? <Check className="size-4 text-[var(--emerald)]" aria-hidden /> : null}
      {present ? "Hadir" : "Tandai hadir"}
    </button>
  );
}
