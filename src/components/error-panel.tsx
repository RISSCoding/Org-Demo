"use client";

import Link from "next/link";
import { RotateCw } from "lucide-react";
import { useEffect } from "react";
import { btnLine, btnPrimary } from "@/lib/ui";

/** Tampilan galat yang memberi arah: apa yang terjadi, apa yang bisa dicoba, dan kode untuk dilaporkan. */
export function ErrorPanel({
  error,
  retry,
  backHref,
  backLabel,
}: {
  error: Error & { digest?: string };
  retry: () => void;
  backHref: string;
  backLabel: string;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="ux-enter mx-auto max-w-lg space-y-5 py-12">
      <div className="h-1 w-14 bg-[#ffa500]" aria-hidden />
      <h1 className="s-display text-3xl text-[var(--s-head)]">Halaman ini belum bisa dimuat</h1>
      <p className="s-serif text-[var(--s-muted)]">
        Ada gangguan saat menyiapkan halaman. Data kamu aman. Coba muat ulang; kalau masih gagal, tunggu sebentar atau
        hubungi pengurus dan sebutkan kode di bawah ini.
      </p>
      {error.digest && (
        <p className="inline-block select-all border border-[var(--s-line)] bg-[var(--s-panel)] px-3 py-1.5 font-mono text-sm">
          Kode: {error.digest}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => retry()} className={btnPrimary}>
          <RotateCw className="size-4" aria-hidden /> Muat ulang halaman
        </button>
        <Link href={backHref} className={btnLine}>
          {backLabel}
        </Link>
      </div>
    </div>
  );
}
