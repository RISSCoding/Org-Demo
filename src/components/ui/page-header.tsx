import { cn } from "cn";

export function PageHeader({
  before,
  title,
  description,
  action,
  className,
}: {
  /** Ditampilkan di atas judul: badge status, back link, atau apa pun. */
  before?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="min-w-0 space-y-2">
        {before}
        <div className="space-y-1">
          <h1 className="s-display s-title text-3xl text-[var(--s-head)]">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>
      )}
    </header>
  );
}
