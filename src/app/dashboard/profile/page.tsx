import Link from "next/link";
import { BookOpen } from "lucide-react";
import { auth } from "@/auth";
import { ProfileForm, PasswordForm } from "@/components/profile-forms";
import { MySignature } from "@/components/signature-controls";
import { prisma } from "@/lib/prisma";
import { btnLine, cardCls } from "@/lib/ui";

export const metadata = { title: "Profil — HIMMAN UKRI" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  const u = await prisma.user.findUniqueOrThrow({
    where: { id: session!.user.id },
    select: { fullName: true, nim: true, email: true, batchYear: true, phoneNumber: true, avatarUrl: true, signatureUrl: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="s-display s-title text-3xl text-[var(--s-head)]">Profil</h1>
        <p className="text-sm text-muted-foreground">{u.fullName} · NPM {u.nim} · angkatan {u.batchYear} · {u.email}</p>
        <p className="text-xs text-muted-foreground">Nama, NPM, dan email diubah oleh pengurus bila ada kesalahan.</p>
      </div>
      <section className={`${cardCls} space-y-4 p-5`}>
        <h2 className="text-lg font-semibold">Data kontak</h2>
        <ProfileForm phoneNumber={u.phoneNumber} avatarUrl={u.avatarUrl} />
      </section>
      <section className={`${cardCls} max-w-2xl space-y-4 p-5`}>
        <div>
          <h2 className="text-lg font-semibold">Tanda tangan</h2>
          <p className="text-sm text-muted-foreground">
            Dipakai pada lembar pengesahan proposal dan LPJ bila kamu ketua pelaksana, sekretaris kegiatan, atau pengurus yang ikut menandatangani.
            Unggah gambar tanda tanganmu sendiri (PNG berlatar transparan paling rapi). Hanya kamu dan pengurus sekretariat yang bisa melihatnya.
          </p>
        </div>
        <MySignature url={u.signatureUrl} />
      </section>
      <section className={`${cardCls} space-y-4 p-5`}>
        <h2 className="text-lg font-semibold">Ganti password</h2>
        <PasswordForm />
      </section>
      <section className={`${cardCls} space-y-3 p-5`}>
        <div>
          <h2 className="text-lg font-semibold">Panduan penggunaan</h2>
          <p className="text-sm text-muted-foreground">
            Lihat lagi langkah awal: melengkapi profil, mengunggah tanda tangan, dan mengenal KTA digital.
          </p>
        </div>
        <Link href="/onboarding?replay=1" className={btnLine}>
          <BookOpen className="size-4" aria-hidden /> Buka panduan
        </Link>
      </section>
    </div>
  );
}
