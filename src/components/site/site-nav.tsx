"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { NAV } from "@/lib/site-content";
import { btnOrange, container } from "@/lib/site-ui";

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  // Bayangan tipis muncul setelah halaman digulir, sebagai tanda navbar melayang di atas konten.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Esc menutup menu seluler dan mengembalikan fokus ke tombolnya.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={`sticky top-0 z-40 border-b border-white/10 bg-black text-white transition-shadow duration-slow ${scrolled ? "shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)]" : ""}`}>
      <div className={`${container} flex h-16 items-center justify-between gap-4`}>
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Image src="/logo-himman.png" alt="" width={36} height={36} className="size-9" priority />
          <span className="s-display text-base">HIMMAN UKRI</span>
        </Link>

        <nav aria-label="Menu utama" className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={active(n.href) ? "page" : undefined}
              className="ux-underline mx-1 px-2 py-2 text-sm text-white/80 transition-colors hover:text-white aria-[current=page]:font-medium aria-[current=page]:text-white"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link href="/login" className="hidden rounded-sm px-3 py-2 text-sm transition-colors hover:bg-white/10 sm:block">
            Masuk
          </Link>
          <Link href="/register" className={`${btnOrange} hidden h-9 sm:inline-flex`}>
            Daftar
          </Link>
          <button
            ref={toggle}
            type="button"
            className="relative grid size-11 place-items-center rounded-sm transition-colors hover:bg-white/10 lg:hidden"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen((v) => !v)}
          >
            <Menu className={`absolute size-5 transition-[transform,opacity] duration-slow ease-[var(--ease-out)] ${open ? "rotate-90 scale-50 opacity-0" : ""}`} />
            <X className={`absolute size-5 transition-[transform,opacity] duration-slow ease-[var(--ease-out)] ${open ? "" : "-rotate-90 scale-50 opacity-0"}`} />
          </button>
        </div>
      </div>

      {/* Tinggi menu dianimasikan lewat grid-rows (0fr ke 1fr), tanpa mengukur tinggi dengan JavaScript. */}
      <div
        className={`grid transition-[grid-template-rows] duration-slow ease-[var(--ease-out)] lg:hidden ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <nav id="menu-mobile" aria-label="Menu utama" inert={!open} className="overflow-hidden">
          <ul className={`${container} flex flex-col border-t border-white/10 py-2`}>
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  onClick={() => setOpen(false)}
                  aria-current={active(n.href) ? "page" : undefined}
                  className={`block border-l-2 py-3.5 pl-4 text-base transition-[border-color,padding] duration-base hover:pl-5 ${
                    active(n.href) ? "border-[#ffa500] font-medium" : "border-transparent text-white/80"
                  }`}
                >
                  {n.label}
                </Link>
              </li>
            ))}
            <li className="flex gap-3 py-4">
              <Link href="/login" onClick={() => setOpen(false)} className="flex h-11 flex-1 items-center justify-center rounded-sm border border-white/40 text-sm font-semibold transition-colors hover:bg-white/10">
                Masuk
              </Link>
              <Link href="/register" onClick={() => setOpen(false)} className={`${btnOrange} flex-1`}>
                Daftar
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
