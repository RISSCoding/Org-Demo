import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { BookOpen, HelpCircle } from "lucide-react";
import { MarkdownView } from "@/components/markdown-view";
import { PageHeader } from "@/components/ui/page-header";
import { cardCls } from "@/lib/ui";

export type HelpTab = { key: string; label: string; file: string; icon?: React.ReactNode };

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
    content = `# Dokumen belum tersedia\n\nBerkas \`${active.file}\` tidak ditemukan.`;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />

      {/* Layout: Flex Col (HP) -> Flex Row (Desktop) */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
        
        {/* Navigasi Tab (Mobile: Horizontal Scroll / Desktop: Sidebar Kiri) */}
        <aside className="shrink-0 lg:sticky lg:top-24 lg:w-64">
          <div className="flex items-center gap-2 pb-2 lg:pb-4">
            <BookOpen className="size-4 text-muted-foreground" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Daftar Panduan
            </span>
          </div>
          
          <div className="scrollbar-thin flex overflow-x-auto pb-2 lg:flex-col lg:space-y-1 lg:overflow-visible lg:pb-0">
            {tabs.map((t) => {
              const isActive = t.key === active.key;
              return (
                <Link
                  key={t.key}
                  href={`${basePath}?tab=${t.key}`}
                  className={`flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-[var(--brand-500)]/10 font-semibold text-[var(--text-brand)] lg:bg-[var(--surface-2)]"
                      : "text-muted-foreground hover:bg-[var(--surface-2)] hover:text-foreground lg:hover:bg-[var(--surface-2)]"
                  }`}
                >
                  {t.icon}
                  <span className="whitespace-nowrap">{t.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Kotak Bantuan (Hanya tampil di desktop) */}
          <div className="mt-8 hidden rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] p-4 lg:block">
            <p className="flex items-center gap-2 text-sm font-medium">
              <HelpCircle className="size-4 text-[var(--gold-text)]" /> Butuh bantuan lain?
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Jika panduan ini kurang jelas, hubungi pengurus atau buat laporan di GitHub.
            </p>
          </div>
        </aside>

        {/* Konten Markdown */}
        <article className={`${cardCls} min-w-0 flex-1 p-5 sm:p-8 lg:p-10`}>
          <MarkdownView source={content} />
        </article>
        
      </div>
    </div>
  );
}
