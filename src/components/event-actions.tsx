"use client";

import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cancelRegistration, registerForEvent } from "@/actions/events";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { alertErr, btnLine, btnPrimary } from "@/lib/ui";

export function EventActions({
  eventId,
  registered,
  canRegister,
  disabledReason,
}: {
  eventId: string;
  registered: boolean;
  canRegister: boolean;
  disabledReason?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, done: string) =>
    start(async () => {
      setError(null);
      const r = await fn();
      if (r.ok) toast.add({ title: done, type: "success" });
      else setError(r.error ?? "Terjadi kesalahan. Coba lagi.");
      setConfirming(false);
      router.refresh();
    });

  return (
    <div className="space-y-2">
      {registered ? (
        <button type="button" disabled={pending} className={btnLine} onClick={() => setConfirming(true)}>
          Batalkan pendaftaran
        </button>
      ) : (
        <button
          type="button"
          disabled={pending || !canRegister}
          aria-busy={pending || undefined}
          className={btnPrimary}
          onClick={() => run(() => registerForEvent(eventId), "Kamu terdaftar. Tiket QR muncul di halaman ini.")}
        >
          {pending && <Spinner />}
          {pending ? "Mendaftarkan…" : "Daftar event"}
        </button>
      )}
      {!registered && !canRegister && disabledReason && <p className="text-sm text-muted-foreground">{disabledReason}</p>}
      {error && (
        <p role="alert" className={alertErr}>
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden /> {error}
        </p>
      )}
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Batalkan pendaftaran event ini?"
        description="Tiket QR-mu tidak berlaku lagi. Kamu bisa mendaftar ulang selama kuota masih ada."
        confirmLabel="Ya, batalkan pendaftaran"
        cancelLabel="Tetap terdaftar"
        pending={pending}
        onConfirm={() => run(() => cancelRegistration(eventId), "Pendaftaran dibatalkan.")}
      />
    </div>
  );
}
