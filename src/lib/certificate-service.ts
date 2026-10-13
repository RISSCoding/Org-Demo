import { randomInt } from "node:crypto";
import { headers } from "next/headers";
import { Prisma } from "@prisma/client";
import { renderCertificatePdf } from "@/lib/certificate-pdf";
import { formatDate } from "@/lib/datetime";
import { getCertificateSigner } from "@/lib/officers";
import { prisma } from "@/lib/prisma";
import { readPrivate, writePrivate } from "@/lib/private-files";

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L
export const CERT_NUMBER_RE = /^HMN-\d{4}-[A-Z2-9]{8}$/;

export function newCertificateNumber() {
  let id = "";
  for (let i = 0; i < 8; i++) id += ALPHABET[randomInt(ALPHABET.length)];
  return `HMN-${new Date().getFullYear()}-${id}`;
}

/**
 * Base URL dari request headers (x-forwarded-proto + host), sama seperti KTA.
 * Aman di dev (port apa pun) dan di produksi (domain apa pun, termasuk di belakang proxy).
 * Kalau tidak ada request context (mis. script CLI), jatuh ke NEXT_PUBLIC_APP_URL.
 */
async function currentBaseUrl(): Promise<string> {
  try {
    const h = await headers();
    const proto = h.get("x-forwarded-proto") ?? "http";
    const host = h.get("host");
    if (host) return `${proto}://${host}`;
  } catch {
    // headers() hanya bisa di request context; abaikan dan pakai env.
  }
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

/** URL verifikasi sertifikat. `baseUrl` opsional; kalau tidak diisi, diambil dari request. */
export async function certificateVerifyUrl(number: string): Promise<string> {
  const base = await currentBaseUrl();
  return `${base}/verify-certificate/${number}`;
}

/** Creates the DB record (unique number, retried on collision). The PDF is built separately / lazily. */
export async function createCertificateRecord(eventId: string, userId: string, opts?: { roleTitle: string }) {
  const base = await currentBaseUrl();
  for (let attempt = 0; attempt < 5; attempt++) {
    const number = newCertificateNumber();
    try {
      return await prisma.certificate.create({
        data: {
          eventId,
          userId,
          certificateNumber: number,
          kind: opts ? "COMMITTEE" : "PARTICIPANT",
          roleTitle: opts?.roleTitle ?? null,
          pdfUrl: `/api/certificates/${number}/pdf`,
          qrCodeUrl: `${base}/verify-certificate/${number}`,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") continue;
      throw e;
    }
  }
  throw new Error("Could not allocate a unique certificate number");
}

export async function buildCertificatePdf(number: string): Promise<Buffer | null> {
  const cert = await prisma.certificate.findUnique({
    where: { certificateNumber: number },
    select: {
      certificateNumber: true,
      roleTitle: true,
      user: { select: { fullName: true } },
      event: { select: { title: true, startDate: true, endDate: true, location: true } },
    },
  });
  if (!cert) return null;

  const { startDate, endDate } = cert.event;
  const sameDay = formatDate(startDate) === formatDate(endDate);
  const pdf = await renderCertificatePdf({
    number: cert.certificateNumber,
    name: cert.user.fullName,
    eventTitle: cert.event.title,
    dateText: sameDay ? formatDate(startDate) : `${formatDate(startDate)} – ${formatDate(endDate)}`,
    location: cert.event.location,
    verifyUrl: await certificateVerifyUrl(cert.certificateNumber),
    roleTitle: cert.roleTitle,
    signer: await getCertificateSigner(),
  });
  await writePrivate("certificates", `${number}.pdf`, pdf);
  return pdf;
}

/**
 * Cached file if present, otherwise (re)generate.
 * Catatan: berkas lama yang dibuat sebelum perubahan ini mungkin berisi URL dengan port yang salah.
 * Hapus `certificates/*.pdf` di UPLOAD_DIR untuk memaksa render ulang.
 */
export async function getCertificatePdf(number: string): Promise<Buffer | null> {
  if (!CERT_NUMBER_RE.test(number)) return null;
  return (await readPrivate("certificates", `${number}.pdf`)) ?? (await buildCertificatePdf(number));
}
