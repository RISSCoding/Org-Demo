import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { prisma } from "@/lib/prisma";
import { getTenantPrisma } from "@/lib/prisma-tenant";
import { getShellCounts } from "@/lib/shell-counts";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  const tenantPrisma = getTenantPrisma(session!.user.organizationId!);;

  const u = session?.user;
  if (!u) redirect("/login?callbackUrl=/dashboard");

  // Anggota yang belum menyelesaikan tutorial diarahkan ke /onboarding.
  // Admin/ADMIN_EXECUTIVE tidak dipaksa: mereka masuk dari /admin dan
  // biasanya bukan anggota biasa.
  const isStaff = u.role === "SUPER_ADMIN" || u.role === "ADMIN_EXECUTIVE";
  if (!isStaff) {
    const me = await tenantPrisma.user.findUnique({
      where: { id: u.id },
      select: {
        onboardedAt: true,
        approvalStatus: true,
        member: { select: { id: true } },
      },
    });
    if (me && me.approvalStatus === "APPROVED" && me.member && !me.onboardedAt) {
      redirect("/onboarding");
    }
  }

  const counts = await getShellCounts({ id: u.id, role: u.role, permissions: u.permissions });

  return (
    <AppShell
      variant="member"
      user={{ name: u.name ?? u.nim, nim: u.nim, role: u.role, permissions: u.permissions }}
      counts={counts}
    >
      {children}
    </AppShell>
  );
}
