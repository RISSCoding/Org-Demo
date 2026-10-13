import { PageHead, Section } from "@/components/site/section";
import { BPH_INTI, BPP, DEPARTEMEN } from "@/lib/site-content";

export const metadata = { title: "Struktur — HIMMAN UKRI" };

// Isi nama pemegang jabatan di sini sampai data periode kepengurusan tersedia di database.
// Kunci = nama jabatan persis seperti pada daftar di site-content.ts.
const HOLDERS: Record<string, string | undefined> = {};

function Role({ role, tasks }: { role: string; tasks: string }) {
  const holder = HOLDERS[role];
  return (
    <div className="grid gap-1 border-t border-[var(--s-line)] py-4 first:border-t-0 sm:grid-cols-[13rem_1fr] sm:gap-6">
      <dt>
        <span className="font-semibold text-[var(--s-head)]">{role}</span>
        {holder && <span className="block text-sm text-[var(--s-muted)]">{holder}</span>}
      </dt>
      <dd className="s-serif">{tasks}</dd>
    </div>
  );
}

export default function Struktur() {
  return (
    <>
      <PageHead
        title="Struktur organisasi"
        intro="Kepengurusan HIMMAN terdiri dari Badan Pengurus Harian (BPH) yang menjalankan program, dan Badan Pengawas Pengurus (BPP) yang mengawasinya. Masa baktinya satu periode, yaitu satu tahun."
      />

      <Section id="bph" title="Badan Pengurus Harian">
        <dl className="max-w-3xl">
          {BPH_INTI.map((r) => <Role key={r.role} {...r} />)}
        </dl>
        <p className="s-serif mt-6 max-w-3xl text-[var(--s-muted)]">
          Setiap departemen dipimpin seorang kepala, dibantu sekretaris departemen dan beberapa anggota. Kepala
          departemen melapor kepada Ketua Himpunan sebelum dan sesudah kegiatan.
        </p>
      </Section>

      <Section id="departemen" title="Departemen" panel>
        <div className="grid max-w-4xl gap-x-10 gap-y-9 md:grid-cols-2">
          {DEPARTEMEN.map((d) => (
            <article key={d.short}>
              <h3 className="text-lg font-semibold text-[var(--s-head)]">{d.name}</h3>
              <ul className="s-serif mt-2 list-disc space-y-1 pl-5">
                {d.tasks.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      <Section id="bpp" title="Badan Pengawas Pengurus">
        <p className="s-serif mb-4 max-w-3xl text-[var(--s-muted)]">
          BPP adalah lembaga legislatif yang mengawasi BPH. Anggotanya berasal dari demisioner kabinet sebelumnya.
        </p>
        <dl className="max-w-3xl">
          {BPP.map((r) => <Role key={r.role} {...r} />)}
        </dl>
      </Section>

      <Section id="pembina" title="Dewan Pembina" panel>
        <p className="s-serif max-w-3xl">
          Dewan Pembina adalah pihak yang ditugaskan fakultas untuk membina HIMMAN. Tugasnya memberi motivasi,
          pembinaan, dan semangat, serta saran dan kritik demi kemajuan organisasi.
        </p>
      </Section>
    </>
  );
}
