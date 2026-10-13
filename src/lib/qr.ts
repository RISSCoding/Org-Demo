import { verifySig } from "@/lib/security";

const TICKET = "HIMMAN|TKT|";

export const ticketPayload = (hash: string) => `${TICKET}${hash}`;

export type Scan =
  | { kind: "ticket"; hash: string }
  | { kind: "kta"; nim: string }
  | { kind: "nim"; nim: string };

/** Accepts event ticket QR, member KTA QR (signature verified), or a bare NPM typed by staff. */
export function parseScan(raw: string): Scan | null {
  const s = raw.trim();
  if (s.startsWith(TICKET)) {
    const hash = s.slice(TICKET.length);
    return /^[a-f0-9]{32}$/.test(hash) ? { kind: "ticket", hash } : null;
  }
  if (s.startsWith("HIMMAN|KTA|")) {
    const [, , nim, sig] = s.split("|");
    if (!nim || !sig || !/^\d{6,20}$/.test(nim)) return null;
    return verifySig(`KTA:${nim}`, sig) ? { kind: "kta", nim } : null;
  }
  if (/^\d{6,20}$/.test(s)) return { kind: "nim", nim: s };
  return null;
}
