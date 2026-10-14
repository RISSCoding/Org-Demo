"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell as BellIcon } from "lucide-react";
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

  // Throttle 5 detik: cegah spam klik / hot-reload dev / burst.
  // Bukan untuk menghemat normal load (yang sudah ringan), tapi jaring pengaman.
  const THROTTLE_MS = 5_000;

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
      // Diamkan — coba lagi saat event berikutnya.
    }
  }, []);

  // Fetch awal + saat tab kembali aktif. Tidak ada polling berkala:
  // notifikasi bukan real-time, dan polling tiap 30 detik membebani server.
  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (!cancelled) refresh();
    };

    const initial = setTimeout(run, 0);

    const onFocus = () => run();
    const onVis = () => {
      if (document.visibilityState === "visible") run();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelled = true;
      clearTimeout(initial);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [refresh]);

  // Tutup panel saat klik di luar.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const handleToggle = async () => {
    const next = !open;
    setOpen(next);
    // Saat membuka, selalu refresh supaya data terbaru.
    if (next) await refresh();
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
          aria-label="Notifikasi terbaru"
          className="absolute right-0 top-full z-50 mt-2 w-80 origin-top-right rounded-md border border-[var(--border-default)] bg-[var(--surface-3)] shadow-lg"
        >
          <header className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] px-4 py-2.5">
            <p className="text-sm font-semibold">Notifikasi</p>
            {unread > 0 && (
              <button
                type="button"
                disabled={busy}
                onClick={handleMarkAll}
                className="text-xs font-medium text-[var(--text-brand)] hover:underline disabled:opacity-50"
              >
                Tandai semua dibaca
              </button>
            )}
          </header>

          <div className="scrollbar-thin max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                Belum ada notifikasi.
              </p>
            ) : (
              <ul className="divide-y divide-[var(--border-subtle)]">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleOpenItem(item)}
                      className={`block w-full px-4 py-3 text-left transition-colors hover:bg-[var(--interactive-hover)] ${
                        item.readAt ? "" : "bg-[#ffa500]/5"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {!item.readAt && (
                          <span
                            aria-hidden
                            className="mt-1.5 size-2 shrink-0 rounded-full bg-[#ffa500]"
                          />
                        )}
                        <div className={`min-w-0 flex-1 ${item.readAt ? "pl-4" : ""}`}>
                          <p className="text-sm font-medium leading-snug">{item.title}</p>
                          {item.body && (
                            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                              {item.body}
                            </p>
                          )}
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {timeAgo(item.createdAt)}
                          </p>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <footer className="border-t border-[var(--border-subtle)]">
            <Link
              href="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-center text-xs font-medium text-[var(--text-brand)] hover:bg-[var(--interactive-hover)]"
            >
              Lihat semua
            </Link>
          </footer>
        </div>
      )}
    </div>
  );
}
