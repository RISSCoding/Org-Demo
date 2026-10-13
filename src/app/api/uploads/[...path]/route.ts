import { getBlob } from "@/lib/blob";

const PUBLIC_DIRS = new Set(["events", "posts", "avatars"]); // folder privat (bukti, surat, sertifikat) punya route berautentikasi sendiri
const MIME: Record<string, string> = { png: "image/png", jpg: "image/jpeg", webp: "image/webp" };
const NAME = /^[a-f0-9-]{36}\.(png|jpg|webp)$/;

export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: segs } = await ctx.params;
  if (segs.length !== 2) return new Response("Not found", { status: 404 });
  const [dir, name] = segs;
  const m = NAME.exec(name);
  if (!PUBLIC_DIRS.has(dir) || !m) return new Response("Not found", { status: 404 });

  try {
    const buf = await getBlob(`${dir}/${name}`);
    if (!buf) return new Response("Not found", { status: 404 });
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": MIME[m[1]],
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Storage error", { status: 502 });
  }
}
