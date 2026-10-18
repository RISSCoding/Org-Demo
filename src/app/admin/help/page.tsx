import { auth } from "@/auth";
import { HelpView, type HelpTab } from "@/components/help-view";
import { ShieldCheck, Server, Code2, Users, BookOpen } from "lucide-react";

export const metadata = { title: "Bantuan Admin — Portal Organisasi" };
export const dynamic = "force-dynamic";

const ALL_TABS: HelpTab[] = [
  { key: "pengurus", label: "Panduan Pengurus", file: "docs/OPERASIONAL.md", icon: <Users className="size-4" /> },
  { key: "superadmin", label: "Super Admin", file: "docs/PANDUAN_SUPER_ADMIN.md", icon: <ShieldCheck className="size-4" /> },
  { key: "maintenance", label: "Panduan Teknis", file: "docs/MAINTENANCE.md", icon: <Server className="size-4" /> },
  { key: "multi-tenant", label: "Arsitektur", file: "docs/ARSITEKTUR_MULTI_TENANT.md", icon: <Code2 className="size-4" /> },
  { key: "platform", label: "Tentang Platform", file: "docs/PANDUAN_PLATFORM.md", icon: <BookOpen className="size-4" /> },
];

// Hanya SUPER_ADMIN yang bisa melihat Panduan Teknis, Arsitektur, & Super Admin
const SUPERVISOR_ONLY = new Set(["maintenance", "superadmin", "multi-tenant"]);

export default async function AdminHelp({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  const isSuper = session?.user?.role === "SUPER_ADMIN";
  const tabs = isSuper ? ALL_TABS : ALL_TABS.filter((t) => !SUPERVISOR_ONLY.has(t.key));

  const { tab } = await searchParams;
  return (
    <HelpView
      title="Bantuan Admin"
      description="Panduan operasional, teknis, dan arsitektur untuk mengelola platform."
      tabs={tabs}
      activeKey={tab}
      basePath="/admin/help"
    />
  );
}
