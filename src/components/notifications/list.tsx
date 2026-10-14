"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import {
  deleteNotification,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/actions/notifications";
import { timeAgo } from "@/lib/notifications-format";
import { EmptyState } from "@/components/ui/empty-state";
import { btnGhost, btnLine, cardCls } from "@/lib/ui";

type Item = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

export function NotificationList({
  items: initial,
  unreadOnly,
}: {
  items: Item[];
  unreadOnly: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState(false);

  const unreadCount = items.filter((i) => !i.readAt).length;

  const handleOpen = async (item: Item) => {
    if (!item.readAt) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, readAt: new Date().toISOString() } : i)),
      );
      markNotificationRead(item.id).catch(() => {});
    }
    if (item.link) router.push(item.link);
  };

  const handleMarkAll = async () => {
    setBusy(true);
    await markAllNotificationsRead();
    setItems((prev) => prev.map((i) => ({ ...i, readAt: i.readAt ?? new Date().toISOString() })));
    setBusy(false);
  };

  const handleDelete = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await deleteNotification(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1">
          <Link
            href="/dashboard/notifications"
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
              !unreadOnly ? "bg-[var(--interactive-active)] font-medium" : "hover:bg-[var(--interactive-hover)]"
            }`}
          >
            Semua
          </Link>
          <Link
            href="/dashboard/notifications?filter=unread"
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
              unreadOnly ? "bg-[var(--interactive-active)] font-medium" : "hover:bg-[var(--interactive-hover)]"
            }`}
          >
            Belum dibaca {unreadCount > 0 && `(${unreadCount})`}
          </Link>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            disabled={busy}
            onClick={handleMarkAll}
            className={`${btnLine} h-9`}
          >
            <CheckCheck className="size-4" aria-hidden /> Tandai semua dibaca
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={unreadOnly ? "Tidak ada yang belum dibaca" : "Belum ada notifikasi"}
          description={
            unreadOnly
              ? "Semua notifikasi sudah kamu baca."
              : "Notifikasi tentang iuran, event, dan aktivitas lain akan muncul di sini."
          }
        />
      ) : (
        <ul className={`${cardCls} divide-y divide-[var(--border-subtle)]`}>
          {items.map((item) => (
            <li key={item.id} className="group relative">
              <button
                type="button"
                onClick={() => handleOpen(item)}
                className={`block w-full px-4 py-3.5 text-left transition-colors hover:bg-[var(--interactive-hover)] ${
                  item.readAt ? "" : "bg-[#ffa500]/5"
                }`}
              >
                <div className="flex items-start gap-3">
                  {!item.readAt && (
                    <span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-full bg-[#ffa500]" />
                  )}
                  <div className={`min-w-0 flex-1 ${item.readAt ? "pl-5" : ""}`}>
                    <p className="text-sm font-medium leading-snug">{item.title}</p>
                    {item.body && (
                      <p className="mt-0.5 text-sm text-muted-foreground">{item.body}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">{timeAgo(item.createdAt)}</p>
                  </div>
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label="Hapus notifikasi"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(item.id);
                      }
                    }}
                    className={`${btnGhost} pointer-events-auto absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground opacity-0 transition-opacity hover:text-[var(--state-danger-fg)] group-hover:opacity-100 focus:opacity-100`}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
