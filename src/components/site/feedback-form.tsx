"use client";

import Link from "next/link";
import { AlertCircle, Check, Copy } from "lucide-react";
import { useActionState, useRef, useState } from "react";
import { submitFeedback } from "@/actions/feedback";
import { FieldError } from "@/components/auth/field";
import { SubmitButton } from "@/components/submit-button";
import { useFocusFirstInvalid, useKeepFormValues } from "@/components/ux/use-form-feedback";
import { btnOrange, inputSite, linkText } from "@/lib/site-ui";
import type { FeedbackState } from "@/types/feedback";

function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {}
      }}
      className="inline-flex h-11 items-center gap-2 border border-[var(--s-line)] px-4 text-sm font-semibold transition-colors hover:bg-[var(--s-panel)]"
    >
      {copied ? <Check className="ux-pop size-4 text-[var(--emerald)]" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      <span role="status">{copied ? "Kode tersalin" : "Salin kode"}</span>
    </button>
  );
}

export function FeedbackForm() {
  const [state, action] = useActionState<FeedbackState, FormData>(submitFeedback, {});
  const formRef = useRef<HTMLFormElement>(null);
  useKeepFormValues(formRef, state);
  useFocusFirstInvalid(state, formRef);
  const [len, setLen] = useState(0);
  const fe = state.fieldErrors ?? {};

  if (state.code) {
    return (
      <div className="ux-enter space-y-5" role="status">
        <svg viewBox="0 0 56 56" className="ux-check size-12 text-[var(--emerald)]" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="28" cy="28" r="25" />
          <path d="M17 29l8 8 14-17" />
        </svg>
        <h2 className="s-display text-2xl text-[var(--s-head)]">Pesanmu sudah terkirim</h2>
        <p className="s-serif">Simpan kode di bawah ini. Dengan kode inilah kamu bisa melihat status pesanmu.</p>
        <p className="select-all border border-[var(--s-line)] bg-[var(--s-panel)] px-4 py-3 font-mono text-xl tracking-wider text-[var(--s-head)]">
          {state.code}
        </p>
        <CopyCode code={state.code} />
        <p className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href={`/aspirasi/lacak?kode=${state.code}`} className={linkText}>
            Lihat status sekarang
          </Link>
          <a href="/aspirasi" className={linkText}>
            Kirim pesan lain
          </a>
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={action} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <label htmlFor="category" className="text-sm font-medium">Jenis pesan</label>
        <select id="category" name="category" defaultValue="Aspirasi" className={inputSite}>
          <option value="Aspirasi">Aspirasi atau saran</option>
          <option value="Keluhan">Keluhan</option>
          <option value="Laporan">Laporan</option>
        </select>
        <FieldError list={fe.category} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="subject" className="text-sm font-medium">Judul</label>
        <input id="subject" name="subject" maxLength={120} className={inputSite} aria-invalid={!!fe.subject?.length} required />
        <FieldError list={fe.subject} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="message" className="text-sm font-medium">Isi pesan</label>
        <textarea id="message" name="message" rows={7} maxLength={4000} onChange={(e) => setLen(e.target.value.length)} className={inputSite} aria-invalid={!!fe.message?.length} required />
        <div className="flex justify-between gap-3 text-xs text-[var(--s-muted)]">
          <p>Ceritakan apa yang terjadi, kapan, dan apa yang kamu harapkan.</p>
          <p className={`tabular shrink-0 ${len > 3600 ? "text-[var(--s-orange-text)]" : ""}`} aria-live="off">{len}/4000</p>
        </div>
        <FieldError list={fe.message} />
      </div>

      {/* Kolom jebakan untuk bot; disembunyikan dari manusia dan pembaca layar. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Jangan diisi</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="anonymous" defaultChecked className="mt-1 size-4 accent-[#ffa500]" />
        <span>
          Kirim tanpa nama.
          <span className="block text-[var(--s-muted)]">
            Bila dicentang, identitasmu tidak tercatat. Bila tidak, kamu harus masuk dan namamu ikut tersimpan.
          </span>
        </span>
      </label>

      {state.error && (
        <p role="alert" className="ux-nudge flex items-start gap-2 border border-[var(--state-danger-border)] bg-[var(--state-danger-bg)] px-3 py-2 text-sm text-[var(--state-danger-fg)]">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden /> {state.error}
        </p>
      )}

      <SubmitButton pendingLabel="Mengirim…" className={`${btnOrange} gap-2 disabled:opacity-60`}>
        Kirim pesan
      </SubmitButton>
    </form>
  );
}
