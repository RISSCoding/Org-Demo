import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "cn";

/**
 * Tautan "Kembali" konsisten di halaman detail.
 * Format: ikon panah kiri + teks kecil + hover.
 */
export function BackLink({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
        className,
      )}
    >
      <ArrowLeft className="size-4" aria-hidden />
      {label}
    </Link>
  );
}
