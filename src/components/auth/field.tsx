"use client";

import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";
import { inputCls } from "@/lib/ui";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  errors?: string[];
  hint?: string;
};

/** Pesan galat kolom: ikon + teks, dibaca pembaca layar lewat aria-describedby. */
export function FieldError({ id, list }: { id?: string; list?: string[] }) {
  if (!list?.length) return null;
  return (
    <div id={id} className="space-y-0.5">
      {list.map((e) => (
        <p key={e} className="ux-slide-in flex items-start gap-1.5 text-[13px] leading-snug text-red-600 dark:text-red-400">
          <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden /> {e}
        </p>
      ))}
    </div>
  );
}

export function Field({ label, name, errors, hint, type, required, ...rest }: Props) {
  const uid = useId();
  const hintId = `${uid}-hint`;
  const errId = `${uid}-err`;
  const isPassword = type === "password";
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);
  const hasErr = !!errors?.length;
  const describedBy = [hasErr ? errId : null, hint && !hasErr ? hintId : null, caps ? `${uid}-caps` : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={isPassword && show ? "text" : type}
          required={required}
          className={`${inputCls} ${isPassword ? "pr-11" : ""}`}
          aria-invalid={hasErr || undefined}
          aria-describedby={describedBy}
          onKeyUp={isPassword ? (e) => setCaps(e.getModifierState("CapsLock")) : undefined}
          onBlur={isPassword ? () => setCaps(false) : undefined}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
            aria-pressed={show}
            className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
      {caps && (
        <p id={`${uid}-caps`} role="status" className="ux-slide-in text-[13px] text-[var(--gold-text)]">
          Caps Lock sedang aktif.
        </p>
      )}
      {hint && !hasErr && (
        <p id={hintId} className="text-[13px] leading-snug text-muted-foreground">
          {hint}
        </p>
      )}
      <FieldError id={errId} list={errors} />
    </div>
  );
}
