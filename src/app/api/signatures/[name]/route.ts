import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { readPrivate } from "@/lib/private-files";

const NAME = /^[a-f0-9-]{36}\.(png|jpg)$/;
/** Pengurus yang mengelola anggota atau sekretariat boleh melihat tanda tangan mana pun; yang lain hanya miliknya sendiri. */
const STAFF_PERMISSIONS = ["member:manage", "secretariat:manage"];

/** Tanda tangan itu data sensitif (bisa dipalsukan): hanya pemilik dan pengurus yang boleh membukanya. */
export async function GET(_req: Request, ctx: { params: Promise<{ name: string }> }) {
  const user = (await auth())?.user;
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { name } = await ctx.params;
  const m = NAME.exec(name);
  if (!m) return new Response("Not found", { status: 404 });

  const isStaff = user.role === "SUPER_ADMIN" || STAFF_PERMISSIONS.some((p) => user.permissions.includes(p));
  if (!isStaff) {
    const own = await prisma.user.findFirst({ where: { id: user.id, signatureUrl: `/api/signatures/${name}` }, select: { id: true } });
    if (!own) return new Response("Forbidden", { status: 403 });
  }

  const buf = await readPrivate("signatures", name);
  if (!buf) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": m[1] === "png" ? "image/png" : "image/jpeg",
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
