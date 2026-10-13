"use client";

import { QRCodeSVG } from "qrcode.react";

export function QrBox({ value, size = 180 }: { value: string; size?: number }) {
  return (
    <div className="inline-block rounded-sm bg-white p-3">
      <QRCodeSVG value={value} size={size} level="M" />
    </div>
  );
}
