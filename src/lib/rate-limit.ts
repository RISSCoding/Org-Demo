import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ipFromHeaders, rateLimitKey } from "@/lib/rate-limit-core";

/**
 * Pembatas laju berbasis database (jendela tetap), dibagi antar semua instance server.
 * Satu pernyataan SQL atomik: tidak ada race antara "baca hitungan" dan "naikkan hitungan".
 *
 * Kunci di-HMAC sebelum disimpan, jadi tabel tidak berisi IP atau NPM mentah
 * (penting untuk aspirasi anonim: alamat pengirim tidak boleh bisa dibaca dari database).
 */

export type RateLimitResult = { limited: boolean; retryAfterSec: number };

export async function clientIp(): Promise<string> {
  return ipFromHeaders(await headers());
}

/**
 * Menghitung satu percobaan untuk `key`. limited=true bila percobaan ini melebihi `max` dalam `windowSec` detik.
 * Gagal-buka: bila database galat, permintaan dibolehkan (dan dicatat) agar situs tidak ikut mati.
 */
export async function rateLimit(rawKey: string, max: number, windowSec: number): Promise<RateLimitResult> {
  const key = rateLimitKey(rawKey);
  try {
    const rows = await prisma.$queryRaw<{ count: number; elapsed: number }[]>`
      INSERT INTO rate_limits ("key", "count", "window_start")
      VALUES (${key}, 1, now())
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE
          WHEN rate_limits."window_start" < now() - (${windowSec}::double precision * interval '1 second') THEN 1
          ELSE rate_limits."count" + 1
        END,
        "window_start" = CASE
          WHEN rate_limits."window_start" < now() - (${windowSec}::double precision * interval '1 second') THEN now()
          ELSE rate_limits."window_start"
        END
      RETURNING "count", EXTRACT(EPOCH FROM (now() - "window_start"))::double precision AS elapsed`;
    const { count, elapsed } = rows[0];
    // Pembersihan oportunistik supaya tabel tidak tumbuh tanpa batas.
    if (Math.random() < 0.02) {
      void prisma.$executeRaw`DELETE FROM rate_limits WHERE "window_start" < now() - interval '1 day'`.catch(() => {});
    }
    return { limited: Number(count) > max, retryAfterSec: Math.max(1, Math.ceil(windowSec - Number(elapsed))) };
  } catch (e) {
    console.error("rateLimit gagal, permintaan dibolehkan", e);
    return { limited: false, retryAfterSec: 0 };
  }
}

export const minutesText = (sec: number) => `${Math.max(1, Math.ceil(sec / 60))} menit`;
