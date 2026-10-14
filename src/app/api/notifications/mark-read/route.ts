import { auth } from "@/auth";
import { markNotificationRead } from "@/actions/notifications";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return new Response("Bad request", { status: 400 });
  await markNotificationRead(id);
  return new Response(null, { status: 204 });
}
