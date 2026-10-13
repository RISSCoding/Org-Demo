import { redirect } from "next/navigation";
import { btnOrange, inputSite } from "@/lib/site-ui";
import { isValidKtaNumber } from "@/lib/security";

export const metadata = {
  title: "Verifikasi anggota — ORG",
  robots: { index: false },
};

export default async function VerifyIndex({
  searchParams,
}: {
  searchParams: Promise<{ kta?: string }>;
}) {
  const { kta } = await searchParams;
  const clean = kta?.trim().toLowerCase();
  if (clean && isValidKtaNumber(clean)) {
    redirect(`/verify-member/${encodeURIComponent(clean)}`);
  }

  return (
    <div className="space-y-8">
      <header>
        <div className="mb-6 h-1 w-14 bg-[#ffa500]" aria-hidden />
        <h1 className="s-display text-4xl text-[var(--s-head)]">Verifikasi anggota</h1>
        <p className="s-serif mt-5 text-lg text-[var(--s-muted)]">
          Masukkan nomor anggota yang tercetak di KTA (contoh: <span className="font-mono">025207</span>), atau
          scan QR di KTA dengan kamera HP.
        </p>
      </header>

      <form method="GET" className="space-y-2">
        <label htmlFor="kta" className="text-sm font-medium">Nomor anggota</label>
        <div className="flex gap-2">
          <input
            id="kta"
            name="kta"
            required
            placeholder="025207"
            inputMode="numeric"
            autoComplete="off"
            pattern="\d{6,7}(-\d{1,2})?"
            className={`${inputSite} font-mono`}
          />
          <button type="submit" className={btnOrange}>Cek</button>
        </div>
        <p className="text-xs text-[var(--s-muted)]">
          Nomor terdiri dari 6 digit angka (mis. <span className="font-mono">025207</span>). Bila ada dua orang
          dengan nomor sama, ditambahkan akhiran huruf/angka (mis. <span className="font-mono">025207-2</span>).
        </p>
      </form>
    </div>
  );
}
