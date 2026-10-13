import { auth } from "@/auth";
import { readPrivate } from "@/lib/private-files";
import { prisma } from "@/lib/prisma";

const NAME = /^[a-f0-9-]{36}\.(png|jpg|webp)$/;
const MIME: Record<string, string> = { png: "image/png", jpg: "image/jpeg", webp: "image/webp" };

export async function GET(_req: Request, ctx: { params: Promise<{ name: string }> }) {
  const user = (await auth())?.user;
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { name } = await ctx.params;
  const m = NAME.exec(name);
  if (!m) return new Response("Not found", { status: 404 });

  const isStaff = user.role === "SUPER_ADMIN" || user.permissions.includes("finance:read");
  if (!isStaff) {
    const own = await prisma.memberDues.findFirst({
      where: { userId: user.id, proofUrl: `/api/proofs/${name}` },
      select: { id: true },
    });
    if (!own) return new Response("Forbidden", { status: 403 });
  }

  const buf = await readPrivate("proofs", name);
  if (!buf) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": MIME[m[1]],
      "Content-Disposition": "inline",
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
