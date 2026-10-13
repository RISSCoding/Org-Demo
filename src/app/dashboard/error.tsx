"use client";

import { ErrorPanel } from "@/components/error-panel";

export default function Error(props: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorPanel {...props} backHref="/dashboard" backLabel="Kembali ke ringkasan" />;
}
