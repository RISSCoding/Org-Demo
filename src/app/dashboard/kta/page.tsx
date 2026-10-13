import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { KtaCard } from "@/components/kta-card";
import { memberTitle } from "@/lib/member-title";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "KTA Digital — HIMMAN UKRI" };
export const dynamic = "force-dynamic";

export default async function KtaPage() {
  const session = await auth();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session!.user.id },
    select: {
      fullName: true,
      nim: true,
      batchYear: true,
      officerRoles: { select: { position: true }, take: 1 },
      member: {
        select: {
          ktaNumber: true,
          status: true,
          divisionRole: true,
          division: { select: { name: true } },
        },
      },
    },
  });
  if (!user.member) redirect("/dashboard");

  const officerPosition = user.officerRoles[0]?.position ?? null;
  const title = memberTitle({
    officerPosition,
    divisionName: user.member.division?.name ?? null,
    divisionRole: user.member.divisionRole,
  });
  const subtitle = officerPosition && user.member.division ? `Departemen ${user.member.division.name}` : null;

  // QR berisi URL verifikasi: scan pakai kamera HP langsung membuka halaman verifikasi,
  // dan scanner event tetap bisa membacanya lewat parseScan().
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  const payload = `${proto}://${host}/verify-member/${user.member.ktaNumber}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="s-display s-title text-3xl text-[var(--s-head)]">KTA Digital</h1>
        <p className="text-sm text-muted-foreground">
          Tunjukkan QR ini saat check-in event atau verifikasi keanggotaan. Gunakan mode check-in agar QR tampil besar dan layar tidak mati.
        </p>
      </div>
      <KtaCard
        size="lg"
        name={user.fullName}
        nim={user.nim}
        batchYear={user.batchYear}
        ktaNumber={user.member.ktaNumber}
        title={title}
        subtitle={subtitle}
        payload={payload}
        status={user.member.status}
        showActions
      />
    </div>
  );
}
