import { Loader2Icon } from "lucide-react"
import { cn } from "cn"

/** Indikator memuat kecil. Dekoratif: teks status harus tetap ada di dekatnya. */
function Spinner({ className }: { className?: string }) {
  return <Loader2Icon aria-hidden="true" className={cn("ux-spin size-4 shrink-0", className)} />
}

export { Spinner }
