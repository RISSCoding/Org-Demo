import "@/styles/site.css";
import { archivo, sourceSerif } from "@/lib/site-fonts";
import { SiteFooter } from "./site-footer";
import { SiteNav } from "./site-nav";

/** Bingkai bersama: navbar, konten, footer. `narrow` untuk halaman formulir pendek (mis. verifikasi sertifikat). */
export function SiteShell({ children, narrow = false }: { children: React.ReactNode; narrow?: boolean }) {
  return (
    <div className={`site ${archivo.variable} ${sourceSerif.variable} flex min-h-dvh flex-col`}>
      <a
        href="#isi"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-sm focus:bg-[#ffa500] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
      >
        Lewati ke konten
      </a>
      <SiteNav />
      <main id="isi" className={narrow ? "mx-auto w-full max-w-xl flex-1 px-6 py-12" : "flex-1"}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
