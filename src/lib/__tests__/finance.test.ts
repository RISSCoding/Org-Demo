import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { duesState, lastMonths, MONTH_RE, monthRange, shiftMonth } from "@/lib/finance";

describe("bulan", () => {
  it("shiftMonth melewati batas tahun ke dua arah", () => {
    assert.equal(shiftMonth("2026-12", 1), "2027-01");
    assert.equal(shiftMonth("2026-01", -1), "2025-12");
    assert.equal(shiftMonth("2026-03", -15), "2024-12");
  });
  it("lastMonths: n bulan berakhir di `from`, terlama dulu", () => {
    assert.deepEqual(lastMonths(3, "2026-01"), ["2025-11", "2025-12", "2026-01"]);
  });
  it("MONTH_RE hanya menerima YYYY-MM yang valid", () => {
    for (const ok of ["2026-01", "2026-12"]) assert.ok(MONTH_RE.test(ok), ok);
    for (const bad of ["2026-13", "2026-00", "2026-1", "26-01", "2026-01-01"]) assert.ok(!MONTH_RE.test(bad), bad);
  });
  it("monthRange: batas bulan mengikuti WIB (UTC+7), bukan UTC", () => {
    const { start, end } = monthRange("2026-10");
    assert.equal(start.toISOString(), "2026-09-30T17:00:00.000Z");
    assert.equal(end.toISOString(), "2026-10-31T17:00:00.000Z");
  });
});

describe("duesState", () => {
  it("urutan prioritas label", () => {
    assert.equal(duesState({ status: "PAID", proofUrl: "/x" }).label, "Lunas");
    assert.equal(duesState({ status: "PENDING", proofUrl: "/x" }).label, "Menunggu verifikasi");
    assert.equal(duesState({ status: "OVERDUE", proofUrl: null }).label, "Terlambat");
    assert.equal(duesState({ status: "PENDING", proofUrl: null }).label, "Belum bayar");
  });
  it("bukti yang sudah diunggah mengalahkan status terlambat", () => {
    assert.equal(duesState({ status: "OVERDUE", proofUrl: "/x" }).label, "Menunggu verifikasi");
  });
});
