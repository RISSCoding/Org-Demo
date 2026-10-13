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

/** Format lama `HIMMAN|KTA|<npm>|<hash>`. Dipertahankan agar QR cetak lama tetap terbaca. */
export const ktaPayload = (nim: string) => `HIMMAN|KTA|${nim}|${sign(`KTA:${nim}`)}`;

/**
 * Verifikasi KTA lewat nomor anggota (mis. "025207"). Nomor bersifat publik
 * (tercetak di KTA), jadi tidak ditandatangani. Halaman verify menerapkan
 * pembatas laju per IP untuk mencegah enumerasi.
 */
export const isValidKtaNumber = (v: string) => /^\d{6,7}(-\d{1,2})?$/.test(v);

/** Disimpan di event_registrations.qr_code_hash */
export const ticketHash = (eventId: string, userId: string) =>
  sign(`TICKET:${eventId}:${userId}`);

const ROMAN = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];
export const toRoman = (month1to12: number) => ROMAN[month1to12 - 1];
