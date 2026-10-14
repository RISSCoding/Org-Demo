import { BRAND } from "@/lib/brand";

/**
 * Logo brand sebagai SVG.
 * Ukuran bisa lewat `size` (px) atau `className` (mis. `size-full` untuk
 * mengisi container induknya).
 */
export function BrandMark({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const style = size > 0 ? { width: size, height: size } : undefined;
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-full ${className}`}
      style={style}
      aria-label={BRAND.short}
      role="img"
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "100%", display: "block" }}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="48" fill="#ffa500" />
        <circle cx="50" cy="50" r="38" fill="#0a0a0a" />
        <text
          x="50"
          y="58"
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="800"
          fontSize="30"
          fill="#ffffff"
        >
          {BRAND.logoInitials}
        </text>
      </svg>
    </span>
  );
}
