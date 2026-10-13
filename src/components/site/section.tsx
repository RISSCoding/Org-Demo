import { container } from "@/lib/site-ui";

/** Kepala halaman dalam: judul besar, pengantar, dan garis kuning pendek. */
export function PageHead({ title, intro }: { title: string; intro?: string }) {
  return (
    <header className={`${container} pb-12 pt-14`}>
      <div className="mb-6 h-1 w-14 bg-[#ffa500]" aria-hidden />
      <h1 className="s-display max-w-3xl text-4xl text-[var(--s-head)] md:text-5xl">{title}</h1>
      {intro && <p className="s-serif mt-5 max-w-2xl text-lg text-[var(--s-muted)]">{intro}</p>}
    </header>
  );
}

/** Bagian halaman: judul menempel di kiri (desktop), isi di kanan. */
export function Section({
  id,
  title,
  children,
  panel = false,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
  panel?: boolean;
}) {
  return (
    <section id={id} className={`border-t border-[var(--s-line)] py-14 ${panel ? "bg-[var(--s-panel)]" : ""}`}>
      <div className={`${container} grid gap-8 md:grid-cols-[15rem_1fr]`}>
        <h2 className="s-display text-2xl text-[var(--s-head)] md:sticky md:top-24 md:self-start">{title}</h2>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
