// Primitif tampilan untuk login, dashboard, dan admin. Bentuknya sama dengan situs publik (lib/site-ui.ts):
// sudut tajam, garis tipis, tanpa bayangan, tombol utama kuning dengan teks hitam.
// Semua tombol punya umpan balik tekan (turun 1px), fokus keyboard yang jelas, dan target sentuh 44px di layar kecil.
const press = "active:translate-y-px disabled:cursor-not-allowed disabled:active:translate-y-0";
const ring = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffa500]";

export const inputCls =
  "h-11 w-full rounded-sm border border-input bg-transparent px-3 text-base outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted-foreground hover:border-foreground/40 focus-visible:border-[#ffa500] focus-visible:shadow-[0_0_0_3px_rgba(255,165,0,0.22)] disabled:opacity-50 aria-[invalid=true]:border-red-500 aria-[invalid=true]:shadow-[0_0_0_3px_rgba(239,68,68,0.15)] md:h-10 md:text-sm";
export const btnPrimary =
  `inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-[#ffa500] px-4 text-sm font-semibold text-black transition-[background-color,transform,opacity] duration-150 hover:bg-[#ffb733] disabled:opacity-60 md:h-10 ${press} ${ring}`;
export const btnGhost =
  `inline-flex h-11 items-center justify-center gap-2 rounded-sm px-3 text-sm transition-[background-color,transform,opacity] duration-150 hover:bg-muted disabled:opacity-50 md:h-9 ${press} ${ring}`;
export const btnLine =
  `inline-flex h-11 items-center justify-center gap-2 rounded-sm border border-border px-4 text-sm font-semibold transition-[background-color,border-color,transform,opacity] duration-150 hover:border-foreground/40 hover:bg-muted disabled:opacity-50 md:h-10 ${press} ${ring}`;
export const btnDanger =
  `inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-red-600 px-4 text-sm font-semibold text-white transition-[background-color,transform,opacity] duration-150 hover:bg-red-700 disabled:opacity-60 md:h-10 ${press} ${ring}`;
export const cardCls = "rounded-sm border border-border bg-card text-card-foreground";
/** Kartu yang bisa diklik: naik sedikit dan garisnya menguning saat disorot. */
export const cardLink =
  "rounded-sm border border-border bg-card text-card-foreground transition-[border-color,transform,box-shadow] duration-200 ease-[var(--ease-out)] hover:-translate-y-0.5 hover:border-[#ffa500] hover:shadow-[0_6px_18px_-10px_rgba(0,0,0,0.35)] active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffa500]";
/** Tautan teks: kuning tua, bergaris bawah, sama seperti linkText di situs. */
export const linkCls =
  "font-medium text-[var(--gold-text)] underline underline-offset-4 transition-colors hover:no-underline";
/** Pesan galat dan sukses: ikon + teks, tidak bergantung pada warna saja. */
export const alertErr = "ux-nudge flex items-start gap-2 rounded-sm border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300";
export const alertOk = "ux-slide-in flex items-start gap-2 rounded-sm border border-[var(--emerald)]/30 bg-[var(--emerald)]/10 px-3 py-2 text-sm text-[var(--emerald)]";
