import { SiteShell } from "@/components/site/site-shell";

// Halaman formulir pendek (verifikasi sertifikat) memakai navbar dan footer yang sama dengan situs publik.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell narrow>{children}</SiteShell>;
}
