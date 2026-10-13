export const TZ = "Asia/Jakarta"; // WIB, UTC+7 (no DST)

/** "2026-10-20T09:00" (from <input type="datetime-local">) -> Date, interpreted as WIB. */
export const parseWIB = (local: string) => new Date(`${local}:00+07:00`);

export const formatDateTime = (d: Date) =>
  new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: TZ }).format(d);

export const formatDate = (d: Date) =>
  new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: TZ }).format(d);

/** Date -> "YYYY-MM-DDTHH:mm" in WIB, for datetime-local defaultValue. */
export function toInputValue(d: Date) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(d)
    .replace(/\s/, "T");
}
