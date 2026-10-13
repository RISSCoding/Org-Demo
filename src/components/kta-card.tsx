"use client";

import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";

type Props = {
  name: string;
  nim: string;
  batchYear: number;
  ktaNumber: string;
  division?: string | null;
  payload: string;
  size?: "sm" | "lg";
};

export function KtaCard({ name, nim, batchYear, ktaNumber, division, payload, size = "sm" }: Props) {
  const qr = size === "lg" ? 132 : 88;
  return (
    <div
      className="ux-gloss ux-pop relative w-full min-w-0 max-w-md overflow-hidden rounded-sm bg-black p-5 text-white"
      // Kilap mengikuti kursor; di layar sentuh tidak ada efek (tidak ada hover).
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
    >
      <div className="absolute inset-x-0 top-0 h-1.5 bg-[#ffa500]" />
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Image src="/logo-himman.png" alt="" width={32} height={32} className="size-8" />
          <div>
            <p className="s-display text-sm">HIMMAN UKRI</p>
            <p className="text-xs text-white/70">Kartu tanda anggota</p>
          </div>
        </div>
        <p className="tabular text-xs text-white/70">{ktaNumber}</p>
      </div>
      <div className="mt-5 flex items-end justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <p className="s-display line-clamp-2 break-words text-lg leading-tight">{name}</p>
          <p className="text-sm text-white/80">NPM {nim}</p>
          <p className="text-sm text-white/80">
            Angkatan {batchYear}
            {division ? `, ${division}` : ""}
          </p>
        </div>
        <div className="shrink-0 rounded-sm bg-white p-2">
          <QRCodeSVG value={payload} size={qr} level="M" role="img" aria-label="Kode QR kartu anggota" />
        </div>
      </div>
    </div>
  );
}
