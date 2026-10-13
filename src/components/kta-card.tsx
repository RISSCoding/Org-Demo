"use client";

import QRCode from "qrcode";
import { QRCodeSVG } from "qrcode.react";
import { BrandMark } from "@/components/brand-mark";
import { BRAND } from "@/lib/brand";
import { Check, Copy, Download, Link2, Loader2, Maximize2, X } from "lucide-react";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

type MemberStatus = "ACTIVE" | "INACTIVE" | "ALUMNI";

type Props = {
  name: string;
  nim: string;
  batchYear: number;
  ktaNumber: string;
  title: string;
  subtitle?: string | null;
  /** Isi QR. Untuk KTA, ini URL verifikasi (https://.../verify-member/<token>). */
  payload: string;
  status?: MemberStatus;
  size?: "sm" | "lg";
  showActions?: boolean;
};

type CopyTarget = "kta" | "url" | null;

export function KtaCard({
  name,
  nim,
  batchYear,
  ktaNumber,
  title,
  subtitle,
  payload,
  status = "ACTIVE",
  size = "sm",
  showActions = false,
}: Props) {
  const qr = size === "lg" ? 132 : 88;
  const [fullscreen, setFullscreen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState<CopyTarget>(null);
  const inactive = status !== "ACTIVE";
  const payloadIsUrl = /^https?:\/\//i.test(payload);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(null), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = useCallback(async (text: string, target: Exclude<CopyTarget, null>) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(target);
    } catch {
      // Clipboard bisa gagal di http:// non-localhost; biarkan user salin manual.
    }
  }, []);

  const download = useCallback(async () => {
    setDownloading(true);
    try {
      const canvas = await renderCardToCanvas({ name, nim, batchYear, ktaNumber, title, subtitle, payload });
      const link = document.createElement("a");
      link.download = `KTA-${nim}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("KTA download failed", e);
      alert("Gagal membuat gambar KTA. Coba lagi atau gunakan screenshot.");
    } finally {
      setDownloading(false);
    }
  }, [name, nim, batchYear, ktaNumber, title, subtitle, payload]);

  return (
    <div className="w-full min-w-0 space-y-4">
      <div
        className="ux-gloss ux-pop relative w-full max-w-md overflow-hidden rounded-sm border border-white/10 bg-black p-5 text-white"
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
            <BrandMark size={32} />
            <div>
              <p className="s-display text-sm">{BRAND.short}</p>
              <p className="text-xs text-white/70">Kartu tanda anggota</p>
            </div>
          </div>
          <p className="tabular text-xs text-white/70">{ktaNumber}</p>
        </div>
        <div className="mt-5 flex items-end justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <p className="s-display line-clamp-2 break-words text-lg leading-tight">{name}</p>
            <p className="text-sm text-white/80">NPM {nim}</p>
            <p className="text-sm font-semibold text-[#ffa500]">{title}</p>
            {subtitle && <p className="text-xs text-white/60">{subtitle}</p>}
            <p className="text-sm text-white/80">Angkatan {batchYear}</p>
          </div>
          <div className={`shrink-0 rounded-sm bg-white p-2 ${inactive ? "opacity-40" : ""}`}>
            <QRCodeSVG value={payload} size={qr} level="M" role="img" aria-label="Kode QR kartu anggota" />
          </div>
        </div>

        {inactive && (
          <p className="mt-4 rounded-sm bg-[#ffa500]/20 px-3 py-2 text-xs font-semibold text-[#ffa500]">
            Kartu ini tidak aktif. QR tidak dapat dipakai untuk check-in.
          </p>
        )}
      </div>

      {showActions && (
        <div className="flex max-w-md flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            disabled={inactive}
            title={inactive ? "KTA tidak aktif" : "Tampilkan QR besar untuk check-in"}
            className="inline-flex h-10 items-center gap-2 rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Maximize2 className="size-4" aria-hidden />
            Mode check-in
          </button>

          <button
            type="button"
            onClick={download}
            disabled={downloading}
            className="inline-flex h-10 items-center gap-2 rounded-sm border border-border px-4 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
          >
            {downloading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Download className="size-4" aria-hidden />}
            {downloading ? "Menyiapkan…" : "Simpan PNG"}
          </button>

          <button
            type="button"
            onClick={() => copy(ktaNumber, "kta")}
            className="inline-flex h-10 items-center gap-2 rounded-sm border border-border px-4 text-sm font-medium transition-colors hover:bg-muted"
          >
            {copied === "kta" ? <Check className="size-4 text-[var(--emerald)]" aria-hidden /> : <Copy className="size-4" aria-hidden />}
            {copied === "kta" ? "Tersalin" : "Salin nomor"}
          </button>

          {payloadIsUrl && (
            <button
              type="button"
              onClick={() => copy(payload, "url")}
              className="inline-flex h-10 items-center gap-2 rounded-sm border border-border px-4 text-sm font-medium transition-colors hover:bg-muted"
            >
              {copied === "url" ? <Check className="size-4 text-[var(--emerald)]" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
              {copied === "url" ? "Tersalin" : "Salin tautan verifikasi"}
            </button>
          )}
        </div>
      )}

      {fullscreen && (
        <CheckInOverlay name={name} nim={nim} title={title} payload={payload} onClose={() => setFullscreen(false)} />
      )}
    </div>
  );
}

/* ============== Overlay check-in ============== */

function subscribeViewport(cb: () => void) {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
}
function computeQrSize() {
  if (typeof window === "undefined") return 360;
  return Math.min(window.innerWidth - 96, window.innerHeight - 320, 560);
}
function qrSizeServer() {
  return 360;
}

function CheckInOverlay({
  name,
  nim,
  title,
  payload,
  onClose,
}: {
  name: string;
  nim: string;
  title: string;
  payload: string;
  onClose: () => void;
}) {
  // Ukuran QR mengikuti viewport lewat useSyncExternalStore — tidak memicu cascading render.
  const qrSize = useSyncExternalStore(subscribeViewport, computeQrSize, qrSizeServer);

  useEffect(() => {
    type WakeLock = { release: () => Promise<void> };
    let lock: WakeLock | null = null;
    const request = (navigator as Navigator & {
      wakeLock?: { request: (t: "screen") => Promise<WakeLock> };
    }).wakeLock?.request("screen");
    request?.then((l) => (lock = l)).catch(() => {});
    return () => {
      lock?.release().catch(() => {});
    };
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mode check-in"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black p-6"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup mode check-in"
        className="absolute top-4 right-4 grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <X className="size-6" aria-hidden />
      </button>

      <p className="mb-4 text-xs uppercase tracking-[0.2em] text-white/50">Tunjukkan ke panitia</p>

      <div className="rounded-md bg-white p-4 shadow-[0_0_60px_rgba(255,165,0,0.15)]">
        <QRCodeSVG value={payload} size={qrSize} level="M" role="img" aria-label="Kode QR kartu anggota" />
      </div>

      <div className="mt-6 space-y-1 text-center">
        <p className="text-2xl font-semibold text-white">{name}</p>
        <p className="tabular text-sm text-white/60">NPM {nim}</p>
        <p className="text-sm font-medium text-[#ffa500]">{title}</p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-8 inline-flex h-11 items-center gap-2 rounded-sm bg-white/10 px-6 text-sm font-medium text-white transition-colors hover:bg-white/20"
      >
        <X className="size-4" aria-hidden />
        Tutup
      </button>
    </div>,
    document.body,
  );
}

/* ============== Render PNG via canvas ============== */

type RenderInput = {
  name: string;
  nim: string;
  batchYear: number;
  ktaNumber: string;
  title: string;
  subtitle?: string | null;
  payload: string;
};

const W = 1200;
const H = 750;

async function renderCardToCanvas(input: RenderInput): Promise<HTMLCanvasElement> {
  const { name, nim, batchYear, ktaNumber, title, subtitle, payload } = input;
  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.scale(scale, scale);

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#ffa500";
  ctx.fillRect(0, 0, W, 14);

  try {
    const logo = await loadImage("/logo-himman.png");
    ctx.drawImage(logo, 60, 50, 64, 64);
  } catch {
    /* lanjut tanpa logo */
  }

  const sans = "system-ui, -apple-system, 'Segoe UI', sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 30px ${sans}`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText("{BRAND.short}", 148, 84);
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = `400 18px ${sans}`;
  ctx.fillText("Kartu tanda anggota", 148, 110);

  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = `500 20px ${sans}`;
  ctx.textAlign = "right";
  ctx.fillText(ktaNumber, W - 60, 84);
  ctx.textAlign = "left";

  ctx.fillStyle = "#ffffff";
  ctx.font = `700 60px ${sans}`;
  let nameY = 290;
  for (const line of wrapText(ctx, name, 700)) {
    ctx.fillText(line, 60, nameY);
    nameY += 68;
  }

  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = `400 28px ${sans}`;
  ctx.fillText(`NPM ${nim}`, 60, nameY + 10);
  nameY += 60;

  ctx.fillStyle = "#ffa500";
  ctx.font = `700 32px ${sans}`;
  ctx.fillText(title, 60, nameY + 20);
  nameY += 52;

  if (subtitle) {
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = `400 22px ${sans}`;
    ctx.fillText(subtitle, 60, nameY + 20);
    nameY += 40;
  }

  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = `400 26px ${sans}`;
  ctx.fillText(`Angkatan ${batchYear}`, 60, nameY + 30);

  const qrDataUrl = await QRCode.toDataURL(payload, {
    width: 620,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#000000", light: "#ffffff" },
  });
  const qrImg = await loadImage(qrDataUrl);
  const qrBoxSize = 380;
  const qrX = W - 60 - qrBoxSize;
  const qrY = H - 60 - qrBoxSize;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(qrX, qrY, qrBoxSize, qrBoxSize);
  const inner = 24;
  ctx.drawImage(qrImg, qrX + inner, qrY + inner, qrBoxSize - inner * 2, qrBoxSize - inner * 2);

  return canvas;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const test = current ? `${current} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = w;
    } else {
      current = test;
    }
    if (lines.length >= 2) break;
  }
  if (current && lines.length < 2) lines.push(current);
  return lines;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
