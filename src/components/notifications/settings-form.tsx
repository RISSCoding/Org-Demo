"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Check, Loader2, Mail, MessageCircle } from "lucide-react";
import { revokeEmailConsent, saveNotificationConsent, saveNotificationPreferences } from "@/actions/notifications";
import { alertErr, btnGhost, btnPrimary } from "@/lib/ui";

const WHATSAPP_ENABLED = false;

export type SettingsInitial = {
  // Consent
  email: boolean;
  whatsapp: boolean;
  emailAddress: string;
  whatsappNumber: string;
  emailConsentAt: string | null;
  emailRevokedAt: string | null;
  whatsappConsentAt: string | null;
  whatsappRevokedAt: string | null;
  // Preferences
  duesDue: boolean;
  eventReminder: boolean;
  committeeDecided: boolean;
  feedbackResponse: boolean;
  announcement: boolean;
  digestMode: "instant" | "daily";
  quietHoursStart: number | null;
  quietHoursEnd: number | null;
};

const PREF_ITEMS: { key: keyof Pick<SettingsInitial, "duesDue" | "eventReminder" | "committeeDecided" | "feedbackResponse" | "announcement">; label: string; desc: string }[] = [
  { key: "duesDue", label: "Iuran kas", desc: "Tagihan baru, pengingat, dan status verifikasi." },
  { key: "eventReminder", label: "Event", desc: "Pengingat event yang kamu ikuti." },
  { key: "committeeDecided", label: "Kepanitiaan", desc: "Hasil seleksi dan undangan rapat panitia." },
  { key: "feedbackResponse", label: "Aspirasi", desc: "Tanggapan dari Komisi III atas pesanmu." },
  { key: "announcement", label: "Pengumuman umum", desc: "Berita dan pengumuman dari pengurus." },
];

export function SettingsForm({ initial }: { initial: SettingsInitial }) {
  const [s, setS] = useState(initial);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const saveAll = () => {
    setError(null);
    start(async () => {
      try {
        // Simpan consent (kanal email)
        await saveNotificationConsent({
          inapp: true,
          email: s.email,
          whatsapp: WHATSAPP_ENABLED ? s.whatsapp : false,
          whatsappNumber: WHATSAPP_ENABLED && s.whatsapp ? s.whatsappNumber.trim() : undefined,
        });
        // Simpan preferensi (jenis notifikasi)
        await saveNotificationPreferences({
          duesDue: s.duesDue,
          eventReminder: s.eventReminder,
          committeeDecided: s.committeeDecided,
          feedbackResponse: s.feedbackResponse,
          announcement: s.announcement,
          digestMode: s.digestMode,
          quietHoursStart: s.quietHoursStart,
          quietHoursEnd: s.quietHoursEnd,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
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
    <div className="space-y-6">
      {/* ===== Section 1: Kirim ke mana ===== */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Kirim pengingat ke mana</h2>
          <p className="text-sm text-muted-foreground">
            Notifikasi di dalam aplikasi selalu aktif. Kamu bisa menambahkan email supaya tidak lupa hal penting.
          </p>
        </div>

        <div className="space-y-1 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] px-4 py-3">
          <p className="text-sm font-medium">Notifikasi di aplikasi</p>
          <p className="text-sm text-muted-foreground">
            Selalu aktif — muncul di bell icon setiap kali ada yang butuh perhatianmu.
          </p>
        </div>

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
                  <strong className="font-medium text-foreground">{s.emailAddress || "(email belum diisi)"}</strong>.
                </span>
              </span>
            </label>
            {s.emailConsentAt && s.email && (
              <p className="mt-2 flex items-center gap-1 text-xs text-[var(--state-success-fg)]">
                <Check className="size-3" aria-hidden /> Aktif sejak{" "}
                {new Date(s.emailConsentAt).toLocaleDateString("id-ID")}
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

        <div className="flex items-start gap-3 opacity-70">
          <MessageCircle className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
          <div className="flex-1">
            <p className="flex items-center gap-2 text-sm font-medium">
              WhatsApp
              <span className="rounded-md bg-[var(--surface-2)] px-2 py-0.5 text-xs font-medium text-muted-foreground">
                Segera hadir
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              Pengingat yang sama, tapi langsung ke WhatsApp.
            </p>
          </div>
        </div>
      </section>

      {/* ===== Section 2: Pengingat tentang apa ===== */}
      <section className="space-y-4 border-t border-[var(--border-subtle)] pt-6">
        <div>
          <h2 className="text-lg font-semibold">Pengingat tentang apa</h2>
          <p className="text-sm text-muted-foreground">
            Pilih jenis pemberitahuan yang ingin kamu terima. Matikan yang tidak perlu.
          </p>
        </div>

        <ul className="divide-y divide-[var(--border-subtle)]">
          {PREF_ITEMS.map(({ key, label, desc }) => (
            <li key={key} className="flex items-start gap-3 py-3">
              <input
                id={`pref-${key}`}
                type="checkbox"
                checked={s[key] as boolean}
                onChange={(e) => setS({ ...s, [key]: e.target.checked })}
                className="mt-0.5 size-4 accent-[#ffa500]"
              />
              <label htmlFor={`pref-${key}`} className="flex-1 cursor-pointer">
                <span className="block text-sm font-medium">{label}</span>
                <span className="block text-sm text-muted-foreground">{desc}</span>
              </label>
            </li>
          ))}
        </ul>

        <div className="space-y-2 pt-2">
          <p className="text-sm font-medium">Mode pengiriman</p>
          <p className="text-sm text-muted-foreground">
            Langsung: kirim segera. Ringkasan harian: digabung, dikirim sekali sehari.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["instant", "daily"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setS({ ...s, digestMode: m })}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  s.digestMode === m
                    ? "bg-[var(--interactive-active)] font-medium"
                    : "border border-[var(--border-default)] hover:bg-[var(--interactive-hover)]"
                }`}
              >
                {m === "instant" ? "Langsung" : "Ringkasan harian"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {error && (
        <p role="alert" className={alertErr}>
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden /> {error}
        </p>
      )}

      {/* ===== Satu tombol simpan ===== */}
      <div className="flex items-center justify-end gap-3 border-t border-[var(--border-subtle)] pt-5">
        {saved && (
          <span className="flex items-center gap-1 text-sm text-[var(--state-success-fg)]">
            <Check className="size-4" aria-hidden /> Tersimpan
          </span>
        )}
        <button type="button" disabled={pending} onClick={saveAll} className={btnPrimary}>
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {pending ? "Menyimpan…" : "Simpan semua perubahan"}
        </button>
      </div>
    </div>
  );
}
