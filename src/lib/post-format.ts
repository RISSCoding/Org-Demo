/**
 * Format tulisan ringan untuk Berita & Artikel — sebagian kecil Markdown yang aman:
 *   ## Judul bagian    ### Sub-judul    - daftar    1. daftar bernomor    > kutipan
 *   **tebal**   *miring*   [teks](https://alamat)
 * Hasilnya struktur data (bukan HTML), jadi tidak ada celah XSS; tulisan lama yang hanya
 * berisi paragraf polos tampil persis seperti sebelumnya. Tidak bergantung pada server,
 * sehingga dipakai juga oleh pratinjau di formulir admin.
 */

export type Inline =
  | { t: "text"; v: string }
  | { t: "bold"; c: Inline[] }
  | { t: "italic"; c: Inline[] }
  | { t: "link"; href: string; c: Inline[] };

export type Block =
  | { t: "h2" | "h3" | "p" | "quote"; c: Inline[] }
  | { t: "ul" | "ol"; items: Inline[][] };

/** Hanya http(s), mailto, dan alamat internal ("/..."); selain itu (mis. javascript:) ditolak. */
export function safeHref(raw: string): string | null {
  const url = raw.trim();
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  if (/^mailto:[^\s@]+@[^\s@]+$/i.test(url)) return url;
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

const INLINE = /\[([^\]\n]+)\]\(([^)\s]+)\)|\*\*([^*\n]+?)\*\*|\*([^*\s][^*\n]*?)\*/g;

export function parseInline(s: string): Inline[] {
  const out: Inline[] = [];
  let last = 0;
  for (const m of s.matchAll(INLINE)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ t: "text", v: s.slice(last, i) });
    if (m[1] !== undefined) {
      const href = safeHref(m[2]);
      out.push(href ? { t: "link", href, c: parseInline(m[1]) } : { t: "text", v: m[1] });
    } else if (m[3] !== undefined) {
      out.push({ t: "bold", c: parseInline(m[3]) });
    } else {
      out.push({ t: "italic", c: parseInline(m[4]) });
    }
    last = i + m[0].length;
  }
  if (last < s.length) out.push({ t: "text", v: s.slice(last) });
  return out;
}

export function parseBlocks(src: string): Block[] {
  const blocks: Block[] = [];
  // Objek state (bukan variabel lepas) supaya TypeScript tidak salah mempersempit tipe di dalam closure.
  const st = { para: [] as string[], quote: [] as string[], list: null as { t: "ul" | "ol"; items: string[] } | null };

  const flush = () => {
    if (st.para.length) blocks.push({ t: "p", c: parseInline(st.para.join(" ")) });
    if (st.quote.length) blocks.push({ t: "quote", c: parseInline(st.quote.join(" ")) });
    if (st.list) blocks.push({ t: st.list.t, items: st.list.items.map(parseInline) });
    st.para = [];
    st.quote = [];
    st.list = null;
  };
  const addItem = (t: "ul" | "ol", text: string) => {
    if (st.list?.t !== t) {
      flush();
      st.list = { t, items: [] };
    }
    st.list.items.push(text);
  };

  for (const raw of src.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^(#{2,3})\s+(.+)$/))) {
      flush();
      blocks.push({ t: m[1].length === 2 ? "h2" : "h3", c: parseInline(m[2]) });
    } else if ((m = line.match(/^[-•]\s+(.+)$/))) {
      addItem("ul", m[1]);
    } else if ((m = line.match(/^\d+[.)]\s+(.+)$/))) {
      addItem("ol", m[1]);
    } else if ((m = line.match(/^>\s?(.*)$/))) {
      if (!st.quote.length) flush();
      st.quote.push(m[1]);
    } else {
      if (st.list || st.quote.length) flush();
      st.para.push(line);
    }
  }
  flush();
  return blocks;
}

export function plainText(nodes: Inline[]): string {
  return nodes.map((n) => (n.t === "text" ? n.v : plainText(n.c))).join("");
}

/** Teks polos dari kalimat pembuka tulisan (melewati judul bagian), untuk ringkasan dan meta description. */
export function leadText(src: string): string {
  for (const b of parseBlocks(src)) {
    if (b.t === "p" || b.t === "quote") return plainText(b.c);
    if (b.t === "ul" || b.t === "ol") return plainText(b.items[0] ?? []);
  }
  return "";
}
