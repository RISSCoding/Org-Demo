"use client";

import { AlertCircle, Trash2, UploadCloud } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { removeMySignatureAction, saveMySignatureAction, saveOfficerSignatureAction, removeOfficerSignatureAction } from "@/actions/signatures";
import { SubmitButton } from "@/components/submit-button";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { alertErr, alertOk, btnGhost, btnLine, btnPrimary } from "@/lib/ui";
import type { FormState } from "@/types/forms";

// ==========================================
// TANDA TANGAN UNTUK ANGGOTA (PROFIL)
// ==========================================
export function MySignature({ url }: { url: string | null }) {
  const [state, action] = useActionState<FormState, FormData>(saveMySignatureAction, {});
  const [removeState, removeAction] = useActionState<FormState, FormData>(removeMySignatureAction, {});
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (preview) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(file));
    }
  };

  const displayImage = preview || url;

  return (
    <div className="space-y-5">
      {displayImage ? (
        <div className="relative flex flex-col items-center justify-center rounded-md border border-[var(--border-default)] bg-[var(--surface-2)] p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={displayImage} alt="Tanda tangan" className="max-h-32 object-contain mix-blend-multiply dark:mix-blend-normal" />
          {!preview && (
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} className={`${btnLine} h-8 text-xs`}>
                Ganti Tanda Tangan
              </button>
              <form action={removeAction}>
                <ConfirmSubmit
                  title="Hapus tanda tangan?"
                  message="Dokumen yang sudah ditandatangani sebelumnya tidak akan terpengaruh. Tanda tangan ini hanya akan dihapus dari profil."
                  confirmLabel="Hapus"
                  className={`${btnGhost} h-8 text-xs text-[var(--state-danger-fg)]`}
                >
                  <Trash2 className="size-3.5 mr-1" /> Hapus
                </ConfirmSubmit>
              </form>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="group flex w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-[var(--border-default)] bg-[var(--surface-2)] px-6 py-10 transition-colors hover:border-[var(--gold-text)] hover:bg-[#ffa500]/5"
        >
          <UploadCloud className="size-8 text-muted-foreground transition-colors group-hover:text-[var(--gold-text)]" aria-hidden />
          <p className="text-sm font-medium">Klik untuk unggah tanda tangan</p>
          <p className="text-xs text-muted-foreground">Format PNG atau JPG. Latar putih/transparan lebih rapi.</p>
        </button>
      )}

      <form action={action} className="space-y-3">
        <input
          ref={fileRef}
          type="file"
          name="signature"
          accept="image/png,image/jpeg"
          onChange={handleFileChange}
          className="hidden"
        />

        {state.error && <p role="alert" className={alertErr}><AlertCircle className="mt-0.5 size-4 shrink-0" /> {state.error}</p>}
        {state.success && <p role="status" className={alertOk}>Tanda tangan disimpan.</p>}
        {removeState.error && <p role="alert" className={alertErr}><AlertCircle className="mt-0.5 size-4 shrink-0" /> {removeState.error}</p>}

        {preview && (
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = ""; }} className={btnGhost}>
              Batal
            </button>
            <SubmitButton pendingLabel="Menyimpan…" className={btnPrimary}>
              Simpan Tanda Tangan
            </SubmitButton>
          </div>
        )}
      </form>
    </div>
  );
}

// ==========================================
// TANDA TANGAN UNTUK PENGURUS TANPA AKUN (ADMIN)
// ==========================================
export function OfficerSignature({ officerId, url, who }: { officerId: number; url: string | null; who?: string }) {
  const [saveState, saveAction] = useActionState<FormState, FormData>(saveOfficerSignatureAction, {});
  const [removeState, removeAction] = useActionState<FormState, FormData>(removeOfficerSignatureAction, {});
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mt-2 space-y-2">
      {url ? (
        <div className="flex items-center gap-3">
          <div className="rounded-md border border-[var(--border-default)] bg-white p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="TTD" className="h-10 w-24 object-contain mix-blend-multiply" />
          </div>
          <form action={removeAction}>
            <input type="hidden" name="id" value={officerId} />
            <ConfirmSubmit
              title={`Hapus tanda tangan ${who ? who : "pengurus ini"}?`}
              message="Tanda tangan akan dihapus dari dokumen yang akan datang."
              confirmLabel="Hapus"
              className={`${btnGhost} h-8 text-xs text-[var(--state-danger-fg)]`}
            >
              <Trash2 className="size-3.5" /> Hapus
            </ConfirmSubmit>
          </form>
        </div>
      ) : (
        <form action={saveAction} className="flex items-center gap-2">
          <input type="hidden" name="id" value={officerId} />
          <input
            ref={fileRef}
            type="file"
            name="signature"
            accept="image/png,image/jpeg"
            className="block w-full text-xs text-muted-foreground file:mr-2 file:rounded-md file:border-0 file:bg-[var(--surface-2)] file:px-2 file:py-1 file:text-xs file:font-medium hover:file:bg-[var(--interactive-hover)]"
            required
          />
          <SubmitButton pendingLabel="..." className={`${btnLine} h-7 px-2 text-xs`}>
            Unggah
          </SubmitButton>
        </form>
      )}
      {saveState.error && <p className="text-[11px] text-[var(--state-danger-fg)]">{saveState.error}</p>}
      {removeState.error && <p className="text-[11px] text-[var(--state-danger-fg)]">{removeState.error}</p>}
    </div>
  );
}
