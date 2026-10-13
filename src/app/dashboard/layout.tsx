import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const u = session?.user;
  if (!u) redirect("/login?callbackUrl=/dashboard");

  return (
    <AppShell
      variant="member"
      user={{ name: u.name ?? u.nim, nim: u.nim, role: u.role, permissions: u.permissions }}
    >
      {children}
    </AppShell>
  );
}
