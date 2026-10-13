export const container = "mx-auto w-full max-w-6xl px-6";

const btnBase =
  "inline-flex h-11 items-center justify-center rounded-sm px-5 text-sm font-semibold transition-[background-color,border-color,transform] duration-150 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2";

/** Tombol utama: kuning bendera dengan teks hitam. */
export const btnOrange = `${btnBase} bg-[#ffa500] text-black hover:bg-[#ffb733]`;
/** Tombol sekunder di atas latar hitam. */
export const btnLineLight = `${btnBase} border border-white/40 text-white hover:border-white hover:bg-white/10`;
/** Tombol sekunder di atas latar mengikuti tema. */
export const btnLine = `${btnBase} border border-[var(--s-line)] text-[var(--s-head)] hover:border-[var(--s-head)] hover:bg-[var(--s-panel)]`;

export const inputSite =
  "w-full rounded-sm border border-[var(--s-line)] bg-transparent px-3 py-2.5 text-base text-[var(--s-fg)] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-[var(--s-muted)] hover:border-[var(--s-muted)] focus-visible:border-[var(--s-orange)] focus-visible:shadow-[0_0_0_3px_rgba(255,165,0,0.22)] aria-[invalid=true]:border-red-500";

export const linkText =
  "font-medium text-[var(--s-orange-text)] underline underline-offset-4 transition-colors hover:no-underline";
