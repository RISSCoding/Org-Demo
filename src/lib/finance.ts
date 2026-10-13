import { parseWIB, toInputValue } from "@/lib/datetime";

export const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

/** "YYYY-MM-DD" of a Date in WIB. */
export const dateKey = (d: Date) => toInputValue(d).slice(0, 10);
export const currentMonthKey = () => toInputValue(new Date()).slice(0, 7);

export function shiftMonth(key: string, delta: number) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Last n month keys ending at `from`, oldest first. */
export const lastMonths = (n: number, from = currentMonthKey()) =>
  Array.from({ length: n }, (_, i) => shiftMonth(from, i - (n - 1)));

/** Newest first: `forward` months ahead of now, `back` months behind. */
export const monthOptions = (back = 11, forward = 1) =>
  lastMonths(back + forward + 1, shiftMonth(currentMonthKey(), forward)).reverse();

export function monthRange(key: string) {
  return { start: parseWIB(`${key}-01T00:00`), end: parseWIB(`${shiftMonth(key, 1)}-01T00:00`) };
}

export function monthLabel(key: string, style: "short" | "long" = "long") {
  const [y, m] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", { month: style, year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, 1)),
  );
}

/** AD Pasal 20: iuran, anggaran universitas, sumbangan, dan usaha lain. */
export const CATEGORY_LABEL = {
  DUES: "Iuran Kas",
  UNIVERSITY_FUND: "Dana Universitas",
  DONATION: "Sumbangan",
  SPONSORSHIP: "Sponsorship",
  BUSINESS: "Usaha (Kewirausahaan)",
  EVENT: "Event",
  OPERATIONAL: "Operasional",
} as const;

export const hasFinanceWrite = (u: { role: string; permissions: string[] }) =>
  u.role === "SUPER_ADMIN" || u.permissions.includes("finance:write");

export const num = (d: { toNumber(): number } | null | undefined) => (d ? d.toNumber() : 0);

/** What a dues row looks like to people. */
export function duesState(d: { status: "PAID" | "PENDING" | "OVERDUE"; proofUrl: string | null }) {
  if (d.status === "PAID") return { label: "Lunas", tone: "ok" as const };
  if (d.proofUrl) return { label: "Menunggu verifikasi", tone: "warn" as const };
  if (d.status === "OVERDUE") return { label: "Terlambat", tone: "bad" as const };
  return { label: "Belum bayar", tone: "muted" as const };
}
