import { BRAND } from "@/lib/brand";

/**
 * Logo brand sebagai SVG. Kalau `public/logo.png` ada, pakai itu.
 * Kalau tidak, render inisial dalam lingkaran kuning — placeholder netral.
 *
 * Ukuran mengikuti prop `size` (px) atau kelas `className`.
 */
export function BrandMark({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const s = size;
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-full ${className}`}
      style={{ width: s, height: s }}
      aria-label={BRAND.short}
      role="img"
    >
      <svg
        viewBox="0 0 100 100"
        width={s}
        height={s}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Lingkaran luar kuning */}
        <circle cx="50" cy="50" r="48" fill="#ffa500" />
        {/* Lingkaran dalam gelap */}
        <circle cx="50" cy="50" r="38" fill="#0a0a0a" />
        {/* Inisial */}
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
