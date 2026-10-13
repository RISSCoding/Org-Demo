import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/styles/site.css";
import { archivo, sourceSerif } from "@/lib/site-fonts";
import { Providers } from "@/components/providers";


const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HIMMAN UKRI",
  description:
    "Himpunan Mahasiswa Manajemen Universitas Kebangsaan Republik Indonesia: kegiatan, struktur organisasi, dokumen, dan kotak aspirasi.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${archivo.variable} ${sourceSerif.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        <Providers>{children}</Providers>
        <noscript>
          <style>{`.ux-reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </body>
    </html>
  );
}
