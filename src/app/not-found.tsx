import Link from "next/link";
import { SiteShell } from "@/components/site/site-shell";
import { btnLine, btnOrange, container, linkText } from "@/lib/site-ui";

export const metadata = { title: "Halaman tidak ditemukan — ORG" };

export default function NotFound() {
  return (
    <SiteShell>
      <section className={`${container} ux-enter py-20`}>
        <div className="mb-6 h-1 w-14 bg-[#ffa500]" aria-hidden />
        <p className="text-sm text-[var(--s-muted)]">Kode 404</p>
        <h1 className="s-display mt-2 max-w-3xl text-4xl text-[var(--s-head)] md:text-5xl">Halaman ini tidak ada</h1>
        <p className="s-serif mt-5 max-w-xl text-lg text-[var(--s-muted)]">
          Alamatnya mungkin salah ketik, atau halamannya sudah dipindah atau dihapus. Mulai dari salah satu tempat di bawah ini.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className={btnOrange}>Ke beranda</Link>
          <Link href="/kegiatan" className={btnLine}>Lihat kegiatan</Link>
          <Link href="/berita" className={btnLine}>Baca berita</Link>
        </div>
        <p className="mt-8 text-sm text-[var(--s-muted)]">
          Sudah punya akun? <Link href="/login" className={linkText}>Masuk ke portal anggota</Link>
        </p>
      </section>
    </SiteShell>
  );
}
