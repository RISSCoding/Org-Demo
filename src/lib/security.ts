import { createHmac, timingSafeEqual } from "node:crypto";

const secret = () => {
  const s = process.env.QR_HMAC_SECRET;
  if (!s) throw new Error("QR_HMAC_SECRET is not set");
  return s;
};

export const sign = (payload: string) =>
  createHmac("sha256", secret()).update(payload).digest("hex").slice(0, 32);

export function verifySig(payload: string, sig: string) {
  const a = Buffer.from(sign(payload));
  const b = Buffer.from(sig);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Token verifikasi KTA: `<npm>.<hash>`. Dipakai di URL /verify-member/<token> dan isi QR. */
export const ktaVerifyToken = (nim: string) => `${nim}.${sign(`KTA:${nim}`)}`;

/** Format lama `HIMMAN|KTA|<npm>|<hash>`. Dipertahankan agar QR cetak lama tetap terbaca. */
export const ktaPayload = (nim: string) => `HIMMAN|KTA|${nim}|${sign(`KTA:${nim}`)}`;

/** Disimpan di event_registrations.qr_code_hash */
export const ticketHash = (eventId: string, userId: string) =>
  sign(`TICKET:${eventId}:${userId}`);

const ROMAN = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];
export const toRoman = (month1to12: number) => ROMAN[month1to12 - 1];
