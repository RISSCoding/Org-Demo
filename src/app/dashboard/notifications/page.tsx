import Link from "next/link";
import { Settings } from "lucide-react";
import { auth } from "@/auth";
import { getList } from "@/lib/notifications";
import { PageHeader } from "@/components/ui/page-header";
import { NotificationList } from "@/components/notifications/list";
import { btnLine } from "@/lib/ui";

export const metadata = { title: "Notifikasi — ORG" };
export const dynamic = "force-dynamic";

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const session = await auth();
  const { filter } = await searchParams;
  const unreadOnly = filter === "unread";

  const items = await getList(session!.user.id, { unreadOnly, limit: 100 });

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Notifikasi"
        description="Semua pemberitahuan tentang akun, iuran, event, dan aspirasi."
        action={
          <Link href="/dashboard/settings/notifications" className={btnLine}>
            <Settings className="size-4" aria-hidden />
            Pengaturan
          </Link>
        }
      />
      <NotificationList
        items={items.map((i) => ({
          ...i,
          createdAt: i.createdAt.toISOString(),
          readAt: i.readAt?.toISOString() ?? null,
        }))}
        unreadOnly={unreadOnly}
      />
    </div>
  );
}
