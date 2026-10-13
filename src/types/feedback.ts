export type FeedbackState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  /** Kode pelacakan, hanya ada setelah aspirasi berhasil dikirim. */
  code?: string;
};
