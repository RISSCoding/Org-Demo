import { EventRow } from "@/components/site/event-row";
import { PageHead, Section } from "@/components/site/section";
import { pastPublicEvents, upcomingPublicEvents } from "@/lib/site-data";

export const metadata = { title: "Kegiatan — HIMMAN UKRI" };
export const dynamic = "force-dynamic";

export default async function Kegiatan() {
  const [upcoming, past] = await Promise.all([upcomingPublicEvents(), pastPublicEvents(12)]);

  return (
    <>
      <PageHead title="Kegiatan" intro="Kegiatan terbuka HIMMAN. Untuk mendaftar, kamu perlu masuk ke akunmu." />
      <Section title="Akan datang dan berlangsung">
        {upcoming.length === 0 ? (
          <p className="s-serif text-[var(--s-muted)]">
            Belum ada kegiatan publik yang dijadwalkan. Kegiatan baru akan muncul di sini begitu diumumkan.
          </p>
        ) : (
          <ul className="max-w-3xl">{upcoming.map((e) => <EventRow key={e.slug} event={e} />)}</ul>
        )}
      </Section>
      {past.length > 0 && (
        <Section title="Sudah selesai" panel>
          <ul className="max-w-3xl">{past.map((e) => <EventRow key={e.slug} event={e} past />)}</ul>
        </Section>
      )}
    </>
  );
}
