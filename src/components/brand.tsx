import Image from "next/image";

/** Lambang dan nama himpunan, sama seperti di navbar situs publik. */
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Image src="/logo-himman.png" alt="" width={36} height={36} className="size-9 shrink-0" />
      {!compact && <span className="s-display text-base">HIMMAN UKRI</span>}
    </div>
  );
}
