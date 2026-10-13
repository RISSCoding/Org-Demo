"use client";

import { UserMinus, UserPlus } from "lucide-react";
import { useActionState, useId, useState } from "react";
import { addAdvisorAction, removeAdvisorAction, saveOfficerSlotAction } from "@/actions/officers";
import { SearchSelect, type SearchOption } from "@/components/search-select";
import { OfficerSignature } from "@/components/signature-controls";
import { SubmitButton } from "@/components/submit-button";
import { useFormFeedback } from "@/components/ux/use-form-feedback";
import { EXTERNAL_SLOTS } from "@/lib/officer-meta";
import { alertErr, btnGhost, btnLine, cardCls, inputCls } from "@/lib/ui";
import type { FormState } from "@/types/forms";

export type OfficerSlotRow = {
  position: string;
  label: string;
  /** id baris OrgOfficer; null bila jabatan masih kosong. */
  officerId: number | null;
  userId: string | null;
  name: string | null;
  /** Tanda tangan yang berlaku untuk pemegang saat ini (akunnya, atau yang diunggah pengurus). */
  signatureUrl: string | null;
};
export type AdvisorRow = { id: number; name: string };

const EXTERNAL = new Set<string>(EXTERNAL_SLOTS);

function SlotForm({ slot, options }: { slot: OfficerSlotRow; options: SearchOption[] }) {
  const uid = useId();
  const [state, action] = useActionState<FormState, FormData>(saveOfficerSlotAction, {});
  useFormFeedback(state);
  const [userId, setUserId] = useState(slot.userId ?? "");
  const [manual, setManual] = useState(slot.userId ? "" : (slot.name ?? ""));

  return (
    <div className={`${cardCls} space-y-4 p-4`}>
      <form action={action} className="space-y-3">
        <input type="hidden" name="position" value={slot.position} />
        <div>
          <h3 className="font-semibold">{slot.label}</h3>
          <p className="text-sm text-muted-foreground">{slot.name ? `Saat ini: ${slot.name}` : "Belum diisi"}</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${uid}-user`} className="text-sm font-medium">Pilih dari anggota</label>
          <SearchSelect id={`${uid}-user`} name="userId" options={options} defaultValue={slot.userId ?? ""} emptyLabel="— kosong —" onChange={setUserId} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${uid}-name`} className="text-sm font-medium">
            Atau tulis nama <span className="font-normal text-muted-foreground">(bila tidak ada di daftar)</span>
          </label>
          <input
            id={`${uid}-name`}
            name="name"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            disabled={userId !== ""}
            maxLength={100}
            className={inputCls}
            placeholder={userId ? "Dinonaktifkan karena anggota sudah dipilih" : "Nama lengkap"}
          />
        </div>

        {state.error && <p role="alert" className={alertErr}>{state.error}</p>}
        <SubmitButton className={btnLine} pendingLabel="Menyimpan…">Simpan</SubmitButton>
      </form>

      <SlotSignature slot={slot} />
    </div>
  );
}

/**
 * Tanda tangan pemegang jabatan. Yang punya akun mengunggah sendiri lewat Profil (di sini hanya terlihat statusnya);
 * yang tidak punya akun (umumnya pihak kampus) diunggah pengurus.
 */
function SlotSignature({ slot }: { slot: OfficerSlotRow }) {
  if (slot.officerId === null) {
    return <p className="border-t border-border pt-3 text-sm text-muted-foreground">Isi jabatan ini dulu untuk bisa menambahkan tanda tangan.</p>;
  }
  return (
    <div className="space-y-2 border-t border-border pt-3">
      <h4 className="text-sm font-medium">Tanda tangan</h4>
      {slot.userId ? (
        <p className="text-sm text-muted-foreground">
          Status: {slot.signatureUrl ? "sudah diunggah" : "belum diunggah"}. {slot.name} mengunggahnya sendiri lewat menu Profil.
        </p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            Pemegang jabatan ini tidak punya akun, jadi tanda tangannya diunggah pengurus. Unggah hanya dengan persetujuan yang bersangkutan.
            Mengganti nama pemegang jabatan akan menghapus tanda tangan ini.
          </p>
          <OfficerSignature url={slot.signatureUrl} who={slot.name ?? slot.label} officerId={slot.officerId} />
        </>
      )}
    </div>
  );
}

function Advisors({ advisors }: { advisors: AdvisorRow[] }) {
  const [name, setName] = useState("");
  const [addState, addAction] = useActionState<FormState, FormData>(async (prev, fd) => {
    const res = await addAdvisorAction(prev, fd);
    if (res.success) setName("");
    return res;
  }, {});
  const [removeState, removeAction] = useActionState<FormState, FormData>(removeAdvisorAction, {});
  useFormFeedback(addState);
  useFormFeedback(removeState);

  return (
    <div className={`${cardCls} space-y-3 p-4`}>
      <div>
        <h3 className="font-semibold">Dewan Pembina</h3>
        <p className="text-sm text-muted-foreground">Dosen atau pihak fakultas yang membina HIMMAN. Bisa lebih dari satu; tulis gelar bersama namanya.</p>
      </div>

      {advisors.length === 0 ? (
        <p className="rounded-sm border border-dashed border-border px-3 py-3 text-sm text-muted-foreground">Belum ada Dewan Pembina.</p>
      ) : (
        <ul className="divide-y divide-border rounded-sm border border-border">
          {advisors.map((a) => (
            <li key={a.id} className="flex items-center gap-2 px-3 py-1.5">
              <span className="min-w-0 flex-1 truncate text-sm">{a.name}</span>
              <form action={removeAction}>
                <input type="hidden" name="id" value={a.id} />
                <SubmitButton className={`${btnGhost} text-red-600 dark:text-red-400`} aria-label={`Keluarkan ${a.name} dari Dewan Pembina`} title="Keluarkan dari Dewan Pembina">
                  <UserMinus className="size-4" aria-hidden />
                </SubmitButton>
              </form>
            </li>
          ))}
        </ul>
      )}
      {removeState.error && <p role="alert" className={alertErr}>{removeState.error}</p>}

      <form action={addAction} className="flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1 space-y-1.5">
          <label htmlFor="advisor-name" className="text-sm font-medium">Tambah anggota Dewan Pembina</label>
          <input
            id="advisor-name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            maxLength={100}
            className={inputCls}
            placeholder="mis. Dr. Nama Lengkap, S.E., M.M."
          />
        </div>
        <SubmitButton pendingLabel="Menambahkan…"><UserPlus className="size-4" aria-hidden />Tambah</SubmitButton>
      </form>
      {addState.error && <p role="alert" className={alertErr}>{addState.error}</p>}
    </div>
  );
}

/** Pengurus inti, penandatangan eksternal (pihak kampus), dan Dewan Pembina. Nama-nama ini dipakai di sertifikat, laporan keuangan, arsip surat, dan lembar pengesahan proposal/LPJ. */
export function OfficersBoard({ slots, advisors, options }: { slots: OfficerSlotRow[]; advisors: AdvisorRow[]; options: SearchOption[] }) {
  const internal = slots.filter((s) => !EXTERNAL.has(s.position));
  const external = slots.filter((s) => EXTERNAL.has(s.position));
  return (
    <section aria-labelledby="officers-title" className="space-y-3">
      <div>
        <h2 id="officers-title" className="text-lg font-semibold">Pengurus inti &amp; Dewan Pembina</h2>
        <p className="text-sm text-muted-foreground">
          Nama di sini dipakai sebagai penandatangan: Ketua Himpunan di sertifikat dan laporan keuangan, Bendahara Umum di laporan keuangan,
          serta Ketua Himpunan dan Sekretaris Umum pada keterangan penandatangan arsip surat. Ketua pelaksana dan sekretaris kegiatan
          tidak diisi di sini: keduanya diambil dari panitia setiap kegiatan.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {internal.map((s) => (
          <SlotForm key={s.position} slot={s} options={options} />
        ))}
      </div>

      <div className="pt-2">
        <h3 className="text-base font-semibold">Penandatangan eksternal (pihak kampus)</h3>
        <p className="text-sm text-muted-foreground">
          Ikut menandatangani proposal dan LPJ yang menyangkut dana dari kampus (PO). Biasanya tidak punya akun, jadi cukup tulis nama beserta gelarnya.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {external.map((s) => (
          <SlotForm key={s.position} slot={s} options={options} />
        ))}
      </div>

      <Advisors advisors={advisors} />
    </section>
  );
}
