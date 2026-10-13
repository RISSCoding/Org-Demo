"use client";

import { ErrorPanel } from "@/components/error-panel";

export default function Error(props: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorPanel {...props} backHref="/admin" backLabel="Kembali ke ringkasan" />;
}
