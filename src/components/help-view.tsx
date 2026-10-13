import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { MarkdownView } from "@/components/markdown-view";
import { PageHeader } from "@/components/ui/page-header";
import { cardCls } from "@/lib/ui";

export type HelpTab = { key: string; label: string; file: string };

/**
 * Halaman bantuan: navigasi tab + isi markdown.
 * Dipakai oleh /help, /dashboard/help, dan /admin/help dengan daftar tab berbeda.
 * Kalau `tabs.length === 1`, navigasi tab disembunyikan.
 */
export async function HelpView({
  title,
  description,
  tabs,
  activeKey,
  basePath,
}: {
  title: string;
  description: string;
  tabs: HelpTab[];
  activeKey?: string;
  basePath: string;
}) {
  const active = tabs.find((t) => t.key === activeKey) ?? tabs[0];

  const filePath = path.join(process.cwd(), active.file);
  let content = "";
  try {
    content = await readFile(filePath, "utf8");
  } catch {
    content = `# Dokumen belum tersedia\n\nBerkas \`${active.file}\` tidak ditemukan di server.`;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />

      {tabs.length > 1 && (
        <nav
          aria-label="Kategori bantuan"
          className="scrollbar-thin flex overflow-x-auto border-b border-[var(--border-subtle)]"
        >
          {tabs.map((t) => {
            const isActive = t.key === active.key;
            return (
              <Link
                key={t.key}
                href={`${basePath}?tab=${t.key}`}
                className={`relative inline-flex shrink-0 items-center px-4 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "font-semibold text-foreground after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:rounded-full after:bg-[var(--brand-500)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      )}

      <article className={`${cardCls} p-6 md:p-8`}>
        <MarkdownView source={content} />
      </article>

      <p className="text-xs text-muted-foreground">
        Butuh versi cetak? Buka halaman ini di browser, lalu <kbd className="rounded border border-[var(--border-default)] bg-[var(--surface-2)] px-1.5 py-0.5 font-mono text-[10px]">Ctrl+P</kbd> dan pilih &ldquo;Save as PDF&rdquo;.
      </p>
    </div>
  );
}
