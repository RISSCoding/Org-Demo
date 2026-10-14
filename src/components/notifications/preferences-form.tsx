"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { saveNotificationPreferences } from "@/actions/notifications";
import { btnPrimary } from "@/lib/ui";

type Prefs = {
  duesDue: boolean;
  eventReminder: boolean;
  committeeDecided: boolean;
  feedbackResponse: boolean;
  announcement: boolean;
  digestMode: "instant" | "daily";
  quietHoursStart: number | null;
  quietHoursEnd: number | null;
};

const ITEMS: { key: keyof Prefs; label: string; desc: string }[] = [
  { key: "duesDue", label: "Iuran kas", desc: "Tagihan baru, pengingat, dan status verifikasi." },
  { key: "eventReminder", label: "Event", desc: "Pengingat event yang kamu ikuti." },
  { key: "committeeDecided", label: "Kepanitiaan", desc: "Hasil seleksi dan undangan rapat panitia." },
  { key: "feedbackResponse", label: "Aspirasi", desc: "Tanggapan dari Komisi III atas pesanmu." },
  { key: "announcement", label: "Pengumuman umum", desc: "Berita dan pengumuman dari pengurus." },
];

export function PreferencesForm({ initial }: { initial: Prefs }) {
  const [prefs, setPrefs] = useState(initial);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  const save = () => {
    start(async () => {
      await saveNotificationPreferences({
        duesDue: prefs.duesDue,
        eventReminder: prefs.eventReminder,
        committeeDecided: prefs.committeeDecided,
        feedbackResponse: prefs.feedbackResponse,
        announcement: prefs.announcement,
        digestMode: prefs.digestMode,
        quietHoursStart: prefs.quietHoursStart,
        quietHoursEnd: prefs.quietHoursEnd,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <div className="space-y-5">
      <ul className="divide-y divide-[var(--border-subtle)]">
        {ITEMS.map(({ key, label, desc }) => (
          <li key={key} className="flex items-start gap-3 py-3">
            <input
              id={`pref-${key}`}
              type="checkbox"
              checked={prefs[key] as boolean}
              onChange={(e) => setPrefs({ ...prefs, [key]: e.target.checked })}
              className="mt-0.5 size-4 accent-[#ffa500]"
            />
            <label htmlFor={`pref-${key}`} className="flex-1 cursor-pointer">
              <span className="block text-sm font-medium">{label}</span>
              <span className="block text-sm text-muted-foreground">{desc}</span>
            </label>
          </li>
        ))}
      </ul>

      <div className="border-t border-[var(--border-subtle)] pt-4">
        <p className="text-sm font-medium">Mode pengiriman</p>
        <p className="text-sm text-muted-foreground">
          Langsung: kirim segera. Ringkasan harian: digabung, dikirim sekali sehari jam 08:00.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["instant", "daily"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setPrefs({ ...prefs, digestMode: m })}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                prefs.digestMode === m
                  ? "bg-[var(--interactive-active)] font-medium"
                  : "border border-[var(--border-default)] hover:bg-[var(--interactive-hover)]"
              }`}
            >
              {m === "instant" ? "Langsung" : "Ringkasan harian"}
            </button>
          ))}
        </div>
      </div>

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
