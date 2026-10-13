import { cn } from "cn";

const bar = "ux-skeleton rounded-sm";

/** Kerangka halaman saat data dimuat. Ukurannya meniru isi sebenarnya agar layar tidak melompat saat data tiba. */
export function PageSkeleton({ variant = "cards" }: { variant?: "cards" | "table" | "form" | "list" }) {
  return (
    <div role="status" aria-live="polite" aria-label="Memuat halaman" className="space-y-6">
      <span className="sr-only">Memuat halaman…</span>
      <div className="space-y-3">
        <div className={cn(bar, "h-1 w-14 bg-[#ffa500]/60")} />
        <div className={cn(bar, "h-8 w-56 max-w-full")} />
        <div className={cn(bar, "h-4 w-80 max-w-full")} />
      </div>

      {variant === "cards" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={cn(bar, "h-[104px]")} />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className={cn(bar, "h-56")} />
            <div className={cn(bar, "h-56")} />
          </div>
        </>
      )}

      {variant === "table" && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className={cn(bar, "h-10 w-64")} />
            <div className={cn(bar, "h-10 w-36")} />
          </div>
          <div className="space-y-px">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={cn(bar, "h-12")} />
            ))}
          </div>
        </div>
      )}

      {variant === "list" && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className={cn(bar, "h-64")} />
          ))}
        </div>
      )}

      {variant === "form" && (
        <div className="max-w-xl space-y-5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className={cn(bar, "h-4 w-28")} />
              <div className={cn(bar, "h-10")} />
            </div>
          ))}
          <div className={cn(bar, "h-10 w-40")} />
        </div>
      )}
    </div>
  );
}
