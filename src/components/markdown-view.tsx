import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Render markdown sederhana untuk halaman bantuan. Mendukung:
 * - Heading (# s/d ####)
 * - List (- item, 1. item)
 * - Bold (**text**), inline code (`code`)
 * - Link ([text](url))
 * - Code block (``` ... ```)
 * - Horizontal rule (---)
 *
 * Kalau nanti butuh tabel, gambar, atau nested list kompleks, ganti ke
 * react-markdown + remark-gfm.
 */
export function MarkdownView({ source }: { source: string }) {
  const lines = source.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  const inline = (text: string): ReactNode[] => {
    const parts: ReactNode[] = [];
    const re = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      if (m.index > last) parts.push(text.slice(last, m.index));
      const tok = m[0];
      if (tok.startsWith("**")) {
        parts.push(<strong key={parts.length}>{tok.slice(2, -2)}</strong>);
      } else if (tok.startsWith("`")) {
        parts.push(
          <code
            key={parts.length}
            className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 font-mono text-[0.9em]"
          >
            {tok.slice(1, -1)}
          </code>,
        );
      } else {
        const lm = /\[([^\]]+)\]\(([^)]+)\)/.exec(tok);
        if (lm) {
          const [, label, href] = lm;
          const isExternal = /^https?:/.test(href);
          parts.push(
            isExternal ? (
              <a
                key={parts.length}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[var(--text-brand)] underline underline-offset-4 hover:no-underline"
              >
                {label}
              </a>
            ) : (
              <Link
                key={parts.length}
                href={href}
                className="font-medium text-[var(--text-brand)] underline underline-offset-4 hover:no-underline"
              >
                {label}
              </Link>
            ),
          );
        } else parts.push(tok);
      }
      last = m.index + tok.length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const buffer: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        buffer.push(lines[i]);
        i++;
      }
      i++;
      blocks.push(
        <pre
          key={key++}
          className="scrollbar-thin my-4 overflow-x-auto rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] p-4 text-sm"
        >
          <code>{buffer.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    if (/^---+\s*$/.test(line)) {
      blocks.push(<hr key={key++} className="my-6 border-[var(--border-subtle)]" />);
      i++;
      continue;
    }

    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1].length;
      const text = inline(h[2]);
      const cls = {
        1: "s-display mt-8 mb-4 text-3xl text-[var(--s-head)] first:mt-0",
        2: "s-display mt-8 mb-3 text-2xl text-[var(--s-head)] first:mt-0",
        3: "mt-6 mb-2 text-lg font-semibold text-[var(--s-head)] first:mt-0",
        4: "mt-5 mb-2 text-base font-semibold text-[var(--s-head)] first:mt-0",
      }[level];
      const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
      blocks.push(<Tag key={key++} className={cls}>{text}</Tag>);
      i++;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={key++} className="my-3 list-disc space-y-1.5 pl-6">
          {items.map((it, idx) => (
            <li key={idx} className="text-sm leading-relaxed">{inline(it)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={key++} className="my-3 list-decimal space-y-1.5 pl-6">
          {items.map((it, idx) => (
            <li key={idx} className="text-sm leading-relaxed">{inline(it)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    blocks.push(
      <p key={key++} className="my-3 text-sm leading-relaxed">{inline(line)}</p>,
    );
    i++;
  }

  return <div className="max-w-none">{blocks}</div>;
}
