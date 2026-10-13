import { LetterForm } from "@/components/letter-form";
import { dateKey } from "@/lib/finance";
import { isLetterType } from "@/lib/letters";
import { getOfficerNames } from "@/lib/officers";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

export const metadata = { title: "Arsip Baru — HIMMAN UKRI" };

export default async function NewLetter({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  await requirePermission("secretariat:manage");
  const { type } = await searchParams;
  const events = await prisma.event.findMany({ orderBy: { startDate: "desc" }, take: 200, select: { id: true, title: true } });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="s-display s-title text-3xl text-[var(--s-head)]">Arsip baru</h1>
        <p className="text-sm text-muted-foreground">Catat surat masuk, surat keluar, proposal, atau LPJ.</p>
      </div>
      <LetterForm defaultType={isLetterType(type) ? type : undefined} today={dateKey(new Date())} officers={await getOfficerNames()} events={events} />
    </div>
  );
}
