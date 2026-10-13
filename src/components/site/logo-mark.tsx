import Image from "next/image";

/**
 * Logo HIMMAN untuk area hero (beranda dan panel login).
 * PNG-nya sudah bulat dan berlatar putih solid, jadi tidak perlu ring atau glow —
 * cukup drop-shadow halus supaya tidak "menempel" rata ke latar hitam.
 */
export function LogoMark({
  size = "lg",
  className = "",
}: {
  size?: "md" | "lg";
  className?: string;
}) {
  const dim = size === "lg" ? "size-48 sm:size-60 md:size-72" : "size-28 md:size-36";
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Image
        src="/logo-himman.png"
        alt="Lambang HIMMAN UKRI"
        width={320}
        height={320}
        priority
        className={`${dim} object-contain ux-pop drop-shadow-[0_0_40px_rgba(255,165,0,0.35)]`}
      />
    </div>
  );
}
