"use client";

import { useEffect, useRef, useState } from "react";

/** Angka yang naik dari 0 saat pertama tampil. Nilai akhir tetap ada di HTML awal dan untuk pembaca layar. */
export function CountUp({ value, duration = 700, className }: { value: number; duration?: number; className?: string }) {
  const [shown, setShown] = useState(value);
  const first = useRef(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || value <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- nilai akhir langsung ditampilkan tanpa animasi
      setShown(value);
      return;
    }
    const from = first.current ? 0 : shown;
    first.current = false;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(from + (value - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return <span className={`tabular ${className ?? ""}`}>{shown.toLocaleString("id-ID")}</span>;
}
