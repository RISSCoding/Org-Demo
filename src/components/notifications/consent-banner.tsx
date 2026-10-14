"use client";

import Link from "next/link";
import { useSyncExternalStore, useState } from "react";
import { Bell, Check, X } from "lucide-react";

const STORAGE_KEY = "notification-consent-dismissed";
const REAPPEAR_DAYS = 14;
const EVENT = "notification-consent-change";

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function getSnapshot(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return true;
    const at = Number(raw);
    if (!Number.isFinite(at)) return true;
    return (Date.now() - at) / (1000 * 60 * 60 * 24) >= REAPPEAR_DAYS;
  } catch {
    return true;
  }
}

function getServerSnapshot(): boolean {
  return false;
}

export function ConsentBanner() {
  const visible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [justDismissed, setJustDismissed] = useState(false);

  if (!visible && !justDismissed) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
      window.dispatchEvent(new Event(EVENT));
      setJustDismissed(true);
      // Kembalikan ke `null` setelah 4 detik supaya banner benar-benar hilang.
      setTimeout(() => setJustDismissed(false), 4000);
    } catch {
      // localStorage diblokir — biarkan banner tetap tampil.
    }
  };

  // Feedback singkat setelah user menutup pengingat.
  if (justDismissed) {
    return (
      <div className="flex items-center gap-2.5 rounded-md border border-[var(--state-success-border)] bg-[var(--state-success-bg)] px-3 py-2 text-sm text-[var(--state-success-fg)]">
        <Check className="size-4 shrink-0" aria-hidden />
        <p className="min-w-0 flex-1 truncate">
          Pengingat disembunyikan 14 hari.{" "}
          <Link
            href="/dashboard/settings/notifications"
            className="font-medium underline underline-offset-4 hover:no-underline"
          >
            Buka Notifikasi
          </Link>{" "}
          untuk mengaktifkan email kapan saja.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 rounded-md border border-[var(--border-default)] bg-[var(--surface-2)] px-3 py-2 text-sm">
      <Bell className="size-4 shrink-0 text-[var(--gold-text)]" aria-hidden />

      <p className="min-w-0 flex-1 truncate">
        <span className="font-medium">Aktifkan pengingat email</span>
        <span className="hidden text-muted-foreground sm:inline">
          {" "}— supaya tidak lupa iuran dan hasil seleksi.
        </span>
      </p>

      <Link
        href="/dashboard/settings/notifications"
        className="shrink-0 rounded-md bg-[var(--gold)] px-2.5 py-1 text-xs font-semibold text-black transition-opacity hover:opacity-90"
      >
        Atur
      </Link>

      <button
        type="button"
        onClick={dismiss}
        aria-label="Sembunyikan pengingat selama 14 hari"
        title="Sembunyikan selama 14 hari"
        className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-[var(--interactive-hover)] hover:text-foreground"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}
