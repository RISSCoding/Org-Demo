import Link from "next/link";
import { FeedbackForm } from "@/components/site/feedback-form";
import { PageHead, Section } from "@/components/site/section";
import { linkText } from "@/lib/site-ui";

export const metadata = { title: "Aspirasi — ORG" };

export default function Aspirasi() {
  return (
    <>
      <PageHead
        title="Kotak aspirasi"
        intro="Sampaikan saran, keluhan, atau laporan kepada Komisi III (Advokasi dan Aspirasi) Badan Pengawas Pengurus. Pesan boleh dikirim dari mahasiswa maupun pengurus."
      />
      <Section title="Kirim pesan">
        <div className="grid max-w-4xl gap-12 lg:grid-cols-[1fr_16rem]">
          <FeedbackForm />
          <aside className="space-y-4 text-sm text-[var(--s-muted)]">
            <p className="font-semibold text-[var(--s-head)]">Soal privasi</p>
            <p>
              Kirim tanpa nama dan identitasmu tidak tercatat di pesan. Alamat jaringanmu pun tidak disimpan di database.
            </p>
            <p>Setelah terkirim, kamu mendapat kode untuk memantau status pesan.</p>
            <p>
              <Link href="/aspirasi/lacak" className={linkText}>Sudah punya kode? Lacak pesanmu</Link>
            </p>
            <p className="border-t border-[var(--s-line)] pt-4">
              Ketemu bug atau tombol yang tidak bekerja?{" "}
              <Link href="/bug-report" className={linkText}>Laporkan masalah teknis</Link>.
            </p>
          </aside>
        </div>
      </Section>
    </>
  );
}
