import { PageHead, Section } from "@/components/site/section";
import { formatDate } from "@/lib/datetime";
import { SENDER_STATUS } from "@/lib/feedback";
import { prisma } from "@/lib/prisma";
import { btnOrange, inputSite } from "@/lib/site-ui";

export const metadata = { title: "Lacak aspirasi — HIMMAN UKRI", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Lacak({ searchParams }: { searchParams: Promise<{ kode?: string }> }) {
  const { kode } = await searchParams;
  const raw = kode?.trim().slice(0, 40) ?? "";
  const code = /^asp-/i.test(raw) ? raw.toUpperCase() : raw;

  const item = code
    ? await prisma.feedback.findUnique({
        where: { trackingCode: code },
        select: { category: true, subject: true, status: true, createdAt: true, response: true, respondedAt: true },
      })
    : null;

  return (
    <>
      <PageHead title="Lacak pesan" intro="Masukkan kode yang kamu terima saat mengirim pesan, misalnya ASP-ABCD2345." />
      <Section title="Cek status">
        <div className="max-w-xl space-y-8">
          <form method="GET" className="flex gap-2">
            <label htmlFor="kode" className="sr-only">Kode pelacakan</label>
            <input
              id="kode"
              name="kode"
              defaultValue={code}
              required
              autoComplete="off"
              placeholder="ASP-XXXXXXXX"
              className={`${inputSite} font-mono uppercase`}
            />
            <button type="submit" className={btnOrange}>Cek</button>
          </form>

          {code && !item && (
            <p role="alert" className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              Kode tidak ditemukan. Periksa lagi penulisannya, termasuk awalan ASP-.
            </p>
          )}

          {item && (
            <div className="border border-[var(--s-line)] p-5">
              <p className="s-display text-2xl text-[var(--s-head)]">{SENDER_STATUS[item.status][0]}</p>
              <p className="s-serif mt-1 text-[var(--s-muted)]">{SENDER_STATUS[item.status][1]}</p>
              <dl className="mt-5 divide-y divide-[var(--s-line)] text-sm">
                <div className="grid grid-cols-[8rem_1fr] gap-3 py-2"><dt className="text-[var(--s-muted)]">Jenis</dt><dd>{item.category}</dd></div>
                <div className="grid grid-cols-[8rem_1fr] gap-3 py-2"><dt className="text-[var(--s-muted)]">Judul</dt><dd>{item.subject}</dd></div>
                <div className="grid grid-cols-[8rem_1fr] gap-3 py-2"><dt className="text-[var(--s-muted)]">Dikirim</dt><dd>{formatDate(item.createdAt)}</dd></div>
              </dl>
              {item.response && (
                <div className="mt-5 border-l-4 border-[#ffa500] bg-[var(--s-panel)] px-4 py-3">
                  <p className="text-sm font-semibold text-[var(--s-head)]">
                    Tanggapan Komisi III{item.respondedAt ? `, ${formatDate(item.respondedAt)}` : ""}
                  </p>
                  <p className="s-serif mt-1 whitespace-pre-wrap break-words">{item.response}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
