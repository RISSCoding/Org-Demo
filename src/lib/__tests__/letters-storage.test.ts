import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatLetterNumber, normalizeActivity, numberCode, wibYearMonth } from "@/lib/letters";
import { letterFileName, proofFileName } from "@/lib/private-files";
import { publicImageKey, sniffImage } from "@/lib/storage";

const UUID = "123e4567-e89b-12d3-a456-426614174000";

describe("penomoran surat (PO Pasal 3)", () => {
  it("format lengkap dengan nama kegiatan", () => {
    assert.equal(formatLetterNumber("SU", 4, "MONDAY", 2026, 10), "004/SU/MONDAY/HIMMAN/X/2026");
  });
  it("nama kegiatan dilewati bila kosong", () => {
    assert.equal(formatLetterNumber("PROP", 12, undefined, 2026, 1), "012/PROP/HIMMAN/I/2026");
  });
  it("kode jenis: proposal/LPJ tetap, surat masuk tanpa nomor otomatis", () => {
    assert.equal(numberCode("PROPOSAL", null), "PROP");
    assert.equal(numberCode("LPJ", null), "LPJ");
    assert.equal(numberCode("SURAT_MASUK", null), null);
  });
  it("normalizeActivity membuang '/' dan simbol (pemisah nomor tidak boleh bocor)", () => {
    assert.equal(normalizeActivity("Monday / Maba 2026!"), "MONDAY-MABA-2026");
    assert.equal(normalizeActivity("///"), undefined);
    assert.equal(normalizeActivity(undefined), undefined);
  });
  it("wibYearMonth: 20.00 UTC tanggal 30 September sudah Oktober di WIB", () => {
    assert.deepEqual(wibYearMonth(new Date("2026-09-30T20:00:00Z")), { year: 2026, month: 10 });
    assert.deepEqual(wibYearMonth(new Date("2026-09-30T16:59:00Z")), { year: 2026, month: 9 });
  });
});

describe("pengenal berkas", () => {
  it("sniffImage membaca tipe dari magic bytes, bukan dari nama", () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, ...new Array(12).fill(0)]);
    const jpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0]);
    const webp = Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WEBP"), Buffer.alloc(4)]);
    assert.equal(sniffImage(png), "png");
    assert.equal(sniffImage(jpg), "jpg");
    assert.equal(sniffImage(webp), "webp");
    assert.equal(sniffImage(Buffer.from("<script>alert(1)</script>")), null);
  });
  it("proofFileName / letterFileName / publicImageKey hanya menerima URL milik kita", () => {
    assert.equal(proofFileName(`/api/proofs/${UUID}.png`), `${UUID}.png`);
    assert.equal(proofFileName(`/api/proofs/../../etc/passwd`), null);
    assert.equal(proofFileName(`https://evil.example/api/proofs/${UUID}.png`), null);
    assert.equal(proofFileName(null), null);
    assert.equal(letterFileName(`/api/letters/${UUID}.pdf`), `${UUID}.pdf`);
    assert.equal(letterFileName(`/api/letters/${UUID}.png`), null);
    assert.equal(publicImageKey(`/api/uploads/avatars/${UUID}.webp`), `avatars/${UUID}.webp`);
    assert.equal(publicImageKey(`/api/uploads/proofs/${UUID}.png`), null); // folder privat tidak boleh dihapus lewat jalur publik
    assert.equal(publicImageKey("https://cdn.example/x.png"), null);
  });
});
