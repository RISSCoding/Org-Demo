import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, FileDown, Minus } from "lucide-react";
import { deleteLetterAction, forwardLetterAction } from "@/actions/secretariat";
import { Badge } from "@/components/badge";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { LetterForm } from "@/components/letter-form";
import { SubmitButton } from "@/components/submit-button";
import { formatDate, formatDateTime } from "@/lib/datetime";
import { resolveApprovalSigners } from "@/lib/approval";
import { isApprovalDoc } from "@/lib/approval-meta";
import { dateKey } from "@/lib/finance";
import { KIND_LABEL, LETTER_LABEL } from "@/lib/letters";
import { getOfficerNames } from "@/lib/officers";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { btnGhost, btnLine, cardCls } from "@/lib/ui";

export const metadata = { title: "Detail Arsip — HIMMAN UKRI" };

export default async function LetterDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePermission("secretariat:manage");
  const { id } = await params;
  const letter = await prisma.officialLetter.findUnique({ where: { id } });
  if (!letter) notFound();

  const [events, approvalSigners] = await Promise.all([
    isApprovalDoc(letter.type)
      ? prisma.event.findMany({ orderBy: { startDate: "desc" }, take: 200, select: { id: true, title: true } })
      : Promise.resolve([]),
    resolveApprovalSigners(letter),
  ]);

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
      {approvalSigners.length > 0 && (
        <section className={`${cardCls} space-y-3 p-4`} aria-labelledby="approval-title">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="approval-title" className="font-semibold">Lembar pengesahan</h2>
              <p className="text-sm text-muted-foreground">
                {letter.campusFunds ? "Menyangkut dana kampus: enam penandatangan." : "Tidak menyangkut dana kampus: tiga penandatangan."}{" "}
                {letter.eventId ? "Ketua pelaksana dan sekretaris kegiatan diambil dari panitia kegiatan tertaut." : "Tautkan kegiatan di bawah agar ketua pelaksana dan sekretaris kegiatan terisi."}
              </p>
            </div>
            <a href={`/api/secretariat/${letter.id}/approval-sheet`} target="_blank" rel="noreferrer" className={btnLine}>
              <FileDown className="size-4" aria-hidden /> Unduh lembar (PDF)
            </a>
          </div>
          <ul className="divide-y divide-border rounded-sm border border-border text-sm">
            {approvalSigners.map((sg) => (
              <li key={sg.key} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                <div className="min-w-0">
                  <p className="font-medium">{sg.label}</p>
                  <p className="text-muted-foreground">{sg.name ?? "Belum ditentukan"}</p>
                </div>
                <span className={`inline-flex items-center gap-1 text-xs ${sg.signatureUrl ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}`}>
                  {sg.signatureUrl ? <Check className="size-3.5" aria-hidden /> : <Minus className="size-3.5" aria-hidden />}
                  {sg.signatureUrl ? "Tanda tangan ada" : "Tanda tangan belum diunggah, dibiarkan kosong"}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            Tanda tangan yang belum diunggah dibiarkan kosong di PDF supaya bisa ditandatangani basah setelah dicetak.
          </p>
        </section>
      )}
      <LetterForm
        today={dateKey(new Date())}
        officers={await getOfficerNames()}
        events={events}
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
          eventId: letter.eventId,
          campusFunds: letter.campusFunds,
        }}
      />
    </div>
  );
}
