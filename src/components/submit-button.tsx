"use client";

import { useFormStatus } from "react-dom";
import { Spinner } from "@/components/ui/spinner";
import { btnPrimary } from "@/lib/ui";

type Props = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  /** Teks saat proses berjalan, mis. "Menyimpan…". Tulis kata kerja yang sama dengan label tombol. */
  pendingLabel?: string;
};

/**
 * Tombol kirim yang tahu sendiri kapan formulirnya sedang diproses (useFormStatus),
 * jadi tidak perlu meneruskan `pending`. Menampilkan spinner, mengunci klik ganda,
 * dan memberi tahu pembaca layar lewat aria-busy.
 * Bila tombol punya name/value (mis. Setujui/Tolak), hanya tombol yang ditekan yang berputar.
 */
export function SubmitButton({ children, pendingLabel, className = btnPrimary, disabled, name, value, ...rest }: Props) {
  const { pending, data } = useFormStatus();
  const pressed = !name || data?.get(name) === value;
  const busy = pending && pressed;
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={disabled || pending}
      aria-busy={busy || undefined}
      className={className}
      {...rest}
    >
      {busy && <Spinner />}
      <span>{busy && pendingLabel ? pendingLabel : children}</span>
    </button>
  );
}
