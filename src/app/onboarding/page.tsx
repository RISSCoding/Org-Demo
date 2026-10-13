import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Wizard } from "@/components/onboarding/wizard";
import { memberTitle } from "@/lib/member-title";
import { prisma } from "@/lib/prisma";
import { ktaVerifyToken } from "@/lib/security";

export const metadata = { title: "Selamat datang — HIMMAN UKRI" };
export const dynamic = "force-dynamic";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ replay?: string }>;
}) {
  const { replay } = await searchParams;
  const isReplay = replay === "1";

  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/onboarding");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: {
      fullName: true,
      nim: true,
      batchYear: true,
      phoneNumber: true,
      avatarUrl: true,
      signatureUrl: true,
      onboardedAt: true,
      approvalStatus: true,
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

  // Sudah menyelesaikan tutorial dan bukan mode replay: jangan tampilkan lagi.
  if (user.onboardedAt && !isReplay) redirect("/dashboard");
  // Belum disetujui pengurus: tidak ada yang bisa dilakukan di sini.
  if (user.approvalStatus !== "APPROVED" || !user.member) {
    return (
      <div className="space-y-4">
        <h1 className="s-display s-title text-3xl text-[var(--s-head)]">Akunmu belum aktif</h1>
        <p className="text-sm text-muted-foreground">
          Pendaftaranmu masih menunggu persetujuan pengurus. Kamu akan bisa mengikuti tutorial setelah akun disetujui.
        </p>
      </div>
    );
  }

  const officerPosition = user.officerRoles[0]?.position ?? null;
  const ktaTitle = memberTitle({
    officerPosition,
    divisionName: user.member.division?.name ?? null,
    divisionRole: user.member.divisionRole,
  });
  const ktaSubtitle = officerPosition && user.member.division ? `Departemen ${user.member.division.name}` : null;

  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  const ktaPayloadUrl = `${proto}://${host}/verify-member/${ktaVerifyToken(user.nim)}`;

  return (
    <Wizard
      replay={isReplay}
      user={{
        fullName: user.fullName,
        nim: user.nim,
        batchYear: user.batchYear,
        phoneNumber: user.phoneNumber,
        avatarUrl: user.avatarUrl,
        signatureUrl: user.signatureUrl,
        ktaNumber: user.member.ktaNumber,
        ktaTitle,
        ktaSubtitle,
        ktaPayload: ktaPayloadUrl,
        memberStatus: user.member.status,
      }}
    />
  );
}
