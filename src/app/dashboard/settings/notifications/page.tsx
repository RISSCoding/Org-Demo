import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { getConsent, getPreferences } from "@/lib/notifications";
import { PageHeader } from "@/components/ui/page-header";
import { SettingsForm } from "@/components/notifications/settings-form";
import { prisma } from "@/lib/prisma";
import { getTenantPrisma } from "@/lib/prisma-tenant";
import { cardCls, linkCls } from "@/lib/ui";

export const metadata = { title: "Pengaturan Notifikasi — ORG" };
export const dynamic = "force-dynamic";

export default async function NotificationSettings() {
  const session = await auth()

  const tenantPrisma = getTenantPrisma(session!.user.organizationId!);;

  const userId = session!.user.id;

  const [prefs, consent, user] = await Promise.all([
    getPreferences(userId),
    getConsent(userId),
    tenantPrisma.user.findUnique({
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

      <section className={`${cardCls} p-5`}>
        <SettingsForm
          initial={{
            email: prefs.emailEnabled,
            whatsapp: prefs.whatsappEnabled,
            emailAddress: user?.email ?? "",
            whatsappNumber: user?.phoneNumber ?? "",
            emailConsentAt: consent?.emailConsentAt?.toISOString() ?? null,
            emailRevokedAt: consent?.emailRevokedAt?.toISOString() ?? null,
            whatsappConsentAt: consent?.whatsappConsentAt?.toISOString() ?? null,
            whatsappRevokedAt: consent?.whatsappRevokedAt?.toISOString() ?? null,
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
