import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, describe, it } from "node:test";
import { deleteBlob, getBlob, putBlob, signV4 } from "@/lib/blob";

const dir = mkdtempSync(path.join(tmpdir(), "portal-blob-"));
process.env.UPLOAD_DIR = dir;
delete process.env.S3_BUCKET;
after(() => rmSync(dir, { recursive: true, force: true }));


describe("signV4", () => {
  // Vektor uji resmi AWS ("Example: GET Object"):
  // https://docs.aws.amazon.com/AmazonS3/latest/API/sig-v4-header-based-auth.html
  it("menghasilkan tanda tangan yang sama dengan contoh resmi AWS", () => {
    const auth = signV4({
      method: "GET",
      canonicalUri: "/test.txt",
      headers: {
        host: "examplebucket.s3.amazonaws.com",
        range: "bytes=0-9",
        "x-amz-content-sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "x-amz-date": "20130524T000000Z",
      },
      payloadHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      amzDate: "20130524T000000Z",
      region: "us-east-1",
      service: "s3",
      accessKeyId: "AKIAIOSFODNN7EXAMPLE",
      secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
    });
    assert.equal(
      auth,
      "AWS4-HMAC-SHA256 Credential=AKIAIOSFODNN7EXAMPLE/20130524/us-east-1/s3/aws4_request, " +
        "SignedHeaders=host;range;x-amz-content-sha256;x-amz-date, " +
        "Signature=f0e8bdb87c964420e857bd35b5d6ed310bd44f0170aba48dd91039c6036bdb41",
    );
  });
});

describe("blob (driver disk lokal)", () => {
  it("menyimpan, membaca, lalu menghapus", async () => {
    await putBlob("proofs/a-b.png", Buffer.from("halo"));
    assert.equal((await getBlob("proofs/a-b.png"))?.toString(), "halo");
    await deleteBlob("proofs/a-b.png");
    assert.equal(await getBlob("proofs/a-b.png"), null);
  });

  it("berkas yang tidak ada -> null, dan menghapusnya tidak galat (idempoten)", async () => {
    assert.equal(await getBlob("letters/tidak-ada.pdf"), null);
    await deleteBlob("letters/tidak-ada.pdf");
  });

  it("menolak kunci berbahaya (path traversal, folder bersarang, karakter aneh)", async () => {
    for (const k of ["../etc/passwd", "proofs/../../x", "proofs/a/b.png", "/abs/x.png", "proofs/a b.png", "x.png", "Proofs/a.png"]) {
      await assert.rejects(() => putBlob(k, Buffer.from("x")), /tidak valid/, k);
      await assert.rejects(() => getBlob(k), /tidak valid/, k);
    }
  });
});
