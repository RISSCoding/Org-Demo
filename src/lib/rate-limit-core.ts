import { createHmac } from "node:crypto";

const secret = () => process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "dev-only-rate-limit-secret";

/** Pure: kunci mentah -> kunci tersimpan (deterministik, panjang tetap). */
export function rateLimitKey(raw: string): string {
  return createHmac("sha256", secret()).update(raw).digest("hex");
}

/**
 * Pure: IP klien dari header. x-real-ip didahulukan; untuk x-forwarded-for dipakai entri PERTAMA.
 * Catatan keamanan: ini hanya dapat dipercaya bila aplikasi berada di belakang proxy yang menimpa
 * header tersebut (Vercel, Cloudflare, Nginx dengan proxy_set_header). Bila server terbuka langsung
 * ke internet, penyerang bisa memalsukannya, jadi pembatas per-IP tidak berguna; pembatas per-akun tetap bekerja.
 */
export function ipFromHeaders(h: Pick<Headers, "get">): string {
  const real = h.get("x-real-ip")?.trim();
  if (real) return real;
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

