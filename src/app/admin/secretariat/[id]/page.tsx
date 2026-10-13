import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { deleteLetterAction, forwardLetterAction } from "@/actions/secretariat";
import { Badge } from "@/components/badge";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { LetterForm } from "@/components/letter-form";
import { SubmitButton } from "@/components/submit-button";
import { formatDate, formatDateTime } from "@/lib/datetime";
import { dateKey } from "@/lib/finance";
import { KIND_LABEL, LETTER_LABEL } from "@/lib/letters";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { btnGhost } from "@/lib/ui";

export const metadata = { title: "Detail Arsip — HIMMAN UKRI" };

export default async function LetterDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePermission("secretariat:manage");
  const { id } = await params;
  const letter = await prisma.officialLetter.findUnique({ where: { id } });
  if (!letter) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/secretariat" className={`${btnGhost} -ml-3`}>
        <ArrowLeft className="size-4" /> Kembali ke arsip
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="s-display s-title text-3xl text-[var(--s-head)]">{letter.letterNumber ?? "Tanpa nomor"}</h1>
            <Badge tone="muted">{letter.kind ? KIND_LABEL[letter.kind] : LETTER_LABEL[letter.type]}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Tanggal surat {formatDate(letter.letterDate)} · dicatat {formatDateTime(letter.createdAt)}
          </p>
        </div>
        {user.role === "SUPER_ADMIN" && (
          <form action={deleteLetterAction}>
            <input type="hidden" name="id" value={letter.id} />
            <ConfirmSubmit
              title="Hapus arsip surat ini?"
              confirmLabel="Hapus arsip"
              message="Arsip beserta dokumennya dihapus. Nomor urut tidak akan dipakai ulang."
              className={`${btnGhost} text-red-600 dark:text-red-400`}
            >
              Hapus
            </ConfirmSubmit>
          </form>
        )}
      </div>
      {letter.type === "SURAT_MASUK" && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-border bg-card p-4">
          <div>
            <p className="text-sm font-medium">
              {letter.forwardedAt ? "Sudah diteruskan kepada Ketua" : "Belum diteruskan kepada Ketua"}
            </p>
            <p className="text-xs text-muted-foreground">
              {letter.forwardedAt ? formatDateTime(letter.forwardedAt) : "Setelah dicatat, surat masuk diteruskan kepada Ketua (PO Pasal 3 ayat 6)."}
            </p>
          </div>
          {!letter.forwardedAt && (
            <form action={forwardLetterAction}>
              <input type="hidden" name="id" value={letter.id} />
              <SubmitButton pendingLabel="Menyimpan…">Tandai sudah diteruskan</SubmitButton>
            </form>
          )}
        </div>
      )}
      <LetterForm
        today={dateKey(new Date())}
        letter={{
          id: letter.id,
          type: letter.type,
          kind: letter.kind,
          nature: letter.nature,
          activityName: letter.activityName,
          letterNumber: letter.letterNumber,
          subject: letter.subject,
          senderReceiver: letter.senderReceiver,
          summary: letter.summary,
          documentUrl: letter.documentUrl,
          letterDate: dateKey(letter.letterDate),
          receivedAt: letter.receivedAt ? dateKey(letter.receivedAt) : null,
        }}
      />
    </div>
  );
}
