import { HelpView, type HelpTab } from "@/components/help-view";

export const metadata = { title: "Bantuan — ORG" };
export const dynamic = "force-dynamic";

const TABS: HelpTab[] = [
  { key: "anggota", label: "Panduan anggota", file: "docs/PANDUAN_ANGGOTA.md" },
];

export default async function HelpPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-14">
      <HelpView
        title="Pusat bantuan"
        description="Panduan memakai portal anggota ORG. Untuk pertanyaan lain, hubungi pengurus."
        tabs={TABS}
        activeKey={tab}
        basePath="/help"
      />
    </div>
  );
}
