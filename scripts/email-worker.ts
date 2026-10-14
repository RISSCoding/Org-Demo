/**
 * Worker email — dipanggil oleh systemd timer setiap 1 menit.
 *   bun run scripts/email-worker.ts
 *
 * Aman dijalankan bersamaan: systemd tidak akan start instance baru
 * kalau instance sebelumnya masih jalan (Type=oneshot).
 */
import { runEmailWorker } from "../src/lib/email-worker";
import { prisma } from "../src/lib/prisma";

async function main() {
  const started = Date.now();
  const res = await runEmailWorker();
  const ms = Date.now() - started;
  if (res.processed > 0) {
    console.log(
      `[${new Date().toISOString()}] job=${res.processed} terkirim=${res.sent} gagal=${res.failed} dilewati=${res.skipped} (${ms}ms)`
    );
  }
}

main()
  .catch((e) => {
    console.error("[email-worker] fatal:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
