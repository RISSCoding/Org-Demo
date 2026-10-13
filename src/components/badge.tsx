const tones = {
  ok:    "bg-[var(--state-success-bg)] text-[var(--state-success-fg)]",
  warn:  "bg-[var(--state-warning-bg)] text-[var(--state-warning-fg)]",
  bad:   "bg-[var(--state-danger-bg)]  text-[var(--state-danger-fg)]",
  info:  "bg-[var(--state-info-bg)]    text-[var(--state-info-fg)]",
  muted: "bg-muted text-muted-foreground",
} as const;

export function Badge({ tone = "muted", children }: { tone?: keyof typeof tones; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
