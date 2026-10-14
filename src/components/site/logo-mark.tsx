import { BrandMark } from "@/components/brand-mark";

/**
 * Logo brand untuk hero. Ukuran responsif via CSS:
 * - HP: ~160px
 * - Desktop: ~220px
 */
export function LogoMark({
  size = "lg",
  className = "",
}: {
  size?: "md" | "lg";
  className?: string;
}) {
  const px =
    size === "lg"
      ? "clamp(160px, 40vw, 220px)"
      : "clamp(100px, 22vw, 140px)";
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative" style={{ width: px, height: px }}>
        <div
          aria-hidden
          className="absolute inset-0 -z-10 rounded-full bg-[#ffa500]/15 blur-3xl"
        />
        {/* size={0} → BrandMark pakai className (size-full), bukan px default. */}
        <BrandMark size={0} className="size-full" />
      </div>
    </div>
  );
}
