import { auth } from "@/auth";
import { getRecent } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ items: [] });
  const items = await getRecent(session.user.id, 5);
  return Response.json({ items }, { headers: { "Cache-Control": "no-store" } });
}
