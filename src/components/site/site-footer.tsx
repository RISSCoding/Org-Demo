import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { NAV, ORG } from "@/lib/site-content";
import { container } from "@/lib/site-ui";

export function SiteFooter() {
  return (
    <footer className="bg-black text-white">
      <div className={`${container} grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]`}>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <BrandMark size={44} />
            <p className="s-display text-lg">{ORG.short}</p>
          </div>
          <p className="max-w-sm text-sm text-white/70">
            {ORG.name}, {ORG.univ}.
          </p>
          <address className="max-w-sm text-sm not-italic text-white/70">{ORG.address}</address>
        </div>

        <nav aria-label="Jelajahi" className="space-y-3 text-sm">
          <p className="font-semibold">Jelajahi</p>
          <ul className="space-y-2 text-white/70">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="hover:text-white">{n.label}</Link>
              </li>
            ))}
            <li>
              <Link href="/verify-member" className="hover:text-white">Verifikasi anggota</Link>
            </li>
            <li>
              <Link href="/verify-certificate" className="hover:text-white">Verifikasi sertifikat</Link>
            </li>
            <li>
              <Link href="/bug-report" className="hover:text-white">Laporkan masalah teknis</Link>
            </li>
          </ul>
        </nav>
</div>
      <div className="border-t border-white/10">
        <p className={`${container} py-5 text-xs text-white/50`}>© {new Date().getFullYear()} {ORG.short}</p>
      </div>
    </footer>
  );
}
