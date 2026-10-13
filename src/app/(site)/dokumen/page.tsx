import { Download } from "lucide-react";
import { PageHead, Section } from "@/components/site/section";
import { DOKUMEN } from "@/lib/site-content";
import { btnLine } from "@/lib/site-ui";

export const metadata = { title: "Dokumen — HIMMAN UKRI" };

export default function Dokumen() {
  return (
    <>
      <PageHead
        title="Dokumen organisasi"
        intro="Aturan yang menjadi pegangan seluruh anggota dan pengurus. Setiap anggota berhak mendapat informasi yang jelas dan terbuka tentang kebijakan organisasi."
      />
      <Section title="Konstitusi 2026">
        <ul className="max-w-3xl">
          {DOKUMEN.map((d) => (
            <li key={d.file} className="grid gap-4 border-t border-[var(--s-line)] py-6 first:border-t-0 sm:grid-cols-[1fr_auto] sm:items-start">
              <div className="space-y-1.5">
                <h3 className="text-xl font-semibold text-[var(--s-head)]">{d.title}</h3>
                <p className="s-serif text-[var(--s-fg)]">{d.desc}</p>
                <p className="text-sm text-[var(--s-muted)]">{d.nomor}</p>
                <p className="text-sm text-[var(--s-muted)]">Ditetapkan {d.ditetapkan}</p>
              </div>
              <a href={d.file} download className={btnLine}>
                <Download className="mr-2 size-4" aria-hidden /> Unduh PDF, {d.ukuran}
              </a>
            </li>
          ))}
        </ul>
        <p className="s-serif mt-6 max-w-3xl text-[var(--s-muted)]">
          Anggaran Dasar hanya dapat diubah melalui Musyawarah Besar Mahasiswa Manajemen (M3). ART dan PO dapat diubah melalui M3 dan Musyawarah Luar Biasa.
        </p>
      </Section>
    </>
  );
}
