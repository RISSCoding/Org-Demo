import type { FeedbackStatus } from "@prisma/client";

export const FEEDBACK_STATUSES = ["OPEN", "REVIEWED", "RESOLVED"] as const satisfies readonly FeedbackStatus[];
export const FEEDBACK_CATEGORIES = ["Aspirasi", "Keluhan", "Laporan", "Bug"] as const;

export const isFeedbackStatus = (v: unknown): v is FeedbackStatus =>
  typeof v === "string" && (FEEDBACK_STATUSES as readonly string[]).includes(v);
export const isFeedbackCategory = (v: unknown): v is (typeof FEEDBACK_CATEGORIES)[number] =>
  typeof v === "string" && (FEEDBACK_CATEGORIES as readonly string[]).includes(v);

/** Sebutan untuk pengurus (kotak masuk admin). */
export const STATUS_LABEL: Record<FeedbackStatus, string> = {
  OPEN: "Baru",
  REVIEWED: "Ditinjau",
  RESOLVED: "Selesai",
};
export const STATUS_TONE: Record<FeedbackStatus, "warn" | "muted" | "ok"> = {
  OPEN: "warn",
  REVIEWED: "muted",
  RESOLVED: "ok",
};

/** Sebutan untuk pengirim (halaman lacak dan "Pesan saya"): judul status dan penjelasannya. */
export const SENDER_STATUS: Record<FeedbackStatus, readonly [string, string]> = {
  OPEN: ["Diterima", "Pesanmu sudah masuk dan menunggu ditinjau."],
  REVIEWED: ["Sedang ditinjau", "Komisi III sedang menelaah pesanmu."],
  RESOLVED: ["Selesai ditangani", "Pesanmu sudah ditangani."],
};
