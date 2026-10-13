import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "cn";

export type Crumb = { label: string; href?: string };

/**
 * Breadcrumb tunggal untuk header dashboard/admin.
 * Item terakhir selalu jadi current page dan di-truncate bila panjang.
 * Item di tengah opsional punya href (kalau tidak, ditampilkan sebagai teks pasif).
 */
export function Breadcrumb({
  items,
  label = "Breadcrumb",
  className,
}: {
  items: Crumb[];
  label?: string;
  className?: string;
}) {
  if (items.length === 0) return null;
  return (
    <nav aria-label={label} className={cn("min-w-0 flex-1 overflow-hidden", className)}>
      <ol className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex min-w-0 items-center gap-1.5">
              {i > 0 && (
                <ChevronRight className="size-3.5 shrink-0 text-[var(--text-subtle)]" aria-hidden />
              )}
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="truncate rounded-sm transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className={cn("truncate", last && "font-medium text-foreground")}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
