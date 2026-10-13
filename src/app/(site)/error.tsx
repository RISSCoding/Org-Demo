"use client";

import { ErrorPanel } from "@/components/error-panel";

export default function Error(props: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-6">
      <ErrorPanel {...props} backHref="/" backLabel="Ke beranda" />
    </div>
  );
}
