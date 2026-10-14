import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { getShellCounts } from "@/lib/shell-counts";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const u = session?.user;
  if (!u) redirect("/login?callbackUrl=/admin");
  if (u.role !== "SUPER_ADMIN" && u.role !== "ADMIN_EXECUTIVE") redirect("/dashboard");

  const counts = await getShellCounts({ id: u.id, role: u.role, permissions: u.permissions });

  return (
    <AppShell
      variant="admin"
      user={{ name: u.name ?? u.nim, nim: u.nim, role: u.role, permissions: u.permissions }}
      counts={counts}
    >
      {children}
    </AppShell>
  );
}
