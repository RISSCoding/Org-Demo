"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Check, Loader2, Mail, MessageCircle } from "lucide-react";
import { revokeEmailConsent, saveNotificationConsent } from "@/actions/notifications";
import { alertErr, btnGhost, btnPrimary, inputCls } from "@/lib/ui";

// Ubah ke true saat backend WA (Fonnte/Twilio) sudah siap produksi.
const WHATSAPP_ENABLED = false;

type Consent = {
  email: boolean;
  whatsapp: boolean;
  emailAddress: string;
  whatsappNumber: string;
  emailConsentAt: string | null;
  emailRevokedAt: string | null;
  whatsappConsentAt: string | null;
  whatsappRevokedAt: string | null;
};

export function ConsentPanel({ initial }: { initial: Consent }) {
  const [s, setS] = useState(initial);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const save = () => {
    setError(null);
    start(async () => {
      try {
        await saveNotificationConsent({
          inapp: true,
          email: s.email,
          whatsapp: WHATSAPP_ENABLED ? s.whatsapp : false,
          whatsappNumber: WHATSAPP_ENABLED && s.whatsapp ? s.whatsappNumber.trim() : undefined,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch {
        setError("Gagal menyimpan. Coba lagi.");
      }
    });
  };

  const revokeEmail = () => {
    start(async () => {
      await revokeEmailConsent();
      setS({ ...s, email: false });
    });
  };

  return (
    <div className="space-y-5">
      {/* Email */}
      <div className="space-y-3 border-b border-[var(--border-subtle)] pb-5">
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 size-5 shrink-0 text-[var(--gold-text)]" aria-hidden />
          <div className="flex-1">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={s.email}
                onChange={(e) => setS({ ...s, email: e.target.checked })}
                className="mt-0.5 size-4 accent-[#ffa500]"
              />
              <span>
                <span className="block text-sm font-medium">Email</span>
                <span className="block text-sm text-muted-foreground">
                  Pengingat iuran, hasil seleksi, dan event — dikirim ke{" "}
                  <strong className="font-medium text-foreground">
                    {s.emailAddress || "(email belum diisi)"}
                  </strong>
                  .
                </span>
              </span>
            </label>
            {s.emailConsentAt && (
              <p className="mt-2 flex items-center gap-1 text-xs text-[var(--state-success-fg)]">
                <Check className="size-3" aria-hidden /> Aktif sejak{" "}
                {new Date(s.emailConsentAt).toLocaleDateString("id-ID")}
              </p>
            )}
            {s.emailRevokedAt && !s.emailConsentAt && (
              <p className="mt-2 text-xs text-muted-foreground">
                Sebelumnya dicabut {new Date(s.emailRevokedAt).toLocaleDateString("id-ID")}.
              </p>
            )}
            {s.emailConsentAt && !s.email && (
              <button
                type="button"
                disabled={pending}
                onClick={revokeEmail}
                className={`${btnGhost} mt-1 -ml-3 text-[var(--state-danger-fg)]`}
              >
                Cabut persetujuan email
              </button>
            )}
          </div>
        </div>
      </div>

      {/* WhatsApp */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <MessageCircle
            className={`mt-0.5 size-5 shrink-0 ${
              WHATSAPP_ENABLED ? "text-[var(--gold-text)]" : "text-muted-foreground"
            }`}
            aria-hidden
          />
          <div className="flex-1">
            <label
              className={`flex items-start gap-3 ${
                WHATSAPP_ENABLED ? "cursor-pointer" : "cursor-not-allowed opacity-70"
              }`}
            >
              <input
                type="checkbox"
                checked={s.whatsapp}
                disabled={!WHATSAPP_ENABLED}
                onChange={(e) => setS({ ...s, whatsapp: e.target.checked })}
                className="mt-0.5 size-4 accent-[#ffa500] disabled:cursor-not-allowed"
              />
              <span>
                <span className="flex items-center gap-2 text-sm font-medium">
                  WhatsApp
                  {!WHATSAPP_ENABLED && (
                    <span className="rounded-md bg-[var(--surface-2)] px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      Segera hadir
                    </span>
                  )}
                </span>
                <span className="block text-sm text-muted-foreground">
                  Pengingat yang sama, tapi langsung ke WhatsApp. Bisa dimatikan kapan saja.
                </span>
              </span>
            </label>

            {WHATSAPP_ENABLED && s.whatsapp && (
              <input
                type="tel"
                value={s.whatsappNumber}
                onChange={(e) => setS({ ...s, whatsappNumber: e.target.value })}
                placeholder="081234567890"
                className={`${inputCls} mt-2 max-w-xs`}
              />
            )}

            {WHATSAPP_ENABLED && s.whatsappConsentAt && (
              <p className="mt-2 flex items-center gap-1 text-xs text-[var(--state-success-fg)]">
                <Check className="size-3" aria-hidden /> Aktif sejak{" "}
                {new Date(s.whatsappConsentAt).toLocaleDateString("id-ID")}
              </p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className={alertErr}>
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden /> {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1 text-sm text-[var(--state-success-fg)]">
            <Check className="size-4" aria-hidden /> Tersimpan
          </span>
        )}
        <button type="button" disabled={pending} onClick={save} className={btnPrimary}>
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {pending ? "Menyimpan…" : "Simpan"}
        </button>
      </div>
    </div>
  );
}
