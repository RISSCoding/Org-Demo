"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { inputCls } from "@/lib/ui";

export type SearchOption = { value: string; label: string; hint?: string };

const MAX_SHOWN = 50;

/**
 * Pilihan tunggal yang bisa dicari (combobox). Ketik sebagian nama atau NPM untuk menyaring,
 * panah atas/bawah untuk berpindah, Enter untuk memilih, Esc untuk menutup.
 * Nilai terpilih ikut terkirim lewat <input type="hidden" name={name}>, jadi cocok dipakai di <form action>.
 */
export function SearchSelect({
  name,
  options,
  defaultValue = "",
  emptyLabel = "— belum ditentukan —",
  searchPlaceholder = "Ketik nama atau NPM…",
  id,
  onChange,
}: {
  name: string;
  options: SearchOption[];
  defaultValue?: string;
  emptyLabel?: string;
  searchPlaceholder?: string;
  id?: string;
  /** Dipanggil saat pilihan berubah; "" berarti dikosongkan. */
  onChange?: (value: string) => void;
}) {
  const uid = useId();
  const inputId = id ?? `${uid}-input`;
  const listId = `${uid}-list`;
  const optId = (i: number) => `${uid}-opt-${i}`;

  const [value, setValue] = useState(defaultValue);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);
  const q = query.trim().toLowerCase();

  const matches = useMemo(
    () => (q ? options.filter((o) => o.label.toLowerCase().includes(q) || (o.hint ?? "").toLowerCase().includes(q)) : options),
    [options, q],
  );
  const shown = matches.slice(0, MAX_SHOWN);
  // Tanpa kata kunci, baris pertama adalah "kosongkan pilihan".
  const items: SearchOption[] = q ? shown : [{ value: "", label: emptyLabel }, ...shown];

  useEffect(() => {
    if (open) document.getElementById(optId(active))?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, open]);

  function openList() {
    if (open) return;
    setQuery("");
    const idx = items.findIndex((o) => o.value === value);
    setActive(Math.max(idx, 0));
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setQuery("");
  }

  function choose(o: SearchOption | undefined) {
    if (!o) return;
    setValue(o.value);
    onChange?.(o.value);
    close();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) openList();
      else setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) openList();
      else setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && open) {
      e.preventDefault(); // jangan mengirim formulir saat memilih
      choose(items[active]);
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      close();
    }
  }

  return (
    <div
      ref={wrap}
      className="relative"
      onBlur={(e) => {
        if (!wrap.current?.contains(e.relatedTarget as Node | null)) close();
      }}
    >
      <input type="hidden" name={name} value={value} />
      <input
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && items.length ? optId(active) : undefined}
        autoComplete="off"
        spellCheck={false}
        className={`${inputCls} pr-9`}
        placeholder={open ? searchPlaceholder : emptyLabel}
        value={open ? query : (selected?.label ?? "")}
        onFocus={openList}
        onClick={openList}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />
      <ChevronsUpDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-sm border border-border bg-card py-1 text-sm shadow-md"
        >
          {items.length === 0 && <li className="px-3 py-2 text-muted-foreground">Tidak ada yang cocok dengan “{query.trim()}”.</li>}
          {items.map((o, i) => (
            <li
              key={o.value || "__empty"}
              id={optId(i)}
              role="option"
              aria-selected={o.value === value}
              onMouseDown={(e) => e.preventDefault()}
              onMouseMove={() => setActive(i)}
              onClick={() => choose(o)}
              className={`flex cursor-pointer items-center gap-2 px-3 py-2 ${i === active ? "bg-muted" : ""} ${o.value === "" ? "text-muted-foreground" : ""}`}
            >
              <Check className={`size-4 shrink-0 ${o.value === value ? "opacity-100" : "opacity-0"}`} aria-hidden />
              <span className="min-w-0 flex-1 truncate">{o.label}</span>
              {o.hint && <span className="tabular shrink-0 text-xs text-muted-foreground">{o.hint}</span>}
            </li>
          ))}
          {matches.length > MAX_SHOWN && (
            <li className="px-3 py-2 text-xs text-muted-foreground" aria-hidden>
              Menampilkan {MAX_SHOWN} dari {matches.length}. Ketik lebih spesifik untuk mempersempit.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
