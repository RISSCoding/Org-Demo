import Link from "next/link";
import { Reveal } from "@/components/ux/reveal";
import { LogoMark } from "@/components/site/logo-mark";
import { EventRow } from "@/components/site/event-row";
import { PostRow } from "@/components/site/post-row";
import { DEPARTEMEN, LANGKAH_ANGGOTA, ORG, VISI } from "@/lib/site-content";
import { latestPosts, upcomingPublicEvents } from "@/lib/site-data";
import { btnLineLight, btnOrange, container, linkText } from "@/lib/site-ui";

export const metadata = { title: "ORG — Portal Organisasi" };
export const dynamic = "force-dynamic";

export default async function Home() {
  const [events, posts] = await Promise.all([upcomingPublicEvents(3), latestPosts(3)]);

  return (
    <>
      {/* Hero */}
      <section className="bg-black text-white">
        <div className={`${container} grid items-center gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24`}>
          <div className="space-y-7">
            <h1 className="s-display text-4xl sm:text-5xl lg:text-6xl">{ORG.name}</h1>
            <p className="text-lg text-white/80">{ORG.univ}</p>
            <p className="s-serif max-w-xl text-lg text-white/70">
              Wadah mahasiswa manajemen untuk mengembangkan potensi, saling berkomunikasi, dan belajar memimpin.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/register" className={btnOrange}>Daftar jadi anggota</Link>
              <Link href="/kegiatan" className={btnLineLight}>Lihat kegiatan</Link>
            </div>
          </div>
          <LogoMark />
        </div>
      </section>

      {/* Departemen */}
      <section id="departemen" className="scroll-mt-16 py-16">
        <div className={`${container} grid gap-8 md:grid-cols-[15rem_1fr]`}>
          <div className="space-y-3">
            <h2 className="s-display text-2xl text-[var(--s-head)]">Lima departemen</h2>
            <p className="text-sm text-[var(--s-muted)]">Tempat kamu bisa ikut bekerja dan belajar.</p>
          </div>
          <dl>
            {DEPARTEMEN.map((d, i) => (
              <Reveal key={d.short} index={i} className="grid gap-1 border-t border-[var(--s-line)] py-5 sm:grid-cols-[11rem_1fr] sm:gap-6">
                <dt className="text-lg font-semibold text-[var(--s-head)]">{d.short}</dt>
                <dd className="s-serif text-[var(--s-fg)]">{d.summary}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
        <p className={`${container} mt-4 md:pl-[17rem]`}>
          <Link href="/struktur" className={linkText}>Lihat struktur dan tugas lengkap</Link>
        </p>
      </section>

      {/* Visi */}
      <section className="bg-[var(--s-panel)] py-16">
        <div className={`${container} grid gap-8 md:grid-cols-[15rem_1fr]`}>
          <h2 className="s-display text-2xl text-[var(--s-head)]">Visi</h2>
          <div className="space-y-5">
            <p className="s-display max-w-3xl text-2xl text-[var(--s-head)] md:text-3xl">{VISI}</p>
            <Link href="/tentang#visi-misi" className={linkText}>Baca misi dan asas organisasi</Link>
          </div>
        </div>
      </section>

      {/* Menjadi anggota: urutan langkah */}
      <section className="py-16">
        <div className={`${container} grid gap-10 md:grid-cols-[15rem_1fr]`}>
          <div className="space-y-4">
            <h2 className="s-display text-2xl text-[var(--s-head)]">Menjadi anggota</h2>
            <p className="text-sm text-[var(--s-muted)]">
              Menurut aturan organisasi, anggota sah setelah menyelesaikan seluruh rangkaian orientasi dan
              memiliki sertifikatnya.
            </p>
            <Link href="/register" className={btnOrange}>Buat akun</Link>
          </div>
          <ol className="grid gap-px bg-[var(--s-line)] sm:grid-cols-2">
            {LANGKAH_ANGGOTA.map(([title, desc], i) => (
              <Reveal as="li" key={title} index={i} className="bg-[var(--s-bg)] p-6">
                <p className="s-display text-4xl text-[#ffa500]">{i + 1}</p>
                <p className="mt-3 text-lg font-semibold text-[var(--s-head)]">{title}</p>
                <p className="s-serif mt-1 text-[var(--s-muted)]">{desc}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Kegiatan */}
      <section className="border-t border-[var(--s-line)] py-16">
        <div className={`${container} grid gap-8 md:grid-cols-[15rem_1fr]`}>
          <h2 className="s-display text-2xl text-[var(--s-head)]">Kegiatan mendatang</h2>
          <div>
            {events.length === 0 ? (
              <p className="s-serif text-[var(--s-muted)]">
                Belum ada kegiatan publik yang dijadwalkan. Kegiatan baru akan muncul di sini begitu diumumkan.
              </p>
            ) : (
              <>
                <ul>{events.map((e) => <EventRow key={e.slug} event={e} />)}</ul>
                <p className="mt-4"><Link href="/kegiatan" className={linkText}>Semua kegiatan</Link></p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Berita */}
      <section className="border-t border-[var(--s-line)] py-16">
        <div className={`${container} grid gap-8 md:grid-cols-[15rem_1fr]`}>
          <h2 className="s-display text-2xl text-[var(--s-head)]">Berita terbaru</h2>
          <div>
            {posts.length === 0 ? (
              <p className="s-serif text-[var(--s-muted)]">
                Belum ada berita atau pengumuman. Informasi resmi himpunan akan diterbitkan di sini.
              </p>
            ) : (
              <>
                <ul>{posts.map((p) => <PostRow key={p.slug} post={p} />)}</ul>
                <p className="mt-4"><Link href="/berita" className={linkText}>Semua berita</Link></p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Aspirasi */}
      <section className="bg-black py-16 text-white">
        <div className={`${container} flex flex-col gap-6 md:flex-row md:items-center md:justify-between`}>
          <div className="max-w-2xl space-y-2">
            <h2 className="s-display text-2xl md:text-3xl">Punya saran, keluhan, atau laporan?</h2>
            <p className="s-serif text-white/70">
              Sampaikan langsung ke Komisi III Badan Pengawas Pengurus. Kamu boleh mengirim tanpa nama.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/aspirasi" className={btnOrange}>Kirim pesan</Link>
            <Link href="/aspirasi/lacak" className={btnLineLight}>Lacak pesan</Link>
          </div>
        </div>
      </section>
    </>
  );
}
