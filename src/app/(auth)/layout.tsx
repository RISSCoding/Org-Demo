import Link from "next/link";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app grid min-h-dvh lg:grid-cols-2">
      <aside className="hidden flex-col justify-between gap-10 bg-black p-10 text-white lg:flex">
        <Link href="/" aria-label="Ke beranda">
          <Brand />
        </Link>
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="h-1 w-14 bg-[#ffa500]" aria-hidden />
            <p className="s-display max-w-md text-3xl">Satu portal untuk seluruh kegiatan himpunan.</p>
            <p className="s-serif max-w-md text-white/70">
              Kartu anggota digital, event dan sertifikat, iuran kas yang transparan, dan arsip surat dalam satu tempat.
            </p>
          </div>
        </div>
        <p className="text-xs text-white/50">© {new Date().getFullYear()} HIMMAN UKRI</p>
      </aside>
      <main className="relative flex items-center justify-center p-6">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
