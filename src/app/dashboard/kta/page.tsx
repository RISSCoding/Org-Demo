import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { KtaCard } from "@/components/kta-card";
import { prisma } from "@/lib/prisma";
import { ktaPayload } from "@/lib/security";

export const metadata = { title: "KTA Digital — HIMMAN UKRI" };

export default async function KtaPage() {
  const session = await auth();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session!.user.id },
    select: {
      fullName: true,
      nim: true,
      batchYear: true,
      member: { select: { ktaNumber: true, division: { select: { name: true } } } },
    },
  });
  if (!user.member) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="s-display s-title text-3xl text-[var(--s-head)]">KTA Digital</h1>
        <p className="text-sm text-muted-foreground">
          Tunjukkan QR ini saat check-in event atau verifikasi keanggotaan.
        </p>
      </div>
      <KtaCard
        size="lg"
        name={user.fullName}
        nim={user.nim}
        batchYear={user.batchYear}
        ktaNumber={user.member.ktaNumber}
        division={user.member.division?.name}
        payload={ktaPayload(user.nim)}
      />
    </div>
  );
}
