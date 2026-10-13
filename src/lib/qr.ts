import { verifySig } from "@/lib/security";

const TICKET = "HIMMAN|TKT|";
const VERIFY_PATH = "/verify-member/";

export const ticketPayload = (hash: string) => `${TICKET}${hash}`;

export type Scan =
  | { kind: "ticket"; hash: string }
  | { kind: "kta"; nim: string }
  | { kind: "ktaNumber"; number: string }
  | { kind: "nim"; nim: string };

export function parseScan(raw: string): Scan | null {
  const s = raw.trim();

  const at = s.indexOf(VERIFY_PATH);
  if (at >= 0) {
    const rest = s.slice(at + VERIFY_PATH.length);
    // Format baru: nomor KTA 6-7 digit (opsional suffix -2, -3)
    const n = /^(\d{6,7}(?:-\d{1,2})?)(?:[?#]|$)/.exec(rest);
    if (n) return { kind: "ktaNumber", number: n[1] };
    // Format lama: <nim>.<32 hex> bertanda tangan
    const m = /^(\d{6,20})\.([a-f0-9]{32})/.exec(rest);
    if (m && verifySig(`KTA:${m[1]}`, m[2])) return { kind: "kta", nim: m[1] };
    return null;
  }

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
