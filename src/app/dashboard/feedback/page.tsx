import Link from "next/link";
import { auth } from "@/auth";
import { Badge } from "@/components/badge";
import { formatDate } from "@/lib/datetime";
import { SENDER_STATUS, STATUS_TONE } from "@/lib/feedback";
import { prisma } from "@/lib/prisma";
import { btnPrimary, cardCls, linkCls } from "@/lib/ui";

export const metadata = { title: "Pesan Saya — HIMMAN UKRI" };
export const dynamic = "force-dynamic";

export default async function MyFeedback() {
  const session = await auth();
  // Hanya pesan yang dikirim dengan identitas. Pesan anonim memang tidak terhubung ke akun mana pun.
  const items = await prisma.feedback.findMany({
    where: { senderId: session!.user.id, isAnonymous: false },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true, trackingCode: true, category: true, subject: true, message: true,
      status: true, response: true, respondedAt: true, createdAt: true,
    },
  });

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="s-display s-title text-3xl text-[var(--s-head)]">Pesan Saya</h1>
          <p className="text-sm text-muted-foreground">Aspirasi, keluhan, dan laporan yang kamu kirim dengan namamu.</p>
        </div>
        <Link href="/aspirasi" className={btnPrimary}>Kirim pesan</Link>
      </div>

      <p className="text-sm text-muted-foreground">
        Pesan yang dikirim tanpa nama tidak muncul di sini karena tidak terhubung ke akunmu. Pantau pesan itu dengan
        kodenya di halaman{" "}
        <Link href="/aspirasi/lacak" className={linkCls}>lacak pesan</Link>.
      </p>

      {items.length === 0 ? (
        <p className={`${cardCls} p-6 text-sm text-muted-foreground`}>
          Kamu belum mengirim pesan dengan identitas. Pesan yang kamu kirim setelah masuk dan tanpa mencentang
          &ldquo;Kirim tanpa nama&rdquo; akan tampil di sini.
        </p>
      ) : (
        <ul className="space-y-4">
          {items.map((m) => (
            <li key={m.id} className={`${cardCls} space-y-3 p-5`}>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={STATUS_TONE[m.status]}>{SENDER_STATUS[m.status][0]}</Badge>
                <Badge tone="muted">{m.category}</Badge>
                <span className="text-xs text-muted-foreground">{formatDate(m.createdAt)}</span>
              </div>
              <h2 className="text-lg font-semibold text-[var(--s-head)]">{m.subject}</h2>
              <p className="s-serif line-clamp-3 whitespace-pre-wrap break-words text-muted-foreground">{m.message}</p>
              {m.response ? (
                <div className="border-l-4 border-[#ffa500] bg-muted/50 px-4 py-3">
                  <p className="text-sm font-semibold text-[var(--s-head)]">
                    Tanggapan Komisi III{m.respondedAt ? `, ${formatDate(m.respondedAt)}` : ""}
                  </p>
                  <p className="s-serif mt-1 whitespace-pre-wrap break-words">{m.response}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{SENDER_STATUS[m.status][1]}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Kode <span className="font-mono">{m.trackingCode}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
