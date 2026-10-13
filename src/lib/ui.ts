// Primitif tampilan untuk login, dashboard, dan admin.
// Semua nilai warna dan radius berasal dari src/styles/tokens.css.
// Semua tombol punya umpan balik tekan (turun 1px), fokus keyboard yang jelas,
// dan target sentuh yang cukup di layar kecil.

const press = "active:translate-y-px disabled:cursor-not-allowed disabled:active:translate-y-0";
const ring = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]";
const base = `group inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-[background-color,border-color,transform,opacity,box-shadow] duration-fast ${press} ${ring}`;

export const inputCls =
  "h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none transition-[border-color,box-shadow] duration-fast placeholder:text-muted-foreground hover:border-[var(--border-strong)] focus-visible:border-[var(--border-focus)] focus-visible:shadow-[var(--shadow-focus)] disabled:cursor-not-allowed disabled:bg-[var(--surface-2)] disabled:opacity-60 aria-[invalid=true]:border-[var(--state-danger-fg)] aria-[invalid=true]:shadow-[var(--shadow-focus-danger)]";

export const btnPrimary = `${base} h-10 bg-[var(--brand-500)] px-4 font-semibold text-[var(--text-on-brand)] hover:bg-[var(--brand-400)] disabled:opacity-60`;

export const btnGhost = `${base} h-9 px-3 hover:bg-[var(--interactive-hover)] disabled:opacity-50`;

export const btnLine = `${base} h-10 border border-[var(--border-default)] bg-transparent px-4 font-semibold hover:border-[var(--border-strong)] hover:bg-[var(--interactive-hover)] disabled:opacity-50`;

export const btnDanger = `${base} h-10 bg-[var(--red-500)] px-4 font-semibold text-white hover:bg-[var(--red-600)] disabled:opacity-60`;

export const cardCls = "rounded-lg border border-[var(--border-default)] bg-card text-card-foreground";

/** Kartu yang bisa diklik: naik sedikit dan garisnya menguning saat disorot. */
export const cardLink =
  "rounded-lg border border-[var(--border-default)] bg-card text-card-foreground transition-[border-color,transform,box-shadow] duration-base ease-[var(--ease-out)] hover:-translate-y-0.5 hover:border-[var(--brand-500)] hover:shadow-[var(--shadow-md)] active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]";

/** Tautan teks: kuning tua, bergaris bawah, sama seperti linkText di situs publik. */
export const linkCls =
  "font-medium text-[var(--text-brand)] underline underline-offset-4 transition-colors hover:no-underline";

/** Pesan galat dan sukses: ikon + teks, tidak bergantung pada warna saja. */
export const alertErr =
  "ux-nudge flex items-start gap-2 rounded-md border border-[var(--state-danger-border)] bg-[var(--state-danger-bg)] px-3 py-2 text-sm text-[var(--state-danger-fg)]";

export const alertOk =
  "ux-slide-in flex items-start gap-2 rounded-md border border-[var(--state-success-border)] bg-[var(--state-success-bg)] px-3 py-2 text-sm text-[var(--state-success-fg)]";
