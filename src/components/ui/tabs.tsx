"use client";

import Link from "next/link";
import { cn } from "cn";

export type TabItem = {
  value: string;
  label: string;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
};

/**
 * Tab terkontrol — tanpa useSearchParams, aman dipakai dari Server Component.
 * Caller bertanggung jawab menentukan `value`.
 */
export function Tabs({
  items,
  value,
  ariaLabel = "Tab navigasi",
  className,
}: {
  items: TabItem[];
  value: string;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "scrollbar-thin flex overflow-x-auto border-b border-[var(--border-subtle)]",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.value === value;
        const base = cn(
          "relative inline-flex shrink-0 items-center gap-2 px-4 py-2.5 text-sm transition-colors",
          active ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground",
          active && "after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:rounded-full after:bg-[var(--brand-500)]",
        );
        const content = (
          <>
            <span>{item.label}</span>
            {item.badge !== undefined && (
              <span className="rounded-md bg-[var(--surface-2)] px-1.5 py-0.5 text-[10px] font-medium tabular-nums">
                {item.badge}
              </span>
            )}
          </>
        );
        return item.href ? (
          <Link key={item.value} href={item.href} role="tab" aria-selected={active} className={base}>
            {content}
          </Link>
        ) : (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={item.onClick}
            className={base}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
