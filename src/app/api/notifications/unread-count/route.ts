import { auth } from "@/auth";
import { getUnreadCount } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ count: 0 });
  const count = await getUnreadCount(session.user.id);
  return Response.json({ count }, { headers: { "Cache-Control": "no-store" } });
}
