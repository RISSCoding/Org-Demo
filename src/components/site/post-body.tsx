import { Fragment } from "react";
import { parseBlocks, type Inline } from "@/lib/post-format";
import { linkText } from "@/lib/site-ui";

function Inl({ nodes }: { nodes: Inline[] }) {
  return (
    <>
      {nodes.map((n, i) => {
        if (n.t === "text") return <Fragment key={i}>{n.v}</Fragment>;
        if (n.t === "bold") return <strong key={i} className="font-semibold text-[var(--s-head)]"><Inl nodes={n.c} /></strong>;
        if (n.t === "italic") return <em key={i}><Inl nodes={n.c} /></em>;
        const external = /^https?:/i.test(n.href);
        return (
          <a key={i} href={n.href} className={linkText} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
            <Inl nodes={n.c} />
          </a>
        );
      })}
    </>
  );
}

/** Isi tulisan: dipakai halaman berita dan pratinjau di formulir admin. */
export function PostBody({ text }: { text: string }) {
  return (
    <div className="s-serif max-w-prose space-y-5 text-lg">
      {parseBlocks(text).map((b, i) => {
        switch (b.t) {
          case "h2":
            return <h2 key={i} className="s-display pt-4 text-2xl text-[var(--s-head)]"><Inl nodes={b.c} /></h2>;
          case "h3":
            return <h3 key={i} className="pt-2 text-xl font-semibold text-[var(--s-head)]"><Inl nodes={b.c} /></h3>;
          case "quote":
            return <blockquote key={i} className="border-l-4 border-[#ffa500] pl-4 italic text-[var(--s-muted)]"><Inl nodes={b.c} /></blockquote>;
          case "ul":
          case "ol": {
            const List = b.t;
            return (
              <List key={i} className={`${b.t === "ul" ? "list-disc" : "list-decimal"} space-y-1.5 pl-6`}>
                {b.items.map((it, j) => <li key={j}><Inl nodes={it} /></li>)}
              </List>
            );
          }
          default:
            return <p key={i}><Inl nodes={b.c} /></p>;
        }
      })}
    </div>
  );
}
