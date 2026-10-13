import type { CSSProperties } from "react";

// Lima batang naik pada lambang HIMMAN (AD Pasal 3), dipakai sebagai lima departemen.
const BARS = [
  { label: "Humas", h: 38, bg: "#4a4a4a", fg: "#ffffff" },
  { label: "MedFo", h: 54, bg: "#6b6b6b", fg: "#ffffff" },
  { label: "PSDMO", h: 70, bg: "#8f8f8f", fg: "#000000" },
  { label: "Pendidikan", h: 85, bg: "#d4d4d4", fg: "#000000" },
  { label: "Kewirausahaan", h: 100, bg: "#ffa500", fg: "#000000" },
] as const;

export function BarMark({ decorative = false, className = "h-72 md:h-[26rem]" }: { decorative?: boolean; className?: string }) {
  return (
    <figure aria-hidden={decorative || undefined}>
      <div className={`flex ${className} items-end gap-2.5 border-b border-white/30 md:gap-3`}>
        {BARS.map((b, i) => {
          const common = {
            className: "s-bar flex flex-1 items-start justify-center rounded-t-sm",
            style: { height: `${b.h}%`, background: b.bg, color: b.fg, "--i": i } as CSSProperties,
          };
          const label = <span className="rotate-180 py-4 text-sm font-semibold [writing-mode:vertical-rl]">{b.label}</span>;
          return decorative ? (
            <div key={b.label} {...common}>{label}</div>
          ) : (
            <a key={b.label} href="#departemen" aria-label={`Departemen ${b.label}`} {...common}>{label}</a>
          );
        })}
      </div>
      <figcaption className="mt-3 text-xs text-white/60">
        Lima batang, lima departemen. Bentuknya diambil dari grafik batang pada lambang HIMMAN.
      </figcaption>
    </figure>
  );
}
