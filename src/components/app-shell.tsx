"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { RoleName } from "@prisma/client";
import {
  Award, Bell, BookOpen, CalendarDays, ChevronDown, HelpCircle, Landmark, CreditCard, LayoutDashboard, LogOut, Mail,
  Menu, MessageSquare, Newspaper, PanelLeftClose, PanelLeftOpen, Settings, ShieldCheck, User, Users, Wallet, X,
} from "lucide-react";
import { useFormStatus } from "react-dom";
import { logoutAction } from "@/actions/login";
import { Brand } from "@/components/brand";
import { Breadcrumb, type Crumb } from "@/components/breadcrumb";
import { NotificationBell } from "@/components/notifications/bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { roleLabel } from "@/lib/permissions-meta";
import type { ShellCounts } from "@/lib/shell-counts";
import { btnGhost } from "@/lib/ui";

/** Kunci badge yang tersedia; entri menu menunjuk ke salah satu key ini. */
type ShellCountKey = keyof ShellCounts;

/** Satu tautan. `perm` menyembunyikan tautan dari yang tidak berizin; `soon` menampilkannya nonaktif; `badge` menampilkan notifikasi. */
type Leaf = { href: string; label: string; perm?: string; soon?: boolean; badge?: ShellCountKey };
/** Satu baris menu: tautan langsung (href) atau grup submenu (children, tanpa href sendiri). */
type Entry = { label: string; icon: React.ElementType; href?: string; perm?: string; soon?: boolean; badge?: ShellCountKey; children?: Leaf[] };
type Section = { title?: string; entries: Entry[] };
/** Tautan yang sudah diratakan untuk mencari halaman aktif; `group` = nama grup induknya (untuk breadcrumb). */
type FlatLeaf = Leaf & { group?: string };

const adminNav: Section[] = [
  { entries: [{ label: "Ringkasan", icon: LayoutDashboard, href: "/admin" }] },
  {
    title: "Organisasi",
    entries: [
      {
        label: "Anggota",
        icon: Users,
        children: [
          { href: "/admin/members", label: "Daftar anggota", perm: "member:manage", badge: "members" },
          { href: "/admin/members/import", label: "Impor mahasiswa baru", perm: "member:manage" },
          { href: "/admin/divisions", label: "Pengurus & Divisi", perm: "member:manage" },
        ],
      },
      { label: "Event", icon: CalendarDays, href: "/admin/events", perm: "event:manage" },
      { label: "Sekretariat", icon: Mail, href: "/admin/secretariat", perm: "secretariat:manage" },
    ],
  },
  {
    title: "Keuangan",
    entries: [
      {
        label: "Keuangan",
        icon: Wallet,
        children: [
          { href: "/admin/finance", label: "Ringkasan & laporan", perm: "finance:read", badge: "finance" },
          { href: "/admin/finance/dues", label: "Iuran kas", perm: "finance:read" },
          { href: "/admin/finance/transactions", label: "Transaksi", perm: "finance:read" },
          { href: "/admin/finance/transactions/new", label: "Catat transaksi", perm: "finance:write" },
        ],
      },
    ],
  },
  {
    title: "Konten & layanan",
    entries: [
      { label: "Berita & Artikel", icon: Newspaper, href: "/admin/cms", perm: "cms:write" },
      { label: "Materi", icon: BookOpen, href: "/admin/resources", perm: "cms:write" },
      { label: "Kotak Aspirasi", icon: MessageSquare, href: "/admin/feedback", perm: "aspirasi:manage", badge: "feedback" },
    ],
  },
  {
    title: "Sistem",
    entries: [
      { label: "Bantuan", icon: HelpCircle, href: "/admin/help" },
      { label: "Pengaturan", icon: Settings, href: "/admin/settings", perm: "finance:write" },
    ],
  },
];

const memberNav: Section[] = [
  {
    entries: [
      { label: "Ringkasan", icon: LayoutDashboard, href: "/dashboard" },
      { label: "KTA Digital", icon: CreditCard, href: "/dashboard/kta" },
    ],
  },
  {
    title: "Kegiatan",
    entries: [
      { label: "Event", icon: CalendarDays, href: "/dashboard/events" },
      { label: "Sertifikat", icon: Award, href: "/dashboard/certificates" },
    ],
  },
  {
    title: "Keuangan",
    entries: [
      { label: "Iuran Kas", icon: Wallet, href: "/dashboard/dues" },
      { label: "Transparansi Kas", icon: Landmark, href: "/dashboard/finance" },
    ],
  },
  {
    title: "Belajar & pesan",
    entries: [
      { label: "Materi", icon: BookOpen, href: "/dashboard/resources" },
      { label: "Pesan Saya", icon: MessageSquare, href: "/dashboard/feedback" },
    ],
  },
  {
    title: "Akun",
    entries: [
      { label: "Profil Saya", icon: User, href: "/dashboard/profile" },
      { label: "Notifikasi", icon: Bell, href: "/dashboard/notifications" },
      { label: "Bantuan", icon: HelpCircle, href: "/dashboard/help" },
    ],
  },
];

export type ShellUser = { name: string; nim: string; role: RoleName; permissions: string[] };

const STORAGE_KEY = "org:sidebar-collapsed";

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

/** Pill kuning dengan angka; sr-only supaya angka tidak terbaca dua kali. */
function BadgePill({ n }: { n: number }) {
  return (
    <>
      <span
        aria-hidden
        className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ffa500] px-1.5 text-[10px] font-semibold tabular-nums text-black"
      >
        {n > 99 ? "99+" : n}
      </span>
      <span className="sr-only">{n} item menunggu tindakan</span>
    </>
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
  counts,
  children,
}: {
  variant: "admin" | "member";
  user: ShellUser;
  /** Angka badge di sidebar. Kosong berarti tidak ada notifikasi. */
  counts?: ShellCounts;
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
  const allowed = (perm?: string) => !perm || user.role === "SUPER_ADMIN" || user.permissions.includes(perm);

  // Buang tautan yang tidak boleh dibuka, lalu seksi dan grup yang jadi kosong.
  const sections = (variant === "admin" ? adminNav : memberNav)
    .map((sec) => ({
      ...sec,
      entries: sec.entries
        .map((e) => (e.children ? { ...e, children: e.children.filter((c) => allowed(c.perm)) } : e))
        .filter((e) => (e.children ? e.children.length > 0 : allowed(e.perm))),
    }))
    .filter((sec) => sec.entries.length > 0);

  // Angka badge: kalau grup, jumlahkan anak-anaknya; kalau tautan langsung, ambil nilainya.
  const badgeFor = (e: { badge?: ShellCountKey; children?: { badge?: ShellCountKey }[] }): number => {
    if (!counts) return 0;
    if (e.children) {
      return e.children.reduce((s, c) => s + (c.badge ? counts[c.badge] ?? 0 : 0), 0);
    }
    return e.badge ? counts[e.badge] ?? 0 : 0;
  };

  // Satu tautan aktif saja: yang href-nya paling panjang dan cocok dengan alamat saat ini
  // (jadi /admin/finance/dues tidak ikut menyalakan "Ringkasan & laporan").
  const hrefMatches = (href: string) =>
    href === "/admin" || href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  const leaves: FlatLeaf[] = [];
  for (const sec of sections) {
    for (const e of sec.entries) {
      if (e.children) for (const c of e.children) leaves.push({ ...c, group: e.label });
      else if (e.href) leaves.push({ href: e.href, label: e.label, soon: e.soon, badge: e.badge });
    }
  }
  const activeHref = leaves
    .filter((l) => !l.soon && hrefMatches(l.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
  const current = leaves.find((l) => l.href === activeHref);
  const isActive = (href: string) => href === activeHref;

  // Grup terbuka otomatis bila berisi halaman aktif; pilihan manual pengguna menang.
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const switchLink =
    variant === "admin"
      ? { href: "/dashboard", label: "Portal Anggota", icon: Users }
      : { href: "/admin", label: "Panel Admin", icon: ShieldCheck };

  // Breadcrumb: [section induk] / [grup] / [label halaman aktif]
  const crumbs: Crumb[] = [{ label: variant === "admin" ? "Panel Admin" : "Portal Anggota" }];
  if (current && current.href !== "/admin" && current.href !== "/dashboard") {
    if (current.group) crumbs.push({ label: current.group });
    crumbs.push({ label: current.label });
  }

  const showLabels = !collapsed || !isDesktop;
  const row = "relative flex items-center gap-3 rounded-sm px-3 py-3 text-sm transition-colors duration-fast md:py-2.5 focus-visible:outline-2 focus-visible:outline-offset-[-2px]";
  const bar =
    "before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:origin-center before:scale-y-0 before:bg-[#ffa500] before:transition-transform before:duration-slow before:ease-[var(--ease-out)] aria-[current=page]:before:scale-y-100";

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

  /** Ikon dengan titik kuning kecil di sudut kanan atas (hanya saat sidebar dilipat). */
  const iconWithDot = (Icon: React.ElementType, n: number) => (
    <span className="relative shrink-0">
      <Icon className="size-4" />
      {n > 0 && showLabels === false && (
        <span aria-hidden className="absolute -right-1 -top-1 size-2 rounded-full bg-[#ffa500]" />
      )}
    </span>
  );

  return (
    <TooltipProvider delay={250}>
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
          className={`fixed inset-0 z-30 bg-black/55 backdrop-blur-[2px] transition-opacity duration-slow md:hidden ${
            mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />

        <aside
          id="menu-samping"
          aria-label={variant === "admin" ? "Menu panel admin" : "Menu portal anggota"}
          inert={!isDesktop && !mobileOpen}
          className={`fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] flex-col bg-black text-white transition-[transform,width] duration-slow ease-[var(--ease-out)] md:sticky md:top-0 md:h-dvh md:max-w-none md:translate-x-0 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          } ${collapsed ? "md:w-[72px]" : "md:w-64"}`}
        >
          <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
            <Link href="/" aria-label="Ke beranda situs ORG">
              <Brand compact={!showLabels} />
            </Link>
            <button type="button" className="grid size-10 place-items-center rounded-sm hover:bg-white/10 md:hidden" aria-label="Tutup menu" onClick={closeMobile}>
              <X className="size-5" />
            </button>
          </div>

          <nav aria-label="Navigasi utama" className="scrollbar-thin flex-1 overflow-y-auto px-3 py-3">
            {sections.map((sec, si) => (
              <div key={sec.title ?? `sec-${si}`} className={si > 0 ? "mt-1" : undefined}>
                {sec.title &&
                  (showLabels ? (
                    <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-white/40">{sec.title}</p>
                  ) : (
                    <div aria-hidden className="mx-3 my-2 border-t border-white/10" />
                  ))}
                <div className="space-y-1">
                  {sec.entries.map((e) => {
                    const Icon = e.icon;
                    const badge = badgeFor(e);

                    // ---- Grup submenu
                    if (e.children) {
                      const groupActive = e.children.some((c) => isActive(c.href));
                      // Sidebar dilipat: grup hanya berupa ikon yang membuka halaman pertamanya.
                      if (!showLabels) {
                        return (
                          <div key={e.label}>
                            {tip(
                              badge > 0 ? `${e.label} · ${badge} menunggu` : e.label,
                              <Link
                                href={e.children[0].href}
                                aria-label={e.label}
                                onClick={() => setMobileOpen(false)}
                                className={`${row} ${bar} md:justify-center ${
                                  groupActive ? "bg-white/10 font-semibold" : "text-white/75 hover:bg-white/10 hover:text-white"
                                }`}
                                aria-current={groupActive ? "page" : undefined}
                              >
                                {iconWithDot(Icon, badge)}
                              </Link>,
                            )}
                          </div>
                        );
                      }
                      const open = openGroups[e.label] ?? groupActive;
                      const listId = `grup-${e.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
                      return (
                        <div key={e.label}>
                          <button
                            type="button"
                            aria-expanded={open}
                            aria-controls={listId}
                            onClick={() => setOpenGroups((g) => ({ ...g, [e.label]: !open }))}
                            className={`${row} w-full ${groupActive ? "font-semibold text-white" : "text-white/75 hover:bg-white/10 hover:text-white"}`}
                          >
                            {iconWithDot(Icon, badge)}
                            <span className="truncate">{e.label}</span>
                            {badge > 0 && <BadgePill n={badge} />}
                            <ChevronDown className={`${badge > 0 ? "" : "ml-auto"} size-4 shrink-0 text-white/50 transition-transform duration-base ${open ? "rotate-180" : ""}`} />
                          </button>
                          {open && (
                            <div id={listId} className="ml-[1.4rem] mt-1 space-y-0.5 border-l border-white/10 pl-2">
                              {e.children.map((c) => {
                                const cb = c.badge && counts ? counts[c.badge] ?? 0 : 0;
                                return (
                                  <Link
                                    key={c.href}
                                    href={c.href}
                                    aria-current={isActive(c.href) ? "page" : undefined}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-2 rounded-sm px-3 py-2.5 text-[13px] transition-colors duration-fast focus-visible:outline-2 focus-visible:outline-offset-[-2px] md:py-2 ${
                                      isActive(c.href) ? "bg-white/10 font-semibold text-white" : "text-white/65 hover:bg-white/10 hover:text-white"
                                    }`}
                                  >
                                    <span className="truncate">{c.label}</span>
                                    {cb > 0 && <BadgePill n={cb} />}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // ---- Tautan langsung
                    const href = e.href!;
                    return e.soon ? (
                      <span
                        key={href}
                        aria-disabled="true"
                        title="Segera hadir"
                        className={`${row} cursor-not-allowed text-white/40 ${!showLabels ? "md:justify-center" : ""}`}
                      >
                        {iconWithDot(Icon, 0)}
                        {showLabels && <span className="truncate">{e.label}</span>}
                        {showLabels && <span className="ml-auto rounded-sm border border-white/20 px-1.5 py-0.5 text-[11px]">Segera</span>}
                      </span>
                    ) : (
                      <div key={href}>
                        {tip(
                          badge > 0 ? `${e.label} · ${badge} menunggu` : e.label,
                          <Link
                            href={href}
                            aria-label={!showLabels ? e.label : undefined}
                            aria-current={isActive(href) ? "page" : undefined}
                            onClick={() => setMobileOpen(false)}
                            className={`${row} ${bar} ${!showLabels ? "md:justify-center" : ""} ${
                              isActive(href) ? "bg-white/10 font-semibold" : "text-white/75 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            {iconWithDot(Icon, badge)}
                            {showLabels && <span className="truncate">{e.label}</span>}
                            {showLabels && badge > 0 && <BadgePill n={badge} />}
                          </Link>,
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
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
          <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-[var(--border-subtle)] bg-background/80 px-4 backdrop-blur-md">
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

            <Breadcrumb items={crumbs} label="Posisi halaman" />

            <div className="ml-auto flex items-center gap-3">
              {variant === "member" && <NotificationBell />}
              <ThemeToggle />
              <div className="hidden text-right leading-tight sm:block">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {user.nim} · {roleLabel(user.role)}
                </p>
              </div>
              <Link
                href="/dashboard/profile"
                aria-label="Profil saya"
                title="Profil saya"
                className="grid size-9 place-items-center rounded-sm bg-[#ffa500] text-sm font-bold text-black transition-[filter] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffa500]"
              >
                <span aria-hidden>{user.name.charAt(0).toUpperCase()}</span>
              </Link>
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
