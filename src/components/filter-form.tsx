"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";
import { Spinner } from "@/components/ui/spinner";
import { startNavProgress } from "@/components/ux/nav-progress";

/**
 * Formulir saring/cari yang langsung bekerja: pilihan berubah atau mengetik (jeda 350 ms)
 * memperbarui hasil tanpa memuat ulang seluruh halaman dan tanpa tombol "Terapkan".
 * Tanpa JavaScript tetap berfungsi sebagai formulir GET biasa.
 */
export function FilterForm({
  action,
  className,
  children,
}: {
  action: string;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const form = useRef<HTMLFormElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function run() {
    if (!form.current) return;
    const params = new URLSearchParams();
    for (const [k, v] of new FormData(form.current)) {
      if (typeof v === "string" && v.trim()) params.set(k, v.trim());
    }
    const qs = params.toString();
    startNavProgress();
    start(() => router.replace(qs ? `${action}?${qs}` : action, { scroll: false }));
  }

  return (
    <form
      ref={form}
      action={action}
      method="get"
      className={className}
      aria-busy={pending || undefined}
      onSubmit={(e) => {
        e.preventDefault();
        if (timer.current) clearTimeout(timer.current);
        run();
      }}
      onChange={(e) => {
        const t = e.target;
        if (timer.current) clearTimeout(timer.current);
        if (t instanceof HTMLInputElement && !["checkbox", "radio", "date", "month"].includes(t.type)) {
          timer.current = setTimeout(run, 350);
        } else {
          run();
        }
      }}
    >
      {children}
      <noscript>
        <button type="submit" className="h-10 rounded-sm bg-[#ffa500] px-4 text-sm font-semibold text-black">Terapkan</button>
      </noscript>
      <span role="status" aria-live="polite" className="inline-flex h-10 items-center gap-2 text-sm text-muted-foreground">
        {pending && (
          <>
            <Spinner /> Memperbarui…
          </>
        )}
      </span>
    </form>
  );
}
