"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { btnDanger, btnLine, btnPrimary } from "@/lib/ui";

/**
 * Pengganti window.confirm(): bisa dibaca pembaca layar, fokus terkunci di dalam,
 * Esc menutup, dan tombol aman (Batal) menerima fokus lebih dulu.
 * Judul dan tombol konfirmasi harus menyebut tindakannya ("Hapus transaksi"), bukan "Ya/OK".
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Ya, lanjutkan",
  cancelLabel = "Batal",
  tone = "danger",
  pending = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
  pending?: boolean;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg leading-snug">{title}</DialogTitle>
          {description && <DialogDescription className="text-sm leading-relaxed">{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <button type="button" className={btnLine} onClick={() => onOpenChange(false)} disabled={pending}>
            {cancelLabel}
          </button>
          <button type="button" className={tone === "danger" ? btnDanger : btnPrimary} onClick={onConfirm} disabled={pending}>
            {pending && <Spinner />}
            {confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
