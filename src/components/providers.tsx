"use client";

import { ThemeProvider } from "next-themes";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/toast";
import { FlashToast } from "@/components/ux/flash-toast";
import { NavProgress } from "@/components/ux/nav-progress";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <Toaster limit={3}>{children}</Toaster>
      <Suspense fallback={null}>
        <NavProgress />
        <FlashToast />
      </Suspense>
    </ThemeProvider>
  );
}
