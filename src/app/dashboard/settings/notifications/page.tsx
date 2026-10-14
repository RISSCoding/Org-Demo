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
        description="Pilih di mana kamu mau diingatkan, dan tentang apa saja."
      />

      {/* 1. Kanal — yang paling penting, muncul pertama */}
      <section className={`${cardCls} space-y-5 p-5`}>
        <div>
          <h2 className="text-lg font-semibold">Kirim pengingat ke mana</h2>
          <p className="text-sm text-muted-foreground">
            Notifikasi di dalam aplikasi selalu aktif. Kamu bisa menambahkan email dan WhatsApp
            supaya tidak lupa hal penting.
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

      {/* 2. Jenis notifikasi — fine-tuning setelah kanal */}
      <section className={`${cardCls} space-y-5 p-5`}>
        <div>
          <h2 className="text-lg font-semibold">Pengingat tentang apa</h2>
          <p className="text-sm text-muted-foreground">
            Pilih jenis pemberitahuan yang ingin kamu terima. Matikan yang menurutmu tidak perlu.
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
    </div>
  );
}
