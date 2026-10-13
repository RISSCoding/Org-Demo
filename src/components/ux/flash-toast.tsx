"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "@/components/ui/toast";

// Kunci tetap (bukan teks bebas dari URL) supaya tautan tidak bisa dipakai menampilkan pesan sembarangan.
const FLASH: Record<string, string> = {
  "event-saved": "Event disimpan.",
  "tx-saved": "Transaksi disimpan.",
  "letter-saved": "Arsip surat disimpan.",
  "letter-deleted": "Arsip surat dihapus.",
};

/** Setelah aksi yang berakhir dengan pindah halaman (simpan lalu kembali ke daftar), tampilkan konfirmasinya sebagai toast. */
export function FlashToast() {
  const params = useSearchParams();
  const pathname = usePathname();
  const key = params.get("flash");

  useEffect(() => {
    if (!key || !FLASH[key]) return;
    toast.add({ title: FLASH[key], type: "success" });
    const next = new URLSearchParams(window.location.search);
    next.delete("flash");
    const qs = next.toString();
    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
  }, [key, pathname]);

  return null;
}
