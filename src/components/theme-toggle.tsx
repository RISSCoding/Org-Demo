"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { btnGhost } from "@/lib/ui";

/** Ikon matahari dan bulan bertukar dengan putaran halus; keduanya selalu ada di DOM agar tidak berkedip saat hidrasi. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      type="button"
      aria-label="Ganti tema terang atau gelap"
      title="Ganti tema terang atau gelap"
      className={`${btnGhost} md:size-9 md:px-0`}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <span className="relative block size-4">
        <Sun className="absolute inset-0 size-4 transition-[transform,opacity] duration-300 ease-[var(--ease-out)] dark:-rotate-90 dark:scale-50 dark:opacity-0" />
        <Moon className="absolute inset-0 size-4 rotate-90 scale-50 opacity-0 transition-[transform,opacity] duration-300 ease-[var(--ease-out)] dark:rotate-0 dark:scale-100 dark:opacity-100" />
      </span>
    </button>
  );
}
