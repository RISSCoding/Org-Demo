import { auth } from "@/auth";
import { readPrivate } from "@/lib/private-files";

const NAME = /^[a-f0-9-]{36}\.pdf$/;

/** Letter documents are internal: only secretariat staff (and SUPER_ADMIN) may open them. */
export async function GET(_req: Request, ctx: { params: Promise<{ name: string }> }) {
  const user = (await auth())?.user;
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (user.role !== "SUPER_ADMIN" && !user.permissions.includes("secretariat:manage")) {
    return new Response("Forbidden", { status: 403 });
  }

  const { name } = await ctx.params;
  if (!NAME.test(name)) return new Response("Not found", { status: 404 });

  const buf = await readPrivate("letters", name);
  if (!buf) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
