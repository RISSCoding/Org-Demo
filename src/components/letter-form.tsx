"use client";

import { useActionState, useRef, useState } from "react";
import { createLetterAction, updateLetterAction } from "@/actions/secretariat";
import { Field } from "@/components/auth/field";
import {
  isAutoNumbered, KIND_LABEL, LETTER_KINDS, LETTER_LABEL, LETTER_NATURES, LETTER_TYPES,
  NATURE_LABEL, PARTY_LABEL, signerOfficersFor, signersFor,
} from "@/lib/letters";
import { isApprovalDoc } from "@/lib/approval-meta";
import { OFFICER_LABEL, type OfficerSlot } from "@/lib/officer-meta";
import { inputCls } from "@/lib/ui";
import { SubmitButton } from "@/components/submit-button";
import { useFocusFirstInvalid, useKeepFormValues } from "@/components/ux/use-form-feedback";
import type { FormState } from "@/types/forms";
import type { LetterKind, LetterNature, LetterType } from "@prisma/client";

type Existing = {
  id: string;
  type: LetterType;
  kind: LetterKind | null;
  nature: LetterNature | null;
  activityName: string | null;
  letterNumber: string | null;
  subject: string;
  senderReceiver: string;
  summary: string | null;
  documentUrl: string | null;
  /** "YYYY-MM-DD" in WIB */
  letterDate: string;
  receivedAt: string | null;
  /** Proposal/LPJ: kegiatan terkait dan apakah menyangkut dana kampus. */
  eventId: string | null;
  campusFunds: boolean;
};

export function LetterForm({
  letter,
  defaultType,
  today,
  officers,
  events = [],
}: {
  letter?: Existing;
  defaultType?: LetterType;
  today: string;
  /** Kegiatan yang bisa ditautkan ke proposal/LPJ. */
  events?: { id: string; title: string }[];
  /** Nama pemegang jabatan saat ini, untuk keterangan penandatangan. */
  officers?: Partial<Record<OfficerSlot, string>>;
}) {
  const editing = !!letter;
  const [state, action] = useActionState<FormState, FormData>(
    editing ? updateLetterAction : createLetterAction,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);
  useKeepFormValues(formRef, state);
  useFocusFirstInvalid(state, formRef);
  const [type, setType] = useState<LetterType>(letter?.type ?? defaultType ?? "SURAT_KELUAR");
  const [nature, setNature] = useState<LetterNature | "">(letter?.nature ?? "");
  const [campus, setCampus] = useState(letter?.campusFunds ?? false);
  const fe = state.fieldErrors ?? {};
  const err = (k: string) => fe[k]?.map((e) => <p key={e} className="text-xs text-red-600 dark:text-red-400">{e}</p>);

  const isOut = type === "SURAT_KELUAR";
  const isIn = type === "SURAT_MASUK";
  const isApproval = isApprovalDoc(type);
  const signers = signersFor(type, nature || null, campus);
  const signerOfficers = signerOfficersFor(type, nature || null, campus);

  return (
    <form ref={formRef} action={action} className="max-w-xl space-y-5">
      {editing && <input type="hidden" name="id" value={letter.id} />}

      <div className="space-y-1.5">
        <label htmlFor="type" className="text-sm font-medium">Jenis dokumen</label>
        <select id="type" name="type" className={inputCls} value={type} onChange={(e) => setType(e.target.value as LetterType)} disabled={editing}>
          {LETTER_TYPES.map((t) => <option key={t} value={t}>{LETTER_LABEL[t]}</option>)}
        </select>
        {err("type")}
      </div>

      {isOut && (
        <div className="space-y-1.5">
          <label htmlFor="kind" className="text-sm font-medium">Jenis surat</label>
          <select id="kind" name="kind" className={inputCls} defaultValue={letter?.kind ?? ""} disabled={editing} required={!editing}>
            <option value="" disabled>Pilih jenis surat…</option>
            {LETTER_KINDS.map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
          </select>
          {err("kind")}
        </div>
      )}

      {isOut && (
        <div className="space-y-1.5">
          <label htmlFor="nature" className="text-sm font-medium">Sifat surat</label>
          <select id="nature" name="nature" className={inputCls} value={nature} onChange={(e) => setNature(e.target.value as LetterNature)} required>
            <option value="" disabled>Pilih sifat surat…</option>
            {LETTER_NATURES.map((n) => <option key={n} value={n}>{NATURE_LABEL[n]}</option>)}
          </select>
          {err("nature")}
        </div>
      )}

      {signers && (
        <p className="rounded-sm bg-muted px-3 py-2 text-sm">
          <span className="text-muted-foreground">Penandatangan (PO Pasal 3): </span>{signers}.
        </p>
      )}
      {signers && officers && signerOfficers.length > 0 && (
        <p className="-mt-3 text-xs text-muted-foreground">
          {signerOfficers.map((p, i) => (
            <span key={p}>
              {i > 0 && " · "}
              {OFFICER_LABEL[p]}: {officers?.[p] ?? "belum diisi di halaman Pengurus & Divisi"}
            </span>
          ))}
        </p>
      )}

      {isApproval && (
        <fieldset className="space-y-3 rounded-sm border border-border p-3">
          <legend className="px-1 text-sm font-medium">Lembar pengesahan</legend>
          <div className="space-y-1.5">
            <label htmlFor="eventId" className="text-sm font-medium">Kegiatan terkait</label>
            <select id="eventId" name="eventId" className={inputCls} defaultValue={letter?.eventId ?? ""}>
              <option value="">— tidak ditautkan —</option>
              {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
            </select>
            <p className="text-xs text-muted-foreground">
              Ketua pelaksana dan sekretaris kegiatan diambil dari panitia yang sudah diterima pada kegiatan ini (bukan diketik ulang).
            </p>
            {err("eventId")}
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              name="campusFunds"
              checked={campus}
              onChange={(e) => setCampus(e.target.checked)}
              className="mt-1 size-4 accent-[#ffa500]"
            />
            <span>
              Menyangkut keuangan / dana dari kampus
              <span className="block text-xs text-muted-foreground">Menambahkan Ketua Program Studi, Dekan Fakultas, dan Wakil Rektor III sebagai penandatangan.</span>
            </span>
          </label>
        </fieldset>
      )}

      {editing ? (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Nomor</p>
          <p className="rounded-sm bg-muted px-3 py-2 text-sm">{letter.letterNumber ?? "—"}</p>
          {isAutoNumbered(type) && (
            <p className="text-xs text-muted-foreground">Nomor, jenis surat, kegiatan, dan tanggal surat tidak bisa diubah setelah disimpan.</p>
          )}
        </div>
      ) : isAutoNumbered(type) ? (
        <>
          <Field
            label="Nama kegiatan pada nomor (opsional)"
            name="activityName"
            errors={fe.activityName}
            hint="Singkatan kegiatan, mis. MONDAY. Dikosongkan bila bukan untuk kegiatan tertentu."
          />
          <p className="rounded-sm bg-muted px-3 py-2 text-sm text-muted-foreground">
            Nomor dibuat otomatis: No/Jenis Surat/Nama Kegiatan/HIMMAN/Bulan/Tahun, mis. 001/SU/MONDAY/HIMMAN/X/2026.
          </p>
        </>
      ) : (
        <Field
          label="Nomor surat dari pengirim (opsional)"
          name="manualNumber"
          errors={fe.manualNumber}
          hint="Isi sesuai nomor yang tertera pada surat yang diterima."
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {editing && isAutoNumbered(type) ? (
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Tanggal surat</p>
            <p className="rounded-sm bg-muted px-3 py-2 text-sm">{letter.letterDate}</p>
          </div>
        ) : (
          <Field label="Tanggal surat" name="letterDate" type="date" defaultValue={letter?.letterDate ?? today} errors={fe.letterDate} required />
        )}
        {isIn && (
          <Field label="Tanggal diterima" name="receivedAt" type="date" defaultValue={letter?.receivedAt ?? today} errors={fe.receivedAt} required />
        )}
      </div>

      <Field label="Perihal" name="subject" defaultValue={letter?.subject} errors={fe.subject} required />
      <Field label={PARTY_LABEL[type]} name="senderReceiver" defaultValue={letter?.senderReceiver} errors={fe.senderReceiver} required />

      {isIn && (
        <div className="space-y-1.5">
          <label htmlFor="summary" className="text-sm font-medium">Pokok masalah</label>
          <textarea id="summary" name="summary" rows={3} defaultValue={letter?.summary ?? ""} className={`${inputCls} h-auto py-2`} required />
          <p className="text-xs text-muted-foreground">Dicatat sekretaris sebelum surat diteruskan kepada Ketua.</p>
          {err("summary")}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="document" className="text-sm font-medium">
          {editing && letter.documentUrl ? "Ganti dokumen (PDF, maks. 10 MB)" : "Dokumen (PDF, maks. 10 MB)"}
        </label>
        <input
          id="document"
          name="document"
          type="file"
          accept="application/pdf"
          className="block w-full text-sm file:mr-3 file:h-10 file:rounded-sm file:border-0 file:bg-muted file:px-4 file:text-sm hover:file:bg-border"
        />
        {editing && letter.documentUrl && (
          <p className="text-xs text-muted-foreground">
            Sudah ada dokumen terlampir.{" "}
            <a href={letter.documentUrl} target="_blank" rel="noreferrer" className="font-medium text-[var(--gold-text)] underline underline-offset-4 hover:no-underline">Buka</a>
          </p>
        )}
        {err("document")}
      </div>

      {state.error && (
        <p role="alert" className="rounded-sm bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      {state.success && (
        <p role="status" className="rounded-sm bg-[var(--emerald)]/15 px-3 py-2 text-sm text-[var(--emerald)]">{state.success}</p>
      )}
      <SubmitButton pendingLabel="Menyimpan…">{editing ? "Simpan perubahan" : "Simpan"}</SubmitButton>
    </form>
  );
}
