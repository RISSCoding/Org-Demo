import { Skeleton } from "@/components/ui/skeleton";

// Login/register memuat script auth ringan, tapi tetap beri indikator
// supaya transisi dari halaman lain terasa mulus.
export default function Loading() {
  return (
    <div role="status" aria-label="Memuat" className="space-y-5">
      <span className="sr-only">Memuat…</span>
      <Skeleton className="h-9 w-32" />
      <Skeleton className="h-4 w-64" />
      <div className="space-y-3 pt-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
