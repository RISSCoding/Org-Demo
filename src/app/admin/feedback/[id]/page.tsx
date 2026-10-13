import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/badge";
import { FeedbackAdminForm } from "@/components/feedback-admin-form";
import { formatDateTime } from "@/lib/datetime";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/feedback";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { btnGhost, cardCls } from "@/lib/ui";

export const metadata = { title: "Detail Aspirasi — HIMMAN UKRI" };
export const dynamic = "force-dynamic";

export default async function FeedbackDetail({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("aspirasi:manage");
  const { id } = await params;
  const item = await prisma.feedback.findUnique({
    where: { id },
    include: { sender: { select: { fullName: true, nim: true } } },
  });
  if (!item) notFound();

  const named = !item.isAnonymous && item.sender;

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/feedback" className={`${btnGhost} -ml-3`}>
        <ArrowLeft className="size-4" /> Kembali ke kotak aspirasi
      </Link>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={STATUS_TONE[item.status]}>{STATUS_LABEL[item.status]}</Badge>
          <Badge tone="muted">{item.category}</Badge>
        </div>
        <h1 className="s-display s-title text-3xl text-[var(--s-head)]">{item.subject}</h1>
        <p className="text-sm text-muted-foreground">
          Dikirim {formatDateTime(item.createdAt)}, kode <span className="font-mono">{item.trackingCode}</span>
        </p>
      </header>

      <section aria-labelledby="pengirim" className={`${cardCls} p-5`}>
        <h2 id="pengirim" className="text-sm font-semibold text-[var(--s-head)]">Pengirim</h2>
        {named ? (
          <p className="mt-1">
            {item.sender!.fullName} <span className="text-muted-foreground">NPM {item.sender!.nim}</span>
          </p>
        ) : (
          <p className="mt-1 text-muted-foreground">Anonim. Identitas pengirim tidak tercatat dan tidak bisa dilacak.</p>
        )}
        {named && (
          <p className="mt-2 text-xs text-muted-foreground">
            Pengirim memilih menyertakan identitas. Jaga kerahasiaannya dan jangan menyebarkannya di luar Komisi III.
          </p>
        )}
      </section>

      <section aria-labelledby="isi" className="space-y-2">
        <h2 id="isi" className="text-lg font-semibold text-[var(--s-head)]">Isi pesan</h2>
        <p className="s-serif whitespace-pre-wrap break-words">{item.message}</p>
      </section>

      <section aria-labelledby="tindak" className={`${cardCls} space-y-4 p-5`}>
        <h2 id="tindak" className="text-lg font-semibold text-[var(--s-head)]">Tindak lanjut</h2>
        {item.respondedAt && (
          <p className="text-xs text-muted-foreground">Tanggapan terakhir ditulis {formatDateTime(item.respondedAt)}.</p>
        )}
        <FeedbackAdminForm id={item.id} status={item.status} response={item.response} />
      </section>
    </div>
  );
}
