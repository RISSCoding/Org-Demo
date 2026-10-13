import { auth } from "@/auth";
import { ProfileForm, PasswordForm } from "@/components/profile-forms";
import { prisma } from "@/lib/prisma";
import { cardCls } from "@/lib/ui";

export const metadata = { title: "Profil — HIMMAN UKRI" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  const u = await prisma.user.findUniqueOrThrow({
    where: { id: session!.user.id },
    select: { fullName: true, nim: true, email: true, batchYear: true, phoneNumber: true, avatarUrl: true },
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
      <section className={`${cardCls} space-y-4 p-5`}>
        <h2 className="text-lg font-semibold">Ganti password</h2>
        <PasswordForm />
      </section>
    </div>
  );
}
