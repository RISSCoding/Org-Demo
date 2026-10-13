"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** Kirim ini dari kode yang memindahkan halaman lewat router.push/replace agar bilah kemajuan ikut tampil. */
export const NAV_START_EVENT = "ux:navstart";
export const startNavProgress = () => window.dispatchEvent(new Event(NAV_START_EVENT));

/**
 * Bilah tipis kuning di tepi atas layar saat pindah halaman. Tanpa ini, klik pada halaman
 * yang butuh data terasa "tidak terjadi apa-apa" selama beberapa ratus milidetik.
 */
export function NavProgress() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const [value, setValue] = useState(0);
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const guard = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = useRef(false);

  useEffect(() => {
    const clear = () => {
      if (timer.current) clearInterval(timer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (guard.current) clearTimeout(guard.current);
    };
    const finish = () => {
      clear();
      if (!active.current) return;
      active.current = false;
      setValue(1);
      hideTimer.current = setTimeout(() => {
        setVisible(false);
        setValue(0);
      }, 260);
    };
    const start = () => {
      clear();
      active.current = true;
      setVisible(true);
      setValue(0.1);
      timer.current = setInterval(() => setValue((v) => v + (0.9 - v) * 0.08), 180);
      guard.current = setTimeout(finish, 15000);
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      if (url.pathname.startsWith("/api/")) return;
      start();
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener(NAV_START_EVENT, start);
    window.addEventListener("popstate", start);
    (window as unknown as { __uxNavDone?: () => void }).__uxNavDone = finish;
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener(NAV_START_EVENT, start);
      window.removeEventListener("popstate", start);
      clear();
    };
  }, []);

  // Rute berubah = halaman baru sudah tampil.
  useEffect(() => {
    (window as unknown as { __uxNavDone?: () => void }).__uxNavDone?.();
  }, [pathname, search]);

  return (
    <div
      aria-hidden
      className="ux-progress"
      style={{
        transform: `scaleX(${value})`,
        opacity: visible ? 1 : 0,
        transition: `transform 220ms var(--ease-out), opacity 200ms linear`,
      }}
    />
  );
}
