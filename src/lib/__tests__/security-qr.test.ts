import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseScan, ticketPayload } from "@/lib/qr";
import { ktaPayload, sign, ticketHash, verifySig } from "@/lib/security";

process.env.QR_HMAC_SECRET = "test-secret"; // dibaca saat dipakai, jadi aman diset setelah impor

describe("parseScan", () => {
  it("KTA dengan tanda tangan sah dikenali", () => {
    assert.deepEqual(parseScan(ktaPayload("2023110001")), { kind: "kta", nim: "2023110001" });
  });
  it("KTA dipalsukan (NPM diganti, tanda tangan lama) ditolak", () => {
    const forged = ktaPayload("2023110001").replace("2023110001", "2023110002");
    assert.equal(parseScan(forged), null);
  });
  it("KTA tanpa tanda tangan ditolak", () => {
    assert.equal(parseScan("HIMMAN|KTA|2023110001"), null);
  });
  it("tiket: hash 32 heksadesimal diterima, selain itu ditolak", () => {
    const hash = ticketHash("evt1", "usr1");
    assert.match(hash, /^[a-f0-9]{32}$/);
    assert.deepEqual(parseScan(ticketPayload(hash)), { kind: "ticket", hash });
    assert.equal(parseScan(ticketPayload("xyz")), null);
  });
  it("NPM polos (diketik petugas) diterima; teks lain ditolak", () => {
    assert.deepEqual(parseScan(" 2023110001 "), { kind: "nim", nim: "2023110001" });
    assert.equal(parseScan("halo"), null);
    assert.equal(parseScan("123"), null); // terlalu pendek
  });
});

describe("tanda tangan HMAC", () => {
  it("tiket berbeda untuk pasangan event/user berbeda, stabil untuk yang sama", () => {
    assert.equal(ticketHash("e", "u"), ticketHash("e", "u"));
    assert.notEqual(ticketHash("e", "u"), ticketHash("e", "v"));
    assert.notEqual(ticketHash("e", "u"), ticketHash("f", "u"));
  });
  it("verifySig menolak tanda tangan salah panjang tanpa melempar galat", () => {
    assert.equal(verifySig("x", sign("x")), true);
    assert.equal(verifySig("x", "pendek"), false);
  });
});
