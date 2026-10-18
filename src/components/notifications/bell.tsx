"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell as BellIcon, CheckCheck, Inbox, X } from "lucide-react";
import { markAllNotificationsRead, markNotificationRead } from "@/actions/notifications";
import { timeAgo } from "@/lib/notifications-format";

type Item = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

export function NotificationBell() {
  const router = useRouter();
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastFetchRef = useRef(0);
  const THROTTLE_MS = 5000;

  const refresh = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - lastFetchRef.current < THROTTLE_MS) return;
    lastFetchRef.current = now;
    try {
      const [c, r] = await Promise.all([
        fetch("/api/notifications/unread-count").then((x) => x.json()),
        fetch("/api/notifications/recent").then((x) => x.json()),
      ]);
      setUnread(c.count ?? 0);
      setItems(r.items ?? []);
    } catch {
      // Diamkan
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = () => { if (!cancelled) refresh(); };
    const initial = setTimeout(run, 0);
    const onFocus = () => run();
    const onVis = () => { if (document.visibilityState === "visible") run(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      clearTimeout(initial);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleToggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) await refresh(true);
  };

  const handleMarkAll = async () => {
    setBusy(true);
    await markAllNotificationsRead();
    await refresh(true);
    setBusy(false);
  };

  const handleOpenItem = async (item: Item) => {
    setOpen(false);
    if (!item.readAt) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, readAt: new Date().toISOString() } : i)),
      );
      setUnread((n) => Math.max(0, n - 1));
      markNotificationRead(item.id).catch(() => {});
    }
    router.push(item.link ?? "/dashboard/notifications");
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={unread > 0 ? `${unread} notifikasi baru` : "Notifikasi"}
        aria-expanded={open}
        onClick={handleToggle}
        className="relative grid size-9 place-items-center rounded-md transition-colors hover:bg-[var(--interactive-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
      >
        <BellIcon className="size-4" aria-hidden />
        {unread > 0 && (
          <span
            aria-hidden
            className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#ffa500] px-1 text-[10px] font-bold leading-none text-black"
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifikasi"
          className="
            fixed left-4 right-4 top-[72px] z-[100] overflow-hidden rounded-lg border border-[var(--border-default)] bg-[var(--surface-1)] shadow-lg
            sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mx-0 sm:mt-2 sm:w-[380px] sm:origin-top-right sm:shadow-xl
          "
        >
          <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] bg-[var(--surface-2)] px-4 py-3">
            <p className="text-sm font-semibold">Notifikasi</p>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleMarkAll}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[var(--text-brand)] hover:underline disabled:opacity-50"
                >
                  <CheckCheck className="size-3.5" aria-hidden />
                  Tandai semua
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup"
                className="grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-[var(--interactive-hover)] hover:text-foreground sm:hidden"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          </div>

          <div className="max-h-[min(400px,60dvh)] overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
                <span className="grid size-10 place-items-center rounded-full bg-[var(--surface-2)] text-muted-foreground">
                  <Inbox className="size-5" aria-hidden />
                </span>
                <p className="text-sm font-medium text-foreground">Belum ada notifikasi</p>
                <p className="text-xs text-muted-foreground">
                  Info iuran, event, dan hasil seleksi akan muncul di sini.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--border-subtle)]">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleOpenItem(item)}
                      className={`group block w-full px-4 py-3 text-left transition-colors hover:bg-[var(--interactive-hover)] ${
                        item.readAt ? "opacity-80" : "bg-[#ffa500]/[0.03]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {!item.readAt ? (
                          <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#ffa500]" />
                        ) : (
                          <span className="mt-1.5 size-1.5 shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm leading-snug ${!item.readAt ? "font-semibold text-foreground" : "text-foreground/80"}`}>
                            {item.title}
                          </p>
                          {item.body && (
                            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{item.body}</p>
                          )}
                          <p className="mt-1.5 text-[11px] tabular-nums text-muted-foreground">{timeAgo(item.createdAt)}</p>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-[var(--border-subtle)] bg-[var(--surface-2)]">
            <Link
              href="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-center text-xs font-semibold text-[var(--text-brand)] transition-colors hover:bg-[var(--interactive-hover)]"
            >
              Lihat semua notifikasi
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
