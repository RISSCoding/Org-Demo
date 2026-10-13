import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { describe, it } from "node:test";

// Butuh Postgres bernomor migrasi terbaru (CI menyediakannya). Dilewati bila DATABASE_URL tidak diset.
// Modul diimpor di dalam tes (bukan di atas) supaya berkas ini aman dimuat tanpa Prisma Client.
describe("rateLimit (database)", { skip: process.env.DATABASE_URL ? false : "DATABASE_URL tidak diset" }, () => {
  it("atomik di bawah beban paralel: tepat `max` yang lolos", async () => {
    const { rateLimit } = await import("@/lib/rate-limit");
    const key = `test:${randomUUID()}`;
    const results = await Promise.all(Array.from({ length: 25 }, () => rateLimit(key, 5, 60)));
    assert.equal(results.filter((r) => !r.limited).length, 5);
    assert.equal(results.filter((r) => r.limited).length, 20);
    assert.ok(results.every((r) => r.retryAfterSec >= 1 && r.retryAfterSec <= 60));
  });

  it("kunci berbeda tidak saling memengaruhi", async () => {
    const { rateLimit } = await import("@/lib/rate-limit");
    const a = `test:${randomUUID()}`;
    for (let i = 0; i < 3; i++) await rateLimit(a, 2, 60);
    assert.equal((await rateLimit(a, 2, 60)).limited, true);
    assert.equal((await rateLimit(`test:${randomUUID()}`, 2, 60)).limited, false);
  });

  it("jendela baru dimulai setelah kedaluwarsa", async () => {
    const { rateLimit } = await import("@/lib/rate-limit");
    const key = `test:${randomUUID()}`;
    assert.equal((await rateLimit(key, 1, 1)).limited, false);
    assert.equal((await rateLimit(key, 1, 1)).limited, true);
    await new Promise((r) => setTimeout(r, 1300));
    assert.equal((await rateLimit(key, 1, 1)).limited, false);
  });
});
