"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

/**
 * Muncul sekali saat masuk layar. Dipakai hemat, hanya untuk daftar yang dibaca berurutan
 * (langkah dan departemen), bukan di setiap bagian halaman.
 */
export function Reveal({
  as = "div",
  index = 0,
  className,
  children,
}: {
  as?: "div" | "li" | "section";
  index?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- peramban lama tanpa IntersectionObserver
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Tag = as as "div";
  return (
    <Tag ref={ref as React.RefObject<HTMLDivElement>} className={`ux-reveal ${className ?? ""}`} data-in={shown} style={{ "--i": index } as CSSProperties}>
      {children}
    </Tag>
  );
}
