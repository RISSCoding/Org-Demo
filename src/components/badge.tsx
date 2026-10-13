const tones = {
  ok: "bg-[var(--emerald)]/15 text-[var(--emerald)]",
  warn: "bg-[#ffa500]/20 text-[var(--gold-text)]",
  bad: "bg-red-500/10 text-red-600 dark:text-red-400",
  muted: "bg-muted text-muted-foreground",
} as const;

export function Badge({ tone = "muted", children }: { tone?: keyof typeof tones; children: React.ReactNode }) {
  return <span className={`inline-block rounded-sm px-2 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}
