import Image from "next/image";
import { PageHead, Section } from "@/components/site/section";
import { ASAS, LAMBANG_BENTUK, LAMBANG_WARNA, MISI, ORG, VISI } from "@/lib/site-content";

export const metadata = { title: "Tentang — HIMMAN UKRI" };

export default function Tentang() {
  return (
    <>
      <PageHead
        title="Tentang HIMMAN"
        intro="Himpunan Mahasiswa Manajemen adalah wadah mahasiswa manajemen untuk meningkatkan kualitas edukasi dan mengembangkan potensi, dengan Pancasila dan UUD 1945 sebagai asas serta Tri Dharma Perguruan Tinggi sebagai dasar berorganisasi."
      />

      <Section id="sejarah" title="Sejarah dan kedudukan">
        <div className="s-serif max-w-2xl space-y-4">
          <p>
            HIMMAN dibentuk pada 26 Oktober 2018 pukul 17.00 WIB di Aula Prof. Dr. Soemitro Djojohadikusumo, dan
            disahkan pada 23 November 2019 pukul 16.00 WIB di aula yang sama.
          </p>
          <p>
            Himpunan berada langsung di bawah Program Studi Manajemen dan dalam naungan {ORG.univ}, beralamat di{" "}
            {ORG.address}. Sifatnya otonom dan demokratis.
          </p>
          <p>
            Fungsinya sebagai wadah perkembangan potensi, komunikasi, dan pengembangan mahasiswa manajemen. Perannya
            menghimpun, membina, dan mengembangkan mahasiswa manajemen untuk mewujudkan tujuan organisasi.
          </p>
        </div>
      </Section>

      <Section id="visi-misi" title="Visi dan misi" panel>
        <div className="max-w-3xl space-y-8">
          <p className="s-display text-2xl text-[var(--s-head)] md:text-3xl">{VISI}</p>
          <div>
            <h3 className="mb-3 text-lg font-semibold text-[var(--s-head)]">Misi</h3>
            <ol className="s-serif list-decimal space-y-2 pl-6">
              {MISI.map((m) => <li key={m}>{m}</li>)}
            </ol>
          </div>
        </div>
      </Section>

      <Section id="asas" title="Asas aktivitas">
        <dl className="max-w-3xl">
          {ASAS.map(([name, desc]) => (
            <div key={name} className="grid gap-1 border-t border-[var(--s-line)] py-4 first:border-t-0 sm:grid-cols-[10rem_1fr] sm:gap-6">
              <dt className="font-semibold text-[var(--s-head)]">{name}</dt>
              <dd className="s-serif">{desc}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="lambang" title="Lambang" panel>
        <div className="grid gap-10 lg:grid-cols-[16rem_1fr]">
          <Image src="/logo-himman.png" alt="Lambang Himpunan Mahasiswa Manajemen UKRI" width={256} height={256} className="size-52 lg:size-64" />
          <div className="space-y-10">
            <div>
              <h3 className="mb-3 text-lg font-semibold text-[var(--s-head)]">Arti bentuk</h3>
              <dl>
                {LAMBANG_BENTUK.map(([k, v]) => (
                  <div key={k} className="grid gap-1 border-t border-[var(--s-line)] py-3 sm:grid-cols-[10rem_1fr] sm:gap-6">
                    <dt className="font-medium text-[var(--s-head)]">{k}</dt>
                    <dd className="s-serif">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <h3 className="mb-3 text-lg font-semibold text-[var(--s-head)]">Arti warna</h3>
              <dl>
                {LAMBANG_WARNA.map(([k, v, hex]) => (
                  <div key={k} className="grid gap-1 border-t border-[var(--s-line)] py-3 sm:grid-cols-[10rem_1fr] sm:gap-6">
                    <dt className="flex items-center gap-2 font-medium text-[var(--s-head)]">
                      <span className="inline-block size-4 border border-[var(--s-line)]" style={{ background: hex }} aria-hidden />
                      {k}
                    </dt>
                    <dd className="s-serif">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
