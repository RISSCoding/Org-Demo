"use client";

import { Printer } from "lucide-react";
import { btnPrimary } from "@/lib/ui";

export function PrintButton({ label = "Cetak" }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={btnPrimary}>
      <Printer className="size-4" /> {label}
    </button>
  );
}
