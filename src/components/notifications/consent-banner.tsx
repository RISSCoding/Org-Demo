"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";

const STORAGE_KEY = "notification-consent-dismissed";
const REAPPEAR_DAYS = 14;

export function ConsentBanner() {
  // `mounted=false` di server DAN di client saat render pertama.
  // Efek baru membaca localStorage setelah mount, supaya tidak ada
  // hydration mismatch (server render null, client render null dulu,
  // baru banner muncul setelah effect).
  const [mounted, setMounted] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const at = Number(raw);
      if (!Number.isFinite(at)) return;
      const days = (Date.now() - at) / (1000 * 60 * 60 * 24);
      if (days < REAPPEAR_DAYS) setHidden(true);
    } catch {
      // localStorage bisa diblokir; anggap belum di-dismiss.
    }
  }, []);

  if (!mounted || hidden) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // Diamkan
    }
    setHidden(true);
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
