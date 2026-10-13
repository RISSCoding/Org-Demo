"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Spinner } from "@/components/ui/spinner";

/**
 * Tombol kirim yang meminta konfirmasi lewat dialog sebelum formulir dikirim.
 * Nama dan nilai tombol ikut terkirim (mis. decision=REJECTED), seperti tombol biasa.
 */
export function ConfirmSubmit({
  message,
  title = "Konfirmasi tindakan",
  confirmLabel,
  tone = "danger",
  className,
  name,
  value,
  children,
}: {
  message: string;
  title?: string;
  confirmLabel?: string;
  tone?: "danger" | "default";
  className?: string;
  name?: string;
  value?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const { pending, data } = useFormStatus();
  const busy = pending && (!name || data?.get(name) === value);

  return (
    <>
      <button
        ref={ref}
        type="submit"
        name={name}
        value={value}
        disabled={pending}
        aria-busy={busy || undefined}
        aria-haspopup="dialog"
        className={className}
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
      >
        {busy && <Spinner />}
        {children}
      </button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={message}
        confirmLabel={confirmLabel ?? (typeof children === "string" ? children : "Ya, lanjutkan")}
        tone={tone}
        onConfirm={() => {
          setOpen(false);
          const b = ref.current;
          b?.form?.requestSubmit(b);
        }}
      />
    </>
  );
}
