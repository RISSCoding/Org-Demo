"use client";

import Link from "next/link";
import { AlertCircle, Check } from "lucide-react";
import { useActionState, useRef } from "react";
import { submitBugReport } from "@/actions/bug";
import { SubmitButton } from "@/components/submit-button";
import { useFocusFirstInvalid } from "@/components/ux/use-form-feedback";
import { alertErr } from "@/lib/ui";
import { btnOrange, inputSite, linkText } from "@/lib/site-ui";
import type { FeedbackState } from "@/types/feedback";

const AREAS = [
  "Portal anggota",
  "KTA",
  "Event & pendaftaran",
  "Kepanitiaan & rapat",
  "Iuran kas",
  "Surat & arsip",
  "Halaman publik",
  "Panel admin",
  "Lainnya",
] as const;

const taCls =
  "w-full rounded-md border border-[var(--s-line)] bg-transparent px-3 py-2.5 text-base text-[var(--s-fg)] outline-none transition-[border-color,box-shadow] duration-fast placeholder:text-[var(--s-muted)] hover:border-[var(--s-muted)] focus-visible:border-[var(--s-orange)] focus-visible:shadow-[var(--shadow-focus)]";

export function BugForm({ defaultPage }: { defaultPage?: string }) {
  const [state, action] = useActionState<FeedbackState, FormData>(submitBugReport, {});
  const form = useRef<HTMLFormElement>(null);
  const fe = state.fieldErrors ?? {};
  useFocusFirstInvalid(state, form);

  if (state.code) {
    return (
      <div className="ux-enter max-w-2xl space-y-5" role="status">
        <div className="flex items-start gap-3 border border-l-4 border-[var(--s-line)] border-l-[var(--state-success-fg)] p-5">
          <Check className="mt-0.5 size-5 shrink-0 text-[var(--state-success-fg)]" aria-hidden />
          <div>
            <p className="s-display text-xl text-[var(--s-head)]">Laporan terkirim</p>
            <p className="s-serif mt-1 text-[var(--s-muted)]">
              Simpan kode di bawah untuk memantau status atau menambahkan informasi.
            </p>
          </div>
        </div>
        <div className="border border-[var(--s-line)] bg-[var(--s-panel)] p-4">
          <p className="text-xs text-[var(--s-muted)]">Kode pelacakan</p>
          <p className="mt-1 font-mono text-lg font-semibold tracking-wider text-[var(--s-head)]">
            {state.code}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/aspirasi/lacak?kode=${encodeURIComponent(state.code)}`} className={btnOrange}>
            Lacak laporan
          </Link>
          <Link href="/" className={linkText}>
            Kembali ke beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form ref={form} action={action} className="max-w-2xl space-y-5">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      {defaultPage && <input type="hidden" name="pageUrl" value={defaultPage} />}

      {defaultPage && (
        <p className="flex flex-wrap items-center gap-2 border border-[var(--s-line)] bg-[var(--s-panel)] px-3 py-2 text-sm">
          <span className="text-[var(--s-muted)]">Halaman yang bermasalah:</span>
          <code className="font-mono text-[var(--s-head)]">{defaultPage}</code>
        </p>
      )}

      <div className="space-y-1.5">
        <label htmlFor="area" className="text-sm font-medium">Area yang bermasalah</label>
        <select id="area" name="area" required defaultValue="" className={inputSite}>
          <option value="" disabled>Pilih area…</option>
          {AREAS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        {fe.area && (
          <p role="alert" className="flex items-start gap-1.5 text-xs text-[var(--state-danger-fg)]">
            <AlertCircle className="mt-0.5 size-3 shrink-0" aria-hidden /> {fe.area[0]}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="subject" className="text-sm font-medium">Judul singkat</label>
        <input
          id="subject"
          name="subject"
          required
          minLength={5}
          maxLength={120}
          placeholder="mis. Tombol simpan tidak bekerja di HP"
          className={inputSite}
        />
        {fe.subject && (
          <p role="alert" className="flex items-start gap-1.5 text-xs text-[var(--state-danger-fg)]">
            <AlertCircle className="mt-0.5 size-3 shrink-0" aria-hidden /> {fe.subject[0]}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="whatHappened" className="text-sm font-medium">Apa yang terjadi</label>
        <textarea
          id="whatHappened"
          name="whatHappened"
          required
          minLength={20}
          maxLength={2000}
          rows={5}
          placeholder="Ceritakan langkah-langkah sampai masalah muncul. Semakin detail semakin cepat diperbaiki."
          className={taCls}
        />
        <p className="text-xs text-[var(--s-muted)]">
          Contoh: “Buka /dashboard/kta, klik Simpan PNG, tidak ada file terunduh. Sudah coba di Chrome dan Firefox.”
        </p>
        {fe.whatHappened && (
          <p role="alert" className="flex items-start gap-1.5 text-xs text-[var(--state-danger-fg)]">
            <AlertCircle className="mt-0.5 size-3 shrink-0" aria-hidden /> {fe.whatHappened[0]}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="expected" className="text-sm font-medium">
          Yang seharusnya terjadi <span className="text-[var(--s-muted)]">(opsional)</span>
        </label>
        <textarea
          id="expected"
          name="expected"
          maxLength={1000}
          rows={3}
          placeholder="mis. File PNG KTA-<NPM>.png otomatis terunduh"
          className={taCls}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contact" className="text-sm font-medium">
          Kontak <span className="text-[var(--s-muted)]">(opsional)</span>
        </label>
        <input
          id="contact"
          name="contact"
          maxLength={120}
          placeholder="NPM, email, atau nomor WA bila ingin dihubungi"
          className={inputSite}
        />
        <p className="text-xs text-[var(--s-muted)]">
          Kosongkan kalau tidak ingin dihubungi. Info perangkat otomatis disertakan untuk membantu penelusuran.
        </p>
      </div>

      {state.error && (
        <p role="alert" className={alertErr}>
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden /> {state.error}
        </p>
      )}

      <SubmitButton pendingLabel="Mengirim laporan…" className={btnOrange}>
        Kirim laporan
      </SubmitButton>
    </form>
  );
}
