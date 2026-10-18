import { renderApprovalSheetPdf } from "@/lib/approval-sheet-pdf";
import { resolveApprovalSigners } from "@/lib/approval";
import { APPROVAL_DOC_LABEL, isApprovalDoc } from "@/lib/approval-meta";
import { formatDate, formatDateTime } from "@/lib/datetime";
import { PARTY_LABEL } from "@/lib/letters";
import { prisma } from "@/lib/prisma";
import { getTenantPrisma } from "@/lib/prisma-tenant";
import { ForbiddenError, requirePermission, UnauthorizedError } from "@/lib/rbac";
import { loadSignature } from "@/lib/signatures";

/** Lembar pengesahan proposal/LPJ, dibuat saat diminta supaya selalu memakai nama dan tanda tangan terbaru. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("secretariat:manage");
  } catch (e) {
    if (e instanceof UnauthorizedError) return new Response("Unauthorized", { status: 401 });
    if (e instanceof ForbiddenError) return new Response("Forbidden", { status: 403 });
    throw e;
  }

  const { id } = await ctx.params;
  const letter = await tenantPrisma.officialLetter.findUnique({
    where: { id },
    select: {
      type: true,
      letterNumber: true,
      subject: true,
      senderReceiver: true,
      activityName: true,
      letterDate: true,
      campusFunds: true,
      eventId: true,
      event: { select: { title: true } },
    },
  });
  if (!letter) return new Response("Not found", { status: 404 });
  if (!isApprovalDoc(letter.type)) return new Response("Hanya proposal dan LPJ yang punya lembar pengesahan.", { status: 400 });

  const signers = await resolveApprovalSigners(letter);
  const withImages = await Promise.all(
    signers.map(async (sg) => ({ label: sg.label, name: sg.name, signature: await loadSignature(sg.signatureUrl) })),
  );

  const pdf = await renderApprovalSheetPdf({
    docLabel: APPROVAL_DOC_LABEL[letter.type],
    number: letter.letterNumber,
    subject: letter.subject,
    partyLabel: PARTY_LABEL[letter.type],
    party: letter.senderReceiver,
    activity: letter.event?.title ?? letter.activityName,
    dateText: formatDate(letter.letterDate),
    campusFunds: letter.campusFunds,
    signers: withImages,
    printedAt: formatDateTime(new Date()),
  });

  const slug = (letter.letterNumber ?? id).replace(/[^A-Za-z0-9-]+/g, "-");
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="lembar-pengesahan-${slug}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
