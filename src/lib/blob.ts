import { createHash, createHmac } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Penyimpanan berkas. Kunci selalu berbentuk "<folder>/<nama>", mis. "proofs/abc.png".
 *
 * - Bila S3_BUCKET diisi: pakai object storage S3-compatible (AWS S3, Cloudflare R2, Supabase,
 *   MinIO, dst.) lewat REST + AWS Signature V4. Tanpa dependensi tambahan.
 * - Bila tidak: pakai disk lokal di UPLOAD_DIR (cocok untuk dev / VPS dengan volume persisten).
 *
 * Di hosting serverless (Vercel dsb.) disk tidak persisten, jadi S3_* wajib diisi di produksi.
 */

const KEY_RE = /^[a-z]+\/[A-Za-z0-9._-]+$/;

/** Dibaca saat dipakai (bukan saat impor) supaya mudah diuji dan tidak bergantung urutan pemuatan env. */
export const uploadDir = () => path.resolve(process.env.UPLOAD_DIR ?? "./uploads");

function assertKey(key: string) {
  if (!KEY_RE.test(key) || key.includes("..")) throw new Error(`Kunci berkas tidak valid: ${key}`);
}

// ---------------------------------------------------------------- AWS Signature V4

const sha256hex = (data: string | Uint8Array) => createHash("sha256").update(data).digest("hex");
const hmac = (key: string | Buffer, data: string) => createHmac("sha256", key).update(data).digest();

export type SignInput = {
  method: string;
  /** Path sudah ter-encode, diawali "/". */
  canonicalUri: string;
  canonicalQuery?: string;
  /** Semua header yang ikut ditandatangani (nama huruf kecil). Wajib memuat host dan x-amz-date. */
  headers: Record<string, string>;
  payloadHash: string;
  amzDate: string; // 20130524T000000Z
  region: string;
  service: string;
  accessKeyId: string;
  secretAccessKey: string;
};

/** Mengembalikan nilai header Authorization. Diekspor agar bisa diuji dengan vektor resmi AWS. */
export function signV4(i: SignInput): string {
  const names = Object.keys(i.headers).sort();
  const canonicalHeaders = names.map((n) => `${n}:${i.headers[n].trim()}\n`).join("");
  const signedHeaders = names.join(";");
  const canonicalRequest = [
    i.method,
    i.canonicalUri,
    i.canonicalQuery ?? "",
    canonicalHeaders,
    signedHeaders,
    i.payloadHash,
  ].join("\n");

  const dateStamp = i.amzDate.slice(0, 8);
  const scope = `${dateStamp}/${i.region}/${i.service}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", i.amzDate, scope, sha256hex(canonicalRequest)].join("\n");

  const kDate = hmac(`AWS4${i.secretAccessKey}`, dateStamp);
  const kRegion = hmac(kDate, i.region);
  const kService = hmac(kRegion, i.service);
  const kSigning = hmac(kService, "aws4_request");
  const signature = createHmac("sha256", kSigning).update(stringToSign).digest("hex");

  return `AWS4-HMAC-SHA256 Credential=${i.accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}

function s3Config() {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) return null;
  const endpoint = process.env.S3_ENDPOINT;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("S3_BUCKET diisi, tetapi S3_ENDPOINT / S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY belum lengkap.");
  }
  return { bucket, endpoint: new URL(endpoint), region: process.env.S3_REGION ?? "auto", accessKeyId, secretAccessKey };
}

async function s3(method: "PUT" | "GET" | "DELETE", key: string, body?: Buffer, contentType?: string) {
  const c = s3Config()!;
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const payloadHash = sha256hex(body ?? "");
  // Path-style (https://endpoint/bucket/key): paling kompatibel antar penyedia.
  const canonicalUri = `/${[c.bucket, ...key.split("/")].map(encodeURIComponent).join("/")}`;

  const headers: Record<string, string> = {
    host: c.endpoint.host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };
  const authorization = signV4({
    method,
    canonicalUri,
    headers,
    payloadHash,
    amzDate,
    region: c.region,
    service: "s3",
    accessKeyId: c.accessKeyId,
    secretAccessKey: c.secretAccessKey,
  });

  return fetch(`${c.endpoint.origin}${canonicalUri}`, {
    method,
    headers: {
      ...headers,
      Authorization: authorization,
      ...(contentType ? { "Content-Type": contentType } : {}),
    },
    body: body ? new Uint8Array(body) : undefined,
  });
}

// ---------------------------------------------------------------- API publik

export async function putBlob(key: string, data: Buffer, contentType = "application/octet-stream") {
  assertKey(key);
  if (s3Config()) {
    const res = await s3("PUT", key, data, contentType);
    if (!res.ok) throw new Error(`Gagal menyimpan berkas ke storage (${res.status}).`);
    return;
  }
  const file = path.join(uploadDir(), key);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, data);
}

/** null bila berkas tidak ada. Galat lain (jaringan, kredensial) dilempar supaya tidak tersamar jadi "tidak ada". */
export async function getBlob(key: string): Promise<Buffer | null> {
  assertKey(key);
  if (s3Config()) {
    const res = await s3("GET", key);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Gagal membaca berkas dari storage (${res.status}).`);
    return Buffer.from(await res.arrayBuffer());
  }
  try {
    return await readFile(path.join(uploadDir(), key));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw e;
  }
}

/** Idempoten: berkas yang sudah tidak ada tidak dianggap galat. */
export async function deleteBlob(key: string): Promise<void> {
  assertKey(key);
  if (s3Config()) {
    const res = await s3("DELETE", key);
    if (!res.ok && res.status !== 404) console.error(`Gagal menghapus ${key} dari storage (${res.status}).`);
    return;
  }
  try {
    await unlink(path.join(uploadDir(), key));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  }
}
