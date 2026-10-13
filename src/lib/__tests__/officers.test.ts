import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { signerOfficersFor } from "@/lib/letters";
import { EXTERNAL_SLOTS, INTERNAL_SLOTS, OFFICER_LABEL, OFFICER_SLOTS, holderSignatureUrl, isExternalSlot, isOfficerSlot } from "@/lib/officer-meta";

describe("jabatan pengurus", () => {
  it("empat jabatan inti dan tiga penandatangan eksternal; Dewan Pembina bukan slot", () => {
    assert.deepEqual([...INTERNAL_SLOTS], ["CHAIR", "VICE_CHAIR", "SECRETARY", "TREASURER"]);
    assert.deepEqual([...EXTERNAL_SLOTS], ["PRODI_HEAD", "DEAN", "VICE_RECTOR_3"]);
    assert.deepEqual([...OFFICER_SLOTS], [...INTERNAL_SLOTS, ...EXTERNAL_SLOTS]);
    assert.equal(isOfficerSlot("DEAN"), true);
    assert.equal(isExternalSlot("DEAN"), true);
    assert.equal(isExternalSlot("CHAIR"), false);
    assert.equal(isOfficerSlot("CHAIR"), true);
    assert.equal(isOfficerSlot("ADVISOR"), false);
    assert.equal(isOfficerSlot("ketua"), false);
  });

  it("setiap jabatan punya label", () => {
    for (const p of [...OFFICER_SLOTS, "ADVISOR"] as const) assert.ok(OFFICER_LABEL[p].length > 0);
  });
});

describe("holderSignatureUrl", () => {
  const url = "/api/signatures/123e4567-e89b-12d3-a456-426614174000.png";
  it("pemegang berakun memakai tanda tangan akunnya, bukan yang tersimpan di barisnya", () => {
    assert.equal(holderSignatureUrl({ userId: "u1", user: { signatureUrl: url }, signatureUrl: "/api/signatures/lama.png" }), url);
    assert.equal(holderSignatureUrl({ userId: "u1", user: { signatureUrl: null }, signatureUrl: "/api/signatures/lama.png" }), null);
  });
  it("pemegang tanpa akun memakai tanda tangan yang diunggah pengurus", () => {
    assert.equal(holderSignatureUrl({ userId: null, user: null, signatureUrl: url }), url);
    assert.equal(holderSignatureUrl({ userId: null, user: null, signatureUrl: null }), null);
  });
});

describe("signerOfficersFor", () => {
  it("surat keluar mengikuti sifat surat (PO Pasal 3)", () => {
    assert.deepEqual(signerOfficersFor("SURAT_KELUAR", "KEBIJAKAN"), ["CHAIR", "SECRETARY"]);
    assert.deepEqual(signerOfficersFor("SURAT_KELUAR", "TEKNIS_KEGIATAN"), ["CHAIR"]);
    assert.deepEqual(signerOfficersFor("SURAT_KELUAR", "RUTIN"), ["CHAIR", "SECRETARY"]);
  });

  it("proposal dan LPJ ditandatangani Ketua Himpunan di antara penandatangan lain", () => {
    assert.deepEqual(signerOfficersFor("PROPOSAL", null), ["CHAIR"]);
    assert.deepEqual(signerOfficersFor("LPJ", null), ["CHAIR"]);
  });

  it("proposal/LPJ dengan dana kampus menambah Ketua Prodi, Dekan, dan WR III", () => {
    assert.deepEqual(signerOfficersFor("PROPOSAL", null, true), ["CHAIR", "PRODI_HEAD", "DEAN", "VICE_RECTOR_3"]);
    assert.deepEqual(signerOfficersFor("LPJ", null, true), ["CHAIR", "PRODI_HEAD", "DEAN", "VICE_RECTOR_3"]);
    assert.deepEqual(signerOfficersFor("SURAT_KELUAR", "RUTIN", true), ["CHAIR", "SECRETARY"]); // surat biasa tidak terpengaruh
  });

  it("surat masuk atau surat keluar tanpa sifat tidak punya penandatangan", () => {
    assert.deepEqual(signerOfficersFor("SURAT_MASUK", null), []);
    assert.deepEqual(signerOfficersFor("SURAT_KELUAR", null), []);
  });
});
