import { auth } from "@/auth";
import { HelpView, type HelpTab } from "@/components/help-view";

export const metadata = { title: "Bantuan — ORG" };
export const dynamic = "force-dynamic";

const ALL_TABS: HelpTab[] = [
  { key: "anggota", label: "Untuk anggota", file: "docs/PANDUAN_ANGGOTA.md" },
  { key: "pengurus", label: "Untuk pengurus", file: "docs/OPERASIONAL.md" },
  { key: "maintenance", label: "Panduan teknis", file: "docs/MAINTENANCE.md" },
  { key: "serah-terima", label: "Serah terima", file: "docs/SERAH_TERIMA.md" },
];

// Halaman ini sudah dilindungi middleware: /admin/* hanya untuk admin.
// Tapi tab teknis hanya untuk SUPER_ADMIN karena berisi info server.
const SUPERVISOR_ONLY = new Set(["maintenance", "serah-terima"]);

export default async function AdminHelp({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  const isSuper = session?.user?.role === "SUPER_ADMIN";

  const tabs = isSuper
    ? ALL_TABS
    : ALL_TABS.filter((t) => !SUPERVISOR_ONLY.has(t.key));

  const { tab } = await searchParams;
  return (
    <HelpView
      title="Bantuan"
      description={
        isSuper
          ? "Semua dokumentasi: panduan pengurus, teknis, dan serah terima."
          : "Panduan anggota dan pengurus. Untuk dokumentasi teknis, hubungi Super Admin."
      }
      tabs={tabs}
      activeKey={tab}
      basePath="/admin/help"
    />
  );
}
