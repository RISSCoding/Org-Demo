import { BRAND } from "@/lib/brand";
import { BrandMark } from "@/components/brand-mark";

/** Logo + nama brand. Dipakai di header situs, panel login, dan sidebar. */
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <BrandMark size={compact ? 32 : 36} />
      {!compact && <span className="s-display text-base">{BRAND.short}</span>}
    </span>
  );
}
