import { HelpView, type HelpTab } from "@/components/help-view";
import { Users, BookOpen, ShieldCheck } from "lucide-react";

export const metadata = { title: "Bantuan — Portal Organisasi" };
export const dynamic = "force-dynamic";

const TABS: HelpTab[] = [
  { key: "anggota", label: "Panduan Anggota", file: "docs/PANDUAN_ANGGOTA.md", icon: <Users className="size-4" /> },
  { key: "pengurus", label: "Panduan Pengurus", file: "docs/OPERASIONAL.md", icon: <ShieldCheck className="size-4" /> },
  { key: "platform", label: "Tentang Platform", file: "docs/PANDUAN_PLATFORM.md", icon: <BookOpen className="size-4" /> },
];

export default async function DashboardHelp({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  return (
    <HelpView
      title="Pusat Bantuan"
      description="Pelajari cara menggunakan portal, baik sebagai anggota maupun pengurus."
      tabs={TABS}
      activeKey={tab}
      basePath="/dashboard/help"
    />
  );
}
