import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * Mendapatkan subdomain dari request header.
 * Contoh:
 * - "demo.domain.com" -> "demo"
 * - "localhost:3002" -> "demo" (Fallback untuk development)
 */
export async function getTenantSubdomain(): Promise<string> {
  const h = await headers();
  const host = h.get("host") || "";

  // Fallback untuk local development
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    return "demo";
  }

  const parts = host.split(".");
  // Jika domainnya seperti "demo.domain.com", ambil "demo"
  if (parts.length >= 3) {
    return parts[0];
  }

  // Fallback jika tidak ada subdomain (misal: domain.com)
  return "demo";
}

/**
 * Mengambil data Organisasi yang sedang aktif berdasarkan subdomain.
 */
export async function getCurrentOrganization() {
  const subdomain = await getTenantSubdomain();
  const org = await prisma.organization.findUnique({
    where: { subdomain },
  });
  return org;
}
