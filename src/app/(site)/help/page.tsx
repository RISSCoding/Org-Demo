import { HelpView, type HelpTab } from "@/components/help-view";
import { BookOpen, Users } from "lucide-react";

export const metadata = { title: "Pusat Bantuan — Portal Organisasi" };
export const dynamic = "force-dynamic";

const TABS: HelpTab[] = [
  { key: "platform", label: "Tentang Platform", file: "docs/PANDUAN_PLATFORM.md", icon: <BookOpen className="size-4" /> },
  { key: "anggota", label: "Mulai Menggunakan", file: "docs/PANDUAN_ANGGOTA.md", icon: <Users className="size-4" /> },
];

export default async function HelpPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-14">
      <HelpView
        title="Pusat Bantuan"
        description="Pelajari tentang platform multi-tenant ini, atau baca panduan dasar untuk mulai menggunakan portal."
        tabs={TABS}
        activeKey={tab}
        basePath="/help"
      />
    </div>
  );
}
