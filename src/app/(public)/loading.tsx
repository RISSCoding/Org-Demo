import { Skeleton } from "@/components/ui/skeleton";
import { container } from "@/lib/site-ui";

export default function Loading() {
  return (
    <div role="status" aria-label="Memuat" className={`${container} max-w-3xl space-y-6 py-14`}>
      <span className="sr-only">Memuat…</span>
      <Skeleton className="h-1 w-14" />
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-4 w-full max-w-xl" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
