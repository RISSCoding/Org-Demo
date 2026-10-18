import { auth } from "@/auth";
import { ProfileForm, PasswordForm } from "@/components/profile-forms";
import { MySignature } from "@/components/signature-controls";
import { PageHeader } from "@/components/ui/page-header";
import { prisma } from "@/lib/prisma";
import { getTenantPrisma } from "@/lib/prisma-tenant";
import { cardCls } from "@/lib/ui";

export const metadata = { title: "Profil — ORG" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth()

  const tenantPrisma = getTenantPrisma(session!.user.organizationId!);;

  const u = await tenantPrisma.user.findUniqueOrThrow({
    where: { id: session!.user.id },
    select: {
      fullName: true,
      nim: true,
      email: true,
      batchYear: true,
      phoneNumber: true,
      avatarUrl: true,
      signatureUrl: true,
    },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-12">
      <PageHeader
        title="Profil Saya"
        description={`${u.fullName} · NPM ${u.nim} · Angkatan ${u.batchYear}`}
      />

      {/* Data Kontak */}
      <section className={`${cardCls} overflow-hidden`}>
        <div className="border-b border-[var(--border-subtle)] bg-[var(--surface-2)] px-6 py-4">
          <h2 className="text-base font-semibold">Data Diri</h2>
          <p className="text-sm text-muted-foreground">Perbarui foto dan nomor HP aktifmu.</p>
        </div>
        <div className="p-6">
          <ProfileForm
            email={u.email}
            phoneNumber={u.phoneNumber}
            avatarUrl={u.avatarUrl}
          />
        </div>
      </section>

      {/* Tanda Tangan */}
      <section className={`${cardCls} overflow-hidden`}>
        <div className="border-b border-[var(--border-subtle)] bg-[var(--surface-2)] px-6 py-4">
          <h2 className="text-base font-semibold">Tanda Tangan Digital</h2>
          <p className="text-sm text-muted-foreground">
            Dipakai otomatis pada dokumen dan sertifikat saat kamu menjadi panitia atau pengurus.
          </p>
        </div>
        <div className="p-6">
          <MySignature url={u.signatureUrl} />
        </div>
      </section>

      {/* Keamanan */}
      <section className={`${cardCls} overflow-hidden`}>
        <div className="border-b border-[var(--border-subtle)] bg-[var(--surface-2)] px-6 py-4">
          <h2 className="text-base font-semibold">Keamanan</h2>
          <p className="text-sm text-muted-foreground">Ganti password akunmu secara berkala.</p>
        </div>
        <div className="p-6">
          <PasswordForm />
        </div>
      </section>
    </div>
  );
}
