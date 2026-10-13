// Primitif tampilan untuk situs publik. Paralel dengan lib/ui.ts:
// sudut lembut, garis tipis, tombol utama kuning dengan teks hitam.
// Nilai warna dari token semantik (tokens.css) atau dari --s-* yang sudah ada.

export const container = "mx-auto w-full max-w-6xl px-6";

const press = "active:translate-y-px disabled:cursor-not-allowed disabled:active:translate-y-0";
const ring = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]";
const btnBase = `group inline-flex h-10 items-center justify-center gap-2 rounded-md px-5 text-sm font-medium transition-[background-color,border-color,transform] duration-fast ${press} ${ring}`;

/** Tombol utama: kuning bendera dengan teks hitam. */
export const btnOrange = `${btnBase} bg-[var(--brand-500)] font-semibold text-[var(--text-on-brand)] hover:bg-[var(--brand-400)]`;

/** Tombol sekunder di atas latar hitam (hero, CTA gelap). */
export const btnLineLight = `${btnBase} border border-white/40 text-white hover:border-white hover:bg-white/10`;

/** Tombol sekunder di atas latar mengikuti tema. */
export const btnLine = `${btnBase} border border-[var(--s-line)] text-[var(--s-head)] hover:border-[var(--s-head)] hover:bg-[var(--s-panel)]`;

export const inputSite =
  "h-10 w-full rounded-md border border-[var(--s-line)] bg-transparent px-3 text-sm text-[var(--s-fg)] outline-none transition-[border-color,box-shadow] duration-fast placeholder:text-[var(--s-muted)] hover:border-[var(--s-muted)] focus-visible:border-[var(--s-orange)] focus-visible:shadow-[var(--shadow-focus)] disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-[var(--state-danger-fg)]";

export const linkText =
  "font-medium text-[var(--s-orange-text)] underline underline-offset-4 transition-colors hover:no-underline";
