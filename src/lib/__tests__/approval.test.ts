import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { APPROVAL_LABEL, approvalKeysFor, approvalSignerText, inRows, isApprovalDoc, listIndonesian } from "@/lib/approval-meta";
import { signersFor } from "@/lib/letters";
import { signatureFileName } from "@/lib/private-files";

const UUID = "123e4567-e89b-12d3-a456-426614174000";

describe("penandatangan lembar pengesahan (PO)", () => {
  it("dana kampus: keenam pihak, berurutan seperti di PO", () => {
    assert.deepEqual(
      [...approvalKeysFor("PROPOSAL", true)],
      ["EVENT_CHAIR", "EVENT_SECRETARY", "CHAIR", "PRODI_HEAD", "DEAN", "VICE_RECTOR_3"],
    );
    assert.deepEqual([...approvalKeysFor("LPJ", true)], [...approvalKeysFor("PROPOSAL", true)]);
  });

  it("tanpa dana kampus: tiga pihak kepanitiaan dan himpunan", () => {
    assert.deepEqual([...approvalKeysFor("PROPOSAL", false)], ["EVENT_CHAIR", "EVENT_SECRETARY", "CHAIR"]);
  });

  it("selain proposal/LPJ tidak punya lembar pengesahan", () => {
    for (const t of ["SURAT_MASUK", "SURAT_KELUAR"] as const) {
      assert.deepEqual([...approvalKeysFor(t, true)], []);
      assert.equal(isApprovalDoc(t), false);
    }
    assert.equal(isApprovalDoc("PROPOSAL"), true);
    assert.equal(isApprovalDoc("LPJ"), true);
  });

  it("setiap penandatangan punya label", () => {
    for (const k of approvalKeysFor("PROPOSAL", true)) assert.ok(APPROVAL_LABEL[k].length > 0);
  });

  it("teks penandatangan di formulir mengikuti pilihan dana kampus", () => {
    assert.equal(signersFor("PROPOSAL", null, false), "Ketua Pelaksana, Sekretaris Kegiatan, dan Ketua Himpunan");
    assert.equal(
      signersFor("LPJ", null, true),
      "Ketua Pelaksana, Sekretaris Kegiatan, Ketua Himpunan, Ketua Program Studi, Dekan Fakultas, dan Wakil Rektor III Bidang Kemahasiswaan dan Alumni",
    );
    assert.equal(approvalSignerText("SURAT_MASUK", true), "");
  });

  it("listIndonesian dan inRows", () => {
    assert.equal(listIndonesian([]), "");
    assert.equal(listIndonesian(["A"]), "A");
    assert.equal(listIndonesian(["A", "B"]), "A, dan B");
    assert.equal(listIndonesian(["A", "B", "C"]), "A, B, dan C");
    assert.deepEqual(inRows([1, 2, 3, 4, 5, 6]), [[1, 2], [3, 4], [5, 6]]);
    assert.deepEqual(inRows([1, 2, 3]), [[1, 2], [3]]);
    assert.deepEqual(inRows([]), []);
  });
});

describe("berkas tanda tangan", () => {
  it("signatureFileName hanya menerima URL milik kita dan hanya PNG/JPG", () => {
    assert.equal(signatureFileName(`/api/signatures/${UUID}.png`), `${UUID}.png`);
    assert.equal(signatureFileName(`/api/signatures/${UUID}.jpg`), `${UUID}.jpg`);
    assert.equal(signatureFileName(`/api/signatures/${UUID}.webp`), null);
    assert.equal(signatureFileName(`/api/signatures/${UUID}.pdf`), null);
    assert.equal(signatureFileName(`/api/proofs/${UUID}.png`), null);
    assert.equal(signatureFileName(`/api/signatures/../../etc/passwd`), null);
    assert.equal(signatureFileName(`https://evil.example/api/signatures/${UUID}.png`), null);
    assert.equal(signatureFileName(null), null);
  });
});
