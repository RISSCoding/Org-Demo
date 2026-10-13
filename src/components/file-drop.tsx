"use client";

import { AlertCircle, FileImage, Upload, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

const kb = (n: number) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

/**
 * Pilih atau seret foto bukti. Memeriksa jenis dan ukuran di peramban sebelum dikirim
 * (server tetap memeriksa ulang), menampilkan pratinjau, dan bisa dibatalkan.
 */
export function FileDrop({
  name,
  label,
  hint,
  accept = "image/png,image/jpeg,image/webp",
  maxMB = 3,
  required,
  compact = false,
  errors,
}: {
  name: string;
  label?: string;
  hint?: string;
  accept?: string;
  maxMB?: number;
  required?: boolean;
  compact?: boolean;
  errors?: string[];
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [local, setLocal] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  useEffect(() => {
    if (!file || !file.type.startsWith("image/")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- pratinjau diturunkan dari berkas yang dipilih
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // React mengosongkan formulir setelah dikirim. Bila berkasnya masih dipilih di sini
  // (mis. server menolak isian lain), kembalikan ke input supaya kiriman berikutnya tetap membawa berkas.
  useEffect(() => {
    const form = input.current?.form;
    if (!form || !file) return;
    const onReset = () =>
      setTimeout(() => {
        if (input.current && input.current.files?.length === 0) {
          const dt = new DataTransfer();
          dt.items.add(file);
          input.current.files = dt.files;
        }
      }, 0);
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, [file]);

  function take(f: File | undefined | null) {
    if (!f) return;
    const okType = accept.split(",").map((s) => s.trim()).includes(f.type);
    if (!okType) return reject("Format harus PNG, JPG, atau WebP.");
    if (f.size > maxMB * 1048576) return reject(`Ukuran foto ${kb(f.size)}, melebihi batas ${maxMB} MB. Kecilkan atau ambil ulang fotonya.`);
    setLocal(null);
    setFile(f);
  }
  function reject(msg: string) {
    setLocal(msg);
    setFile(null);
    if (input.current) input.current.value = "";
  }
  function clear() {
    setFile(null);
    setLocal(null);
    if (input.current) input.current.value = "";
    input.current?.focus();
  }

  const problem = local ?? errors?.[0];

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f && input.current) {
            const dt = new DataTransfer();
            dt.items.add(f);
            input.current.files = dt.files;
            take(f);
          }
        }}
        className={`relative rounded-sm border transition-colors duration-200 focus-within:border-[#ffa500] focus-within:shadow-[0_0_0_3px_rgba(255,165,0,0.22)] ${
          problem ? "border-red-500" : drag ? "border-[#ffa500] bg-[#ffa500]/10" : file ? "border-border" : "border-dashed border-input hover:border-foreground/40"
        }`}
      >
        <input
          ref={input}
          id={id}
          name={name}
          type="file"
          accept={accept}
          required={required}
          aria-invalid={!!problem || undefined}
          aria-describedby={problem ? `${id}-err` : hint ? `${id}-hint` : undefined}
          className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          onChange={(e) => take(e.target.files?.[0])}
        />
        {file ? (
          <div className={`pointer-events-none flex items-center gap-3 ${compact ? "p-2" : "p-3"}`}>
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Pratinjau foto yang dipilih" className={`ux-pop shrink-0 rounded-sm object-cover ${compact ? "size-9" : "size-14"}`} />
            ) : (
              <FileImage className="size-8 shrink-0 text-muted-foreground" aria-hidden />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">{kb(file.size)} · siap dikirim</p>
            </div>
            <button
              type="button"
              onClick={clear}
              aria-label="Hapus foto yang dipilih"
              className="pointer-events-auto relative z-20 grid size-9 shrink-0 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <div className={`pointer-events-none flex items-center gap-3 ${compact ? "px-3 py-2" : "px-4 py-5"}`}>
            <Upload className={`shrink-0 text-muted-foreground transition-transform duration-200 ${drag ? "-translate-y-0.5 text-[#ffa500]" : ""} ${compact ? "size-4" : "size-6"}`} aria-hidden />
            <div className="text-sm">
              <p className="font-medium">{compact ? "Pilih foto bukti" : "Pilih foto atau seret ke sini"}</p>
              {!compact && <p className="text-xs text-muted-foreground">PNG, JPG, atau WebP, maksimal {maxMB} MB</p>}
            </div>
          </div>
        )}
      </div>

      {hint && !problem && (
        <p id={`${id}-hint`} className="text-[13px] text-muted-foreground">
          {hint}
        </p>
      )}
      {problem && (
        <p id={`${id}-err`} role="alert" className="ux-slide-in flex items-start gap-1.5 text-[13px] leading-snug text-[var(--state-danger-fg)]">
          <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden /> {problem}
        </p>
      )}
    </div>
  );
}
