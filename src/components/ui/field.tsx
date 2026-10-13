import { cn } from "cn";
import { AlertCircle } from "lucide-react";

export function Field({
  label,
  htmlFor,
  hint,
  errors,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: React.ReactNode;
  errors?: string[];
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const errId = `${htmlFor}-error`;
  const hintId = `${htmlFor}-hint`;
  const hasError = errors && errors.length > 0;

  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground">
        {label}
        {required && (
          <span className="ml-0.5 text-[var(--state-danger-fg)]" aria-hidden>
            *
          </span>
        )}
      </label>
      {children}
      {hint && !hasError && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {hasError && (
        <ul id={errId} className="space-y-0.5" role="alert">
          {errors.map((e, i) => (
            <li key={i} className="ux-slide-in flex items-start gap-1.5 text-xs text-[var(--state-danger-fg)]">
              <AlertCircle className="mt-0.5 size-3 shrink-0" aria-hidden />
              <span>{e}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
