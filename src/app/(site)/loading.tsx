import { container } from "@/lib/site-ui";

export default function Loading() {
  return (
    <div role="status" aria-label="Memuat halaman" className={`${container} space-y-5 py-14`}>
      <span className="sr-only">Memuat halaman…</span>
      <div className="ux-skeleton h-1 w-14 bg-[#ffa500]/60" />
      <div className="ux-skeleton h-12 w-full max-w-xl rounded-sm" />
      <div className="ux-skeleton h-5 w-full max-w-md rounded-sm" />
      <div className="space-y-px pt-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="ux-skeleton h-24 rounded-sm" />
        ))}
      </div>
    </div>
  );
}
