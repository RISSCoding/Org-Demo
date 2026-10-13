"use client";

import { Trash2, Upload } from "lucide-react";
import { useActionState } from "react";
import {
  removeMySignatureAction,
  removeOfficerSignatureAction,
  saveMySignatureAction,
  saveOfficerSignatureAction,
} from "@/actions/signatures";
import { SubmitButton } from "@/components/submit-button";
import { useFormFeedback } from "@/components/ux/use-form-feedback";
import { alertErr, btnGhost, btnLine } from "@/lib/ui";
import type { FormState } from "@/types/forms";

const fileCls =
  "block w-full text-sm file:mr-3 file:h-9 file:rounded-sm file:border-0 file:bg-muted file:px-3 file:text-sm hover:file:bg-border";

/** Pratinjau di atas latar putih tetap: tanda tangan bertinta gelap tidak terlihat di tema gelap. */
function Preview({ url, alt }: { url: string | null; alt: string }) {
  if (!url) {
    return <div className="grid h-16 w-40 place-items-center rounded-sm border border-dashed border-border text-xs text-muted-foreground">Belum ada</div>;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={alt} className="h-16 w-40 rounded-sm border border-border bg-white object-contain p-1" />
  );
}

type Props = {
  /** URL tersimpan ("/api/signatures/…") atau null. */
  url: string | null;
  /** Dipakai sebagai teks alternatif gambar dan label tombol hapus. */
  who: string;
  /** Hanya untuk SignatureUpload milik pengurus: id baris OrgOfficer. */
  officerId?: number;
};

function Controls({
  url,
  who,
  save,
  remove,
  officerId,
}: Props & {
  save: (s: FormState, fd: FormData) => Promise<FormState>;
  remove: (s: FormState, fd: FormData) => Promise<FormState>;
}) {
  const [saveState, saveAction] = useActionState<FormState, FormData>(save, {});
  const [removeState, removeAction] = useActionState<FormState, FormData>(remove, {});
  useFormFeedback(saveState);
  useFormFeedback(removeState);
  const error = saveState.error ?? removeState.error;

  return (
    <div className="space-y-3">
      <Preview url={url} alt={`Tanda tangan ${who}`} />

      <form action={saveAction} className="flex flex-wrap items-end gap-3">
        {officerId !== undefined && <input type="hidden" name="id" value={officerId} />}
        <div className="min-w-56 flex-1 space-y-1.5">
          <label className="text-sm font-medium" htmlFor={`sig-${officerId ?? "me"}`}>
            {url ? "Ganti tanda tangan" : "Unggah tanda tangan"} <span className="font-normal text-muted-foreground">(PNG atau JPG, maks. 2 MB)</span>
          </label>
          <input id={`sig-${officerId ?? "me"}`} name="signature" type="file" accept="image/png,image/jpeg" required className={fileCls} />
        </div>
        <SubmitButton className={btnLine} pendingLabel="Mengunggah…">
          <Upload className="size-4" aria-hidden />
          Simpan
        </SubmitButton>
      </form>

      {url && (
        <form action={removeAction}>
          {officerId !== undefined && <input type="hidden" name="id" value={officerId} />}
          <SubmitButton className={`${btnGhost} -ml-3 text-red-600 dark:text-red-400`} pendingLabel="Menghapus…" aria-label={`Hapus tanda tangan ${who}`}>
            <Trash2 className="size-4" aria-hidden />
            Hapus tanda tangan
          </SubmitButton>
        </form>
      )}

      {error && <p role="alert" className={alertErr}>{error}</p>}
    </div>
  );
}

/** Tanda tangan milik sendiri (halaman Profil). */
export function MySignature({ url }: { url: string | null }) {
  return <Controls url={url} who="Anda" save={saveMySignatureAction} remove={removeMySignatureAction} />;
}

/** Tanda tangan pemegang jabatan yang tidak punya akun, diunggah pengurus (panel Pengurus & Divisi). */
export function OfficerSignature({ url, who, officerId }: { url: string | null; who: string; officerId: number }) {
  return <Controls url={url} who={who} officerId={officerId} save={saveOfficerSignatureAction} remove={removeOfficerSignatureAction} />;
}
