"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { RoleName } from "@prisma/client";
import {
  Award, BookOpen, CalendarDays, Landmark, CreditCard, LayoutDashboard, LogOut, Mail,
  Menu, MessageSquare, Newspaper, PanelLeftClose, PanelLeftOpen, ShieldCheck, Users, Wallet, X,
} from "lucide-react";
import { useFormStatus } from "react-dom";
import { logoutAction } from "@/actions/login";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { roleLabel } from "@/lib/permissions-meta";
import { btnGhost } from "@/lib/ui";

type NavItem = { href: string; label: string; icon: React.ElementType; perm?: string; soon?: boolean };

const adminNav: NavItem[] = [
  { href: "/admin", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/admin/members", label: "Anggota", icon: Users, perm: "member:manage" },
  { href: "/admin/events", label: "Event", icon: CalendarDays, perm: "event:manage" },
  { href: "/admin/finance", label: "Keuangan", icon: Wallet, perm: "finance:read" },
  { href: "/admin/secretariat", label: "Sekretariat", icon: Mail, perm: "secretariat:manage" },
  { href: "/admin/cms", label: "Berita & Artikel", icon: Newspaper, perm: "cms:write", soon: true },
  { href: "/admin/feedback", label: "Kotak Aspirasi", icon: MessageSquare, perm: "aspirasi:manage" },
];

const memberNav: NavItem[] = [
  { href: "/dashboard", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/dashboard/kta", label: "KTA Digital", icon: CreditCard },
  { href: "/dashboard/events", label: "Event", icon: CalendarDays },
  { href: "/dashboard/certificates", label: "Sertifikat", icon: Award },
  { href: "/dashboard/dues", label: "Iuran Kas", icon: Wallet },
  { href: "/dashboard/finance", label: "Transparansi Kas", icon: Landmark },
  { href: "/dashboard/resources", label: "Materi", icon: BookOpen, soon: true },
  { href: "/dashboard/feedback", label: "Pesan Saya", icon: MessageSquare },
];

export type ShellUser = { name: string; nim: string; role: RoleName; permissions: string[] };

const STORAGE_KEY = "himman:sidebar-collapsed";

/** True bila layar selebar tablet ke atas. Snapshot server = true agar HTML awal sama dengan tampilan desktop. */
function useIsDesktop() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia("(min-width: 768px)");
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia("(min-width: 768px)").matches,
    () => true,
  );
}

function LogoutButton({ collapsed, rowCls }: { collapsed: boolean; rowCls: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-label="Keluar" className={`${rowCls} w-full hover:bg-white/10 ${collapsed ? "md:justify-center" : ""}`}>
      {pending ? <Spinner /> : <LogOut className="size-4 shrink-0" />}
      {!collapsed && <span>{pending ? "Keluar…" : "Keluar"}</span>}
    </button>
  );
}

export function AppShell({
  variant,
  user,
  children,
}: {
  variant: "admin" | "member";
  user: ShellUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDesktop = useIsDesktop();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);

  // Ingat pilihan lipat sidebar antar kunjungan.
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- membaca preferensi dari localStorage setelah mount
      if (localStorage.getItem(STORAGE_KEY) === "1") setCollapsed(true);
    } catch {}
  }, []);
  const toggleCollapsed = () =>
    setCollapsed((c) => {
      try {
        localStorage.setItem(STORAGE_KEY, c ? "0" : "1");
      } catch {}
      return !c;
    });

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    menuBtn.current?.focus();
  }, []);

  // Drawer seluler: Esc menutup, halaman di belakang tidak ikut bergulir.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeMobile();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [mobileOpen, closeMobile]);

  const isExec = user.role === "SUPER_ADMIN" || user.role === "ADMIN_EXECUTIVE";
  const items = (variant === "admin" ? adminNav : memberNav).filter(
    (i) => !i.perm || user.role === "SUPER_ADMIN" || user.permissions.includes(i.perm),
  );
  const isActive = (href: string) =>
    href === "/admin" || href === "/dashboard" ? pathname === href : pathname.startsWith(href);
  const current = items.find((i) => !i.soon && isActive(i.href));

  const switchLink =
    variant === "admin"
      ? { href: "/dashboard", label: "Portal Anggota", icon: Users }
      : { href: "/admin", label: "Panel Admin", icon: ShieldCheck };

  const showLabels = !collapsed || !isDesktop;
  const row = "relative flex items-center gap-3 rounded-sm px-3 py-3 text-sm transition-colors duration-150 md:py-2.5 focus-visible:outline-2 focus-visible:outline-offset-[-2px]";
  const bar =
    "before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:origin-center before:scale-y-0 before:bg-[#ffa500] before:transition-transform before:duration-300 before:ease-[var(--ease-out)] aria-[current=page]:before:scale-y-100";

  /** Saat sidebar dilipat, nama menu muncul sebagai tooltip supaya ikon tidak perlu ditebak. */
  const tip = (label: string, el: React.ReactElement<Record<string, unknown>>) =>
    !showLabels ? (
      <Tooltip>
        <TooltipTrigger render={el} />
        <TooltipContent side="right" sideOffset={10}>{label}</TooltipContent>
      </Tooltip>
    ) : (
      el
    );

  return (
    <TooltipProvider delay={150}>
      <div className="app flex min-h-dvh">
        <a
          href="#isi"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-sm focus:bg-[#ffa500] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
        >
          Lewati ke konten
        </a>

        <div
          aria-hidden
          onClick={closeMobile}
          className={`fixed inset-0 z-30 bg-black/55 backdrop-blur-[2px] transition-opacity duration-300 md:hidden ${
            mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />

        <aside
          id="menu-samping"
          aria-label={variant === "admin" ? "Menu panel admin" : "Menu portal anggota"}
          inert={!isDesktop && !mobileOpen}
          className={`fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] flex-col bg-black text-white transition-[transform,width] duration-300 ease-[var(--ease-out)] md:sticky md:top-0 md:h-dvh md:max-w-none md:translate-x-0 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          } ${collapsed ? "md:w-[72px]" : "md:w-64"}`}
        >
          <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
            <Link href="/" aria-label="Ke beranda situs HIMMAN UKRI">
              <Brand compact={!showLabels} />
            </Link>
            <button type="button" className="grid size-10 place-items-center rounded-sm hover:bg-white/10 md:hidden" aria-label="Tutup menu" onClick={closeMobile}>
              <X className="size-5" />
            </button>
          </div>

          <nav aria-label="Navigasi utama" className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
            {items.map(({ href, label, icon: Icon, soon }) =>
              soon ? (
                <span
                  key={href}
                  aria-disabled="true"
                  title="Segera hadir"
                  className={`${row} cursor-not-allowed text-white/40 ${!showLabels ? "md:justify-center" : ""}`}
                >
                  <Icon className="size-4 shrink-0" />
                  {showLabels && <span className="truncate">{label}</span>}
                  {showLabels && <span className="ml-auto rounded-sm border border-white/20 px-1.5 py-0.5 text-[11px]">Segera</span>}
                </span>
              ) : (
                <div key={href}>
                  {tip(
                    label,
                    <Link
                      href={href}
                      aria-label={!showLabels ? label : undefined}
                      aria-current={isActive(href) ? "page" : undefined}
                      onClick={() => setMobileOpen(false)}
                      className={`${row} ${bar} ${!showLabels ? "md:justify-center" : ""} ${
                        isActive(href) ? "bg-white/10 font-semibold" : "text-white/75 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon className="size-4 shrink-0" />
                      {showLabels && <span className="truncate">{label}</span>}
                    </Link>,
                  )}
                </div>
              ),
            )}
          </nav>

          <div className="space-y-1 border-t border-white/10 p-3 pb-safe">
            {isExec && (
              <div>
                {tip(
                  switchLink.label,
                  <Link
                    href={switchLink.href}
                    aria-label={!showLabels ? switchLink.label : undefined}
                    className={`${row} text-white/75 hover:bg-white/10 hover:text-white ${!showLabels ? "md:justify-center" : ""}`}
                  >
                    <switchLink.icon className="size-4 shrink-0" />
                    {showLabels && <span>Pindah ke {switchLink.label}</span>}
                  </Link>,
                )}
              </div>
            )}
            <form action={logoutAction}>
              <LogoutButton collapsed={!showLabels} rowCls={`${row} text-white/75 hover:text-white`} />
            </form>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <button
              ref={menuBtn}
              type="button"
              className={`${btnGhost} md:hidden`}
              aria-label="Buka menu"
              aria-expanded={mobileOpen}
              aria-controls="menu-samping"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-4" />
            </button>
            <button
              type="button"
              className={`${btnGhost} hidden md:inline-flex`}
              aria-label={collapsed ? "Lebarkan sidebar" : "Lipat sidebar"}
              aria-expanded={!collapsed}
              aria-controls="menu-samping"
              onClick={toggleCollapsed}
            >
              {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            </button>

            <p className="min-w-0 truncate text-sm text-muted-foreground" aria-label="Posisi halaman">
              <span>{variant === "admin" ? "Panel Admin" : "Portal Anggota"}</span>
              {current && current.href !== "/admin" && current.href !== "/dashboard" && (
                <>
                  <span aria-hidden className="mx-2">/</span>
                  <span className="font-medium text-foreground">{current.label}</span>
                </>
              )}
            </p>

            <div className="ml-auto flex items-center gap-3">
              <ThemeToggle />
              <div className="hidden text-right leading-tight sm:block">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {user.nim} · {roleLabel(user.role)}
                </p>
              </div>
              <div className="grid size-9 place-items-center rounded-sm bg-[#ffa500] text-sm font-bold text-black" aria-hidden>
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </header>
          <main id="isi" tabIndex={-1} className="flex-1 p-4 outline-none md:p-8 md:pt-10">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
