import { prisma } from "@/lib/prisma";
import { holderSignatureUrl, OFFICER_SLOTS, type OfficerSlot } from "@/lib/officer-meta";

/** signatureUrl: tanda tangan akun (bila punya akun) atau yang diunggah pengurus (bila tidak). */
export type OfficerHolder = { id: number; userId: string | null; name: string; signatureUrl: string | null };
export type OfficerSnapshot = { slots: Partial<Record<OfficerSlot, OfficerHolder>>; advisors: OfficerHolder[] };

const BLANK_LINE = "..............................";

/** Pengurus inti dan Dewan Pembina saat ini. Nama akun yang tertaut selalu dibaca terbaru. */
export async function getOfficers(): Promise<OfficerSnapshot> {
  const rows = await prisma.orgOfficer.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      position: true,
      userId: true,
      name: true,
      signatureUrl: true,
      user: { select: { fullName: true, signatureUrl: true } },
    },
  });

  const snap: OfficerSnapshot = { slots: {}, advisors: [] };
  for (const r of rows) {
    const name = (r.user?.fullName ?? r.name ?? "").trim();
    if (!name) continue;
    const holder = { id: r.id, userId: r.userId, name, signatureUrl: holderSignatureUrl(r) };
    if (r.position === "ADVISOR") snap.advisors.push(holder);
    else if (!snap.slots[r.position]) snap.slots[r.position] = holder;
  }
  return snap;
}

/** Nama pemegang tiap jabatan, untuk ditampilkan di formulir. */
export async function getOfficerNames(): Promise<Partial<Record<OfficerSlot, string>>> {
  const { slots } = await getOfficers();
  const names: Partial<Record<OfficerSlot, string>> = {};
  for (const p of OFFICER_SLOTS) {
    const holder = slots[p];
    if (holder) names[p] = holder.name;
  }
  return names;
}

/** Penandatangan sertifikat: Ketua Himpunan, lalu CERT_SIGNER_NAME / CERT_SIGNER_TITLE bila jabatan belum diisi. */
export async function getCertificateSigner(): Promise<{ name: string; title: string }> {
  const { slots } = await getOfficers();
  return {
    name: slots.CHAIR?.name ?? process.env.CERT_SIGNER_NAME ?? BLANK_LINE,
    title: process.env.CERT_SIGNER_TITLE ?? "Ketua HIMMAN UKRI",
  };
}

/** Penandatangan laporan keuangan: Ketua Himpunan dan Bendahara Umum (env sebagai cadangan di renderer). */
export async function getFinanceSigners(): Promise<{ chair: string | undefined; treasurer: string | undefined }> {
  const { slots } = await getOfficers();
  return { chair: slots.CHAIR?.name, treasurer: slots.TREASURER?.name };
}
