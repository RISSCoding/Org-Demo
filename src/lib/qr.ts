import { verifySig } from "@/lib/security";

const TICKET = "HIMMAN|TKT|";
const VERIFY_PATH = "/verify-member/";

export const ticketPayload = (hash: string) => `${TICKET}${hash}`;

export type Scan =
  | { kind: "ticket"; hash: string }
  | { kind: "kta"; nim: string }
  | { kind: "nim"; nim: string };

/**
 * Menerima:
 * - QR tiket event: "HIMMAN|TKT|<hash>"
 * - QR KTA berformat URL: "https://.../verify-member/<npm>.<hash>"
 * - QR KTA format lama: "HIMMAN|KTA|<npm>|<hash>"
 * - NPM yang diketik manual oleh petugas
 */
export function parseScan(raw: string): Scan | null {
  const s = raw.trim();

  // QR KTA sebagai URL — memuat path /verify-member/<npm>.<hash>
  const at = s.indexOf(VERIFY_PATH);
  if (at >= 0) {
    const rest = s.slice(at + VERIFY_PATH.length);
    const m = /^(\d{6,20})\.([a-f0-9]{32})/.exec(rest);
    if (m && verifySig(`KTA:${m[1]}`, m[2])) return { kind: "kta", nim: m[1] };
    return null;
  }

  if (s.startsWith(TICKET)) {
    const hash = s.slice(TICKET.length);
    return /^[a-f0-9]{32}$/.test(hash) ? { kind: "ticket", hash } : null;
  }

  // QR KTA format lama
  if (s.startsWith("HIMMAN|KTA|")) {
    const [, , nim, sig] = s.split("|");
    if (!nim || !sig || !/^\d{6,20}$/.test(nim)) return null;
    return verifySig(`KTA:${nim}`, sig) ? { kind: "kta", nim } : null;
  }

  if (/^\d{6,20}$/.test(s)) return { kind: "nim", nim: s };
  return null;
}
