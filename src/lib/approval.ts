import type { LetterType } from "@prisma/client";
import { APPROVAL_LABEL, approvalKeysFor, type ApprovalKey } from "@/lib/approval-meta";
import { getOfficers } from "@/lib/officers";
import { prisma } from "@/lib/prisma";

export type ApprovalSigner = {
  key: ApprovalKey;
  label: string;
  /** null bila jabatan belum diisi / belum ada panitia yang ditetapkan. */
  name: string | null;
  signatureUrl: string | null;
};

/**
 * Penandatangan proposal/LPJ beserta nama dan tanda tangannya.
 * Ketua pelaksana dan sekretaris kegiatan dibaca dari panitia yang DITERIMA pada event tertaut;
 * Ketua Himpunan dan pihak kampus dari tabel pengurus. Tanda tangan yang belum diunggah dikembalikan null.
 */
export async function resolveApprovalSigners(input: {
  type: LetterType;
  campusFunds: boolean;
  eventId: string | null;
}): Promise<ApprovalSigner[]> {
  const keys = approvalKeysFor(input.type, input.campusFunds);
  if (keys.length === 0) return [];

  const [officers, committee] = await Promise.all([
    getOfficers(),
    input.eventId
      ? prisma.committeeApplication.findMany({
          where: { eventId: input.eventId, status: "ACCEPTED", role: { in: ["CHAIR", "SECRETARY"] } },
          orderBy: { createdAt: "asc" },
          select: { role: true, user: { select: { fullName: true, signatureUrl: true } } },
        })
      : Promise.resolve([]),
  ]);
  const fromCommittee = (role: "CHAIR" | "SECRETARY") => committee.find((c) => c.role === role)?.user;

  return keys.map((key): ApprovalSigner => {
    const label = APPROVAL_LABEL[key];
    if (key === "EVENT_CHAIR" || key === "EVENT_SECRETARY") {
      const u = fromCommittee(key === "EVENT_CHAIR" ? "CHAIR" : "SECRETARY");
      return { key, label, name: u?.fullName ?? null, signatureUrl: u?.signatureUrl ?? null };
    }
    const holder = officers.slots[key];
    return { key, label, name: holder?.name ?? null, signatureUrl: holder?.signatureUrl ?? null };
  });
}
