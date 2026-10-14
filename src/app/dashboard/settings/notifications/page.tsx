import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { getConsent, getPreferences } from "@/lib/notifications";
import { PageHeader } from "@/components/ui/page-header";
import { PreferencesForm } from "@/components/notifications/preferences-form";
import { ConsentPanel } from "@/components/notifications/consent-panel";
import { prisma } from "@/lib/prisma";
import { cardCls, linkCls } from "@/lib/ui";

export const metadata = { title: "Pengaturan Notifikasi — ORG" };
export const dynamic = "force-dynamic";

export default async function NotificationSettings() {
  const session = await auth();
  const userId = session!.user.id;

  const [prefs, consent, user] = await Promise.all([
    getPreferences(userId),
    getConsent(userId),
    prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, phoneNumber: true },
    }),
  ]);

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/dashboard/notifications"
        className={`${linkCls} inline-flex items-center gap-1.5 text-sm`}
      >
        <ArrowLeft className="size-4" aria-hidden /> Kembali ke daftar notifikasi
      </Link>

      <PageHeader
        title="Pengaturan notifikasi"
        description="Pilih pemberitahuan apa yang mau kamu terima, dan di mana kamu menerimanya."
      />

      <section className={`${cardCls} space-y-5 p-5`}>
        <div>
          <h2 className="text-lg font-semibold">Jenis notifikasi</h2>
          <p className="text-sm text-muted-foreground">
            Pemberitahuan yang kamu terima di dalam aplikasi (bell icon).
          </p>
        </div>
        <PreferencesForm
          initial={{
            duesDue: prefs.duesDue,
            eventReminder: prefs.eventReminder,
            committeeDecided: prefs.committeeDecided,
            feedbackResponse: prefs.feedbackResponse,
            announcement: prefs.announcement,
            digestMode: prefs.digestMode === "daily" ? "daily" : "instant",
            quietHoursStart: prefs.quietHoursStart,
            quietHoursEnd: prefs.quietHoursEnd,
          }}
        />
      </section>

      <section className={`${cardCls} space-y-5 p-5`}>
        <div>
          <h2 className="text-lg font-semibold">Kanal di luar aplikasi</h2>
          <p className="text-sm text-muted-foreground">
            Notifikasi juga bisa dikirim ke email dan WhatsApp. Bisa dicabut kapan saja.
          </p>
        </div>
        <ConsentPanel
          initial={{
            email: prefs.emailEnabled,
            whatsapp: prefs.whatsappEnabled,
            emailAddress: user?.email ?? "",
            whatsappNumber: user?.phoneNumber ?? "",
            emailConsentAt: consent?.emailConsentAt?.toISOString() ?? null,
            emailRevokedAt: consent?.emailRevokedAt?.toISOString() ?? null,
            whatsappConsentAt: consent?.whatsappConsentAt?.toISOString() ?? null,
            whatsappRevokedAt: consent?.whatsappRevokedAt?.toISOString() ?? null,
          }}
        />
      </section>
    </div>
  );
}
