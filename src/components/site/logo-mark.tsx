import { BrandMark } from "@/components/brand-mark";

/**
 * Logo brand untuk area hero. Pakai BrandMark SVG supaya tidak bergantung
 * pada file PNG yang spesifik organisasi.
 */
export function LogoMark({
  size = "lg",
  className = "",
}: {
  size?: "md" | "lg";
  className?: string;
}) {
  const s = size === "lg" ? 220 : 140;
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <span className="drop-shadow-[0_0_40px_rgba(255,165,0,0.25)]">
        <BrandMark size={s} />
      </span>
    </div>
  );
}
