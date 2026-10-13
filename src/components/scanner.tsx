"use client";

import jsQR from "jsqr";
import { AlertTriangle, CheckCircle2, Volume2, VolumeX, XCircle, RotateCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { checkInByQr } from "@/actions/events";
import { Spinner } from "@/components/ui/spinner";
import { btnLine, btnPrimary, cardCls, inputCls } from "@/lib/ui";

type Kind = "ok" | "dup" | "err";
type Entry = { id: number; kind: Kind; title: string; sub: string; at: string };

const tone: Record<Kind, { box: string; icon: React.ElementType; label: string; flash: string }> = {
  ok: { box: "border-[var(--emerald)] bg-[var(--emerald)]/10", icon: CheckCircle2, label: "Berhasil", flash: "bg-[var(--emerald)]" },
  dup: { box: "border-[var(--gold)] bg-[var(--state-warning-bg)]", icon: AlertTriangle, label: "Sudah check-in", flash: "bg-[#c77d00]" },
  err: { box: "border-red-500 bg-[var(--state-danger-bg)]", icon: XCircle, label: "Ditolak", flash: "bg-red-600" },
};

const MUTE_KEY = "himman:scanner-muted";
const clock = () => new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Asia/Jakarta" });

export function Scanner({ eventId }: { eventId: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastRef = useRef({ payload: "", at: 0 });
  const busyRef = useRef(false);
  const audioRef = useRef<AudioContext | null>(null);
  const mutedRef = useRef(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [camError, setCamError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [flash, setFlash] = useState<Entry | null>(null);
  const [manual, setManual] = useState("");
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    try {
      const m = localStorage.getItem(MUTE_KEY) === "1";
      mutedRef.current = m;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- membaca preferensi dari localStorage setelah mount
      setMuted(m);
    } catch {}
  }, []);

  const beep = useCallback((kind: Kind) => {
    if (mutedRef.current) return;
    try {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      audioRef.current ??= new Ctx();
      const ctx = audioRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = kind === "ok" ? 880 : kind === "dup" ? 520 : 200;
      const dur = kind === "ok" ? 0.12 : 0.28;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur + 0.05);
    } catch {}
  }, []);

  const toggleMute = () => {
    const next = !muted;
    mutedRef.current = next;
    setMuted(next);
    try {
      localStorage.setItem(MUTE_KEY, next ? "1" : "0");
    } catch {}
  };

  const push = useCallback(
    (entry: Entry) => {
      navigator.vibrate?.(entry.kind === "ok" ? 80 : [60, 40, 60]);
      beep(entry.kind);
      setEntries((prev) => [entry, ...prev].slice(0, 20));
      setFlash(entry);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setFlash(null), 1800);
    },
    [beep],
  );

  const submit = useCallback(
    async (payload: string) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setBusy(true);
      const id = Date.now();
      try {
        const r = await checkInByQr({ eventId, payload });
        push(
          r.ok
            ? r.data.alreadyCheckedIn
              ? { id, kind: "dup", title: r.data.fullName, sub: `${r.data.label ? `${r.data.label}. ` : ""}NPM ${r.data.nim}. Sudah check-in sebelumnya.`, at: clock() }
              : { id, kind: "ok", title: r.data.fullName, sub: `${r.data.label ? `${r.data.label}. ` : ""}NPM ${r.data.nim}. Check-in berhasil.`, at: clock() }
            : { id, kind: "err", title: "Ditolak", sub: r.error, at: clock() },
        );
      } catch {
        push({ id, kind: "err", title: "Gagal terhubung", sub: "Tidak bisa menghubungi server. Periksa koneksi lalu pindai lagi.", at: clock() });
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
    },
    [eventId, push],
  );

  useEffect(() => () => { if (flashTimer.current) clearTimeout(flashTimer.current); }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;
    let lastScan = 0;

    function tick() {
      raf = requestAnimationFrame(tick);
      const now = performance.now();
      if (now - lastScan < 150) return;
      lastScan = now;
      const v = videoRef.current;
      const c = canvasRef.current;
      if (!v || !c || v.readyState !== v.HAVE_ENOUGH_DATA) return;

      const scale = Math.min(1, 640 / v.videoWidth);
      const w = Math.round(v.videoWidth * scale);
      const h = Math.round(v.videoHeight * scale);
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(v, 0, 0, w, h);
      const img = ctx.getImageData(0, 0, w, h);
      const code = jsQR(img.data, w, h, { inversionAttempts: "dontInvert" });
      if (!code?.data) return;

      const t = Date.now();
      if (code.data === lastRef.current.payload && t - lastRef.current.at < 4000) return;
      lastRef.current = { payload: code.data, at: t };
      void submit(code.data);
    }

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (stopped) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const v = videoRef.current!;
        v.srcObject = stream;
        await v.play();
        setReady(true);
        tick();
      } catch {
        setCamError(
          "Kamera tidak bisa dipakai. Izinkan akses kamera di peramban, dan buka halaman lewat HTTPS atau localhost. Kamu tetap bisa mencatat kehadiran dengan input NPM manual di bawah.",
        );
      }
    }

    void start();
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [submit, attempt]);

  const retryCamera = () => {
    setCamError(null);
    setReady(false);
    setAttempt((a) => a + 1);
  };

  const count = (k: Kind) => entries.filter((e) => e.kind === k).length;
  const corner = "absolute size-7 border-[#ffa500]";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="relative aspect-square max-w-md overflow-hidden rounded-sm bg-black">
          <video ref={videoRef} className="h-full w-full object-cover" playsInline muted aria-label="Tampilan kamera pemindai" />
          <canvas ref={canvasRef} className="hidden" />

          {/* Bingkai bidik: empat sudut, garis pindai bergerak saat kamera siap. */}
          <div className="pointer-events-none absolute inset-[14%]" aria-hidden>
            <span className={`${corner} left-0 top-0 border-l-4 border-t-4`} />
            <span className={`${corner} right-0 top-0 border-r-4 border-t-4`} />
            <span className={`${corner} bottom-0 left-0 border-b-4 border-l-4`} />
            <span className={`${corner} bottom-0 right-0 border-b-4 border-r-4`} />
            {ready && !busy && !flash && <span className="ux-scanline absolute inset-x-1 h-0.5 bg-[#ffa500] shadow-[0_0_10px_#ffa500]" />}
          </div>

          {!ready && !camError && (
            <div className="absolute inset-0 grid place-items-center gap-2 bg-black/85 p-6 text-center text-sm text-white" role="status">
              <span className="inline-flex items-center gap-2"><Spinner /> Menyalakan kamera…</span>
              <span className="text-white/60">Izinkan akses kamera bila peramban bertanya.</span>
            </div>
          )}
          {camError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/90 p-6 text-center text-sm text-white" role="alert">
              <p>{camError}</p>
              <button type="button" onClick={retryCamera} className={btnPrimary}>
                <RotateCw className="size-4" aria-hidden /> Coba nyalakan lagi
              </button>
            </div>
          )}

          {/* Hasil pindai langsung di atas kamera, supaya petugas tidak perlu menoleh ke daftar. */}
          {flash && (
            <div key={flash.id} className={`ux-pop absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-sm px-4 py-3 text-white ${tone[flash.kind].flash}`}>
              {(() => {
                const Icon = tone[flash.kind].icon;
                return <Icon className="size-7 shrink-0" aria-hidden />;
              })()}
              <div className="min-w-0">
                <p className="truncate text-base font-semibold">{flash.title}</p>
                <p className="truncate text-sm text-white/90">{tone[flash.kind].label}{flash.sub.startsWith("Panitia") ? ` · ${flash.sub.split(".")[0]}` : ""}</p>
              </div>
            </div>
          )}
          {busy && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-sm bg-black/70 px-2.5 py-1 text-xs text-white" role="status">
              <Spinner className="size-3.5" /> Memeriksa…
            </span>
          )}
        </div>

        <div className="flex max-w-md items-center justify-between gap-3 text-sm">
          <p className="text-muted-foreground" aria-live="polite">
            {ready ? "Arahkan QR ke dalam bingkai. Pemindaian otomatis." : " "}
          </p>
          <button
            type="button"
            onClick={toggleMute}
            aria-pressed={muted}
            className="inline-flex h-9 items-center gap-2 rounded-sm px-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {muted ? <VolumeX className="size-4" aria-hidden /> : <Volume2 className="size-4" aria-hidden />}
            {muted ? "Suara mati" : "Suara hidup"}
          </button>
        </div>

        <form
          className="max-w-md space-y-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            const v = manual.trim();
            if (v) void submit(v);
            setManual("");
          }}
        >
          <label htmlFor="npm-manual" className="text-sm font-medium">Kamera tidak terbaca? Ketik NPM peserta</label>
          <div className="flex gap-2">
            <input
              id="npm-manual"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="Contoh: 2024101001"
              inputMode="numeric"
              autoComplete="off"
              className={inputCls}
            />
            <button type="submit" disabled={busy || !manual.trim()} className={`${btnLine} shrink-0`}>
              {busy && <Spinner />} Check-in
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold text-[var(--s-head)]">Hasil scan</h2>
          {entries.length > 0 && (
            <p className="tabular text-sm text-muted-foreground">
              {count("ok")} berhasil · {count("dup")} sudah check-in · {count("err")} ditolak
            </p>
          )}
        </div>
        {entries.length === 0 && (
          <p className={`${cardCls} p-4 text-sm text-muted-foreground`}>
            Belum ada yang dipindai. Arahkan kamera ke QR tiket atau KTA peserta, hasilnya muncul di sini.
          </p>
        )}
        <ul className="space-y-2" aria-live="polite" aria-label="Riwayat pemindaian">
          {entries.map((e) => {
            const Icon = tone[e.kind].icon;
            return (
              <li key={e.id} className={`ux-slide-in flex items-start gap-3 rounded-sm border-l-4 p-4 ${tone[e.kind].box}`}>
                <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{e.title}</p>
                  <p className="text-sm text-muted-foreground">{e.sub}</p>
                </div>
                <time className="tabular shrink-0 text-xs text-muted-foreground">{e.at}</time>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
