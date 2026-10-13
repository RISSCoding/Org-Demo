import { HelpView, type HelpTab } from "@/components/help-view";

export const metadata = { title: "Bantuan — ORG" };
export const dynamic = "force-dynamic";

const TABS: HelpTab[] = [
  { key: "anggota", label: "Untuk anggota", file: "docs/PANDUAN_ANGGOTA.md" },
  { key: "pengurus", label: "Untuk pengurus", file: "docs/OPERASIONAL.md" },
];

export default async function DashboardHelp({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  return (
    <HelpView
      title="Bantuan"
      description="Panduan pemakaian portal. Semua yang kamu butuhkan untuk memakai dan mengelola ORG."
      tabs={TABS}
      activeKey={tab}
      basePath="/dashboard/help"
    />
  );
}
