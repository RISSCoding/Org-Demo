"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Bell, X } from "lucide-react";

const STORAGE_KEY = "notification-consent-dismissed";
const REAPPEAR_DAYS = 14;
const EVENT = "notification-consent-change";

/** Berlangganan event internal + event `storage` antar tab. */
function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** `true` = banner harus tampil. Snapshot dibaca dari localStorage. */
function getSnapshot(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return true;
    const at = Number(raw);
    if (!Number.isFinite(at)) return true;
    const days = (Date.now() - at) / (1000 * 60 * 60 * 24);
    return days >= REAPPEAR_DAYS;
  } catch {
    return true;
  }
}

/** Server tidak punya localStorage → jangan render. Setelah hydration,
 *  React otomatis pakai getSnapshot dan banner muncul tanpa mismatch. */
function getServerSnapshot(): boolean {
  return false;
}

export function ConsentBanner() {
  const visible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!visible) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
      // Beri tahu subscriber supaya snapshot dibaca ulang.
      window.dispatchEvent(new Event(EVENT));
    } catch {
      // Diamkan; banner akan muncul lagi setelah refresh.
    }
  };

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
        aria-label="Tutup pengingat"
        className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-[var(--interactive-hover)] hover:text-foreground"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}
