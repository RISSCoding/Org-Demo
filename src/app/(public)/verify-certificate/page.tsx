import { redirect } from "next/navigation";
import { btnOrange, inputSite } from "@/lib/site-ui";

export const metadata = { title: "Verifikasi Sertifikat — ORG", robots: { index: false } };

export default async function VerifyIndex({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const clean = id?.trim().toUpperCase();
  if (clean) redirect(`/verify-certificate/${encodeURIComponent(clean)}`);

  return (
    <div className="space-y-8">
      <header>
        <div className="mb-6 h-1 w-14 bg-[#ffa500]" aria-hidden />
        <h1 className="s-display text-4xl text-[var(--s-head)]">Verifikasi sertifikat</h1>
        <p className="s-serif mt-5 text-lg text-[var(--s-muted)]">
          Masukkan nomor sertifikat (contoh: HMN-2026-ABCD2345), atau scan QR di sertifikat dengan kamera HP.
        </p>
      </header>
      <form method="GET" className="space-y-2">
        <label htmlFor="id" className="text-sm font-medium">Nomor sertifikat</label>
        <div className="flex gap-2">
          <input
            id="id"
            name="id"
            required
            placeholder="HMN-2026-XXXXXXXX"
            className={`${inputSite} uppercase`}
            autoComplete="off"
          />
          <button type="submit" className={btnOrange}>Cek</button>
        </div>
      </form>
    </div>
  );
}
