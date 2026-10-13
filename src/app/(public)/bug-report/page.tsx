import { BugForm } from "@/components/site/bug-form";

export const metadata = {
  title: "Laporkan masalah teknis — HIMMAN UKRI",
  robots: { index: false },
};

export default async function BugReportPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  // Batasi panjang dan hanya terima path internal agar tidak jadi celah XSS/redirect.
  const safeFrom =
    from && from.startsWith("/") && from.length <= 200 && !from.startsWith("//")
      ? from
      : undefined;

  return (
    <div className="space-y-8">
      <header>
        <div className="mb-6 h-1 w-14 bg-[#ffa500]" aria-hidden />
        <h1 className="s-display text-4xl text-[var(--s-head)]">Laporkan masalah teknis</h1>
        <p className="s-serif mt-5 text-lg text-[var(--s-muted)]">
          Ketemu bug, tombol yang tidak bekerja, atau tampilan yang aneh? Ceritakan di sini.
          Tidak perlu login — laporanmu masuk ke pengurus teknis dengan kode pelacakan.
        </p>
      </header>
      <BugForm defaultPage={safeFrom} />
      <aside className="max-w-2xl space-y-3 border-t border-[var(--s-line)] pt-6 text-sm text-[var(--s-muted)]">
        <p className="font-semibold text-[var(--s-head)]">Bukan masalah teknis?</p>
        <p>
          Untuk saran, keluhan, atau laporan ke Komisi III Badan Pengawas, gunakan{" "}
          <a
            href="/aspirasi"
            className="font-medium text-[var(--s-orange-text)] underline underline-offset-4 hover:no-underline"
          >
            kotak aspirasi
          </a>
          .
        </p>
      </aside>
    </div>
  );
}
