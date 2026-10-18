"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Download, Loader2, RefreshCw, Search } from "lucide-react";
import { issueForUsersAction } from "@/actions/certificates";
import { Badge } from "@/components/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/datetime";
import { alertErr, alertOk, btnLine, btnPrimary, cardCls } from "@/lib/ui";

type Cert = {
  number: string;
  issuedAt: string;
  kind: "PARTICIPANT" | "COMMITTEE";
  roleTitle: string | null;
};

type Row = {
  userId: string;
  fullName: string;
  nim: string;
  regStatus: "REGISTERED" | "ATTENDED" | "CANCELLED";
  attendedAt: string | null;
  certificate: Cert | null;
};

type Stats = {
  total: number;
  attended: number;
  withCert: number;
  missing: number;
  notCheckedIn: number;
};

type Filter = "missing" | "all" | "with-cert" | "not-checked-in";

export function CertificateAudit({
  eventId,
  rows,
  stats,
}: {
  eventId: string;
  rows: Row[];
  stats: Stats;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("missing");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const filtered = useMemo(() => {
    let result;
    switch (filter) {
      case "missing":
        result = rows.filter((r) => r.regStatus === "ATTENDED" && !r.certificate);
        break;
      case "with-cert":
        result = rows.filter((r) => !!r.certificate);
        break;
      case "not-checked-in":
        result = rows.filter((r) => r.regStatus === "REGISTERED");
        break;
      case "all":
      default:
        result = rows;
        break;
    }

    if (!search.trim()) return result;

    const q = search.toLowerCase().trim();
    return result.filter(
      (r) => r.fullName.toLowerCase().includes(q) || r.nim.includes(q),
    );
  }, [filter, rows, search]);

  const toggle = (id: string) => {
    setSelected((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((r) => r.userId)));
  };

  const submit = (force: boolean) => {
    if (selected.size === 0) {
      setMsg({ kind: "err", text: "Pilih minimal satu peserta." });
      return;
    }
    if (force) {
      const uncheck = filtered.filter((r) => selected.has(r.userId) && !r.attendedAt);
      if (uncheck.length > 0) {
        const ok = confirm(
          `${uncheck.length} peserta di antaranya belum check-in. Tetap terbitkan sertifikat?`,
        );
        if (!ok) return;
      }
    }
    setMsg(null);
    start(async () => {
      const fd = new FormData();
      fd.set("eventId", eventId);
      if (force) fd.set("force", "1");
      for (const id of selected) fd.append("userId", id);
      const res = await issueForUsersAction({}, fd);
      if (res.error) setMsg({ kind: "err", text: res.error });
      else {
        setMsg({ kind: "ok", text: res.success ?? "Selesai." });
        setSelected(new Set());
        router.refresh();
      }
    });
  };

  const counts = {
    all: stats.total,
    missing: stats.missing,
    "with-cert": stats.withCert,
    "not-checked-in": stats.notCheckedIn,
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Total pendaftar", value: stats.total, tone: "muted" },
          { label: "Hadir", value: stats.attended, tone: "ok" },
          { label: "Punya sertifikat", value: stats.withCert, tone: "ok" },
          { label: "Belum dapat sertifikat", value: stats.missing, tone: stats.missing > 0 ? "warn" : "muted" },
        ].map((s) => (
          <div key={s.label} className={`${cardCls} p-4`}>
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className={`s-display mt-1 text-2xl ${s.tone === "warn" ? "text-[var(--state-warning-fg)]" : s.tone === "ok" ? "text-[var(--state-success-fg)]" : "text-foreground"}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Toolbar: filter + search + aksi */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["missing", `Belum dapat (${counts.missing})`],
              ["all", `Semua (${counts.all})`],
              ["with-cert", `Sudah dapat (${counts["with-cert"]})`],
              ["not-checked-in", `Belum check-in (${counts["not-checked-in"]})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setFilter(key);
                setSelected(new Set());
              }}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                filter === key
                  ? "bg-[var(--interactive-active)] font-medium"
                  : "border border-[var(--border-default)] hover:bg-[var(--interactive-hover)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              type="search"
              placeholder="Cari nama atau NPM…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full min-w-[220px] rounded-md border border-[var(--border-default)] bg-transparent pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-[var(--border-focus)] focus:outline-none focus:ring-1 focus:ring-[var(--border-focus)] sm:w-64"
              aria-label="Cari peserta"
            />
          </div>

          <button
            type="button"
            disabled={pending || selected.size === 0}
            onClick={() => submit(false)}
            className={`${btnPrimary} h-9`}
          >
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Download className="size-4" aria-hidden />}
            Terbitkan ({selected.size})
          </button>
          {filter === "not-checked-in" && selected.size > 0 && (
            <button
              type="button"
              disabled={pending}
              onClick={() => submit(true)}
              className={`${btnLine} h-9`}
              title="Terbitkan meski belum check-in"
            >
              <RefreshCw className="size-4" aria-hidden />
              Paksa
            </button>
          )}
        </div>
      </div>

      {msg && (
        <p role="status" className={msg.kind === "ok" ? alertOk : alertErr}>
          {msg.kind === "ok" ? <Check className="mt-0.5 size-4 shrink-0" aria-hidden /> : <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />}
          {msg.text}
        </p>
      )}

      {/* Tabel */}
      {filtered.length === 0 ? (
        <EmptyState
          title={
            search.trim()
              ? `Tidak ada hasil untuk "${search}"`
              : filter === "missing"
                ? "Semua peserta yang hadir sudah dapat sertifikat"
                : "Tidak ada peserta di filter ini"
          }
          description={
            search.trim()
              ? "Coba kata kunci lain, atau hapus pencarian untuk melihat semua."
              : filter === "missing"
                ? "Kalau ada peserta yang hadir tapi tidak check-in, buka filter 'Belum check-in' untuk terbitkan manual."
                : undefined
          }
        />
      ) : (
        <div className={`${cardCls} overflow-x-auto`}>
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-border">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.size > 0 && selected.size === filtered.length}
                    onChange={toggleAll}
                    aria-label="Pilih semua"
                    className="size-4 accent-[#ffa500]"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Nama</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">NPM</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status hadir</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Sertifikat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r) => {
                const checked = selected.has(r.userId);
                return (
                  <tr
                    key={r.userId}
                    className={`transition-colors hover:bg-[var(--interactive-hover)] ${checked ? "bg-[#ffa500]/5" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(r.userId)}
                        aria-label={`Pilih ${r.fullName}`}
                        className="size-4 accent-[#ffa500]"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm">{r.fullName}</td>
                    <td className="px-4 py-3 text-sm tabular-nums">{r.nim}</td>
                    <td className="px-4 py-3 text-sm">
                      {r.regStatus === "ATTENDED" ? (
                        <Badge tone="ok">Hadir</Badge>
                      ) : r.regStatus === "REGISTERED" ? (
                        <Badge tone="warn">Belum check-in</Badge>
                      ) : (
                        <Badge tone="bad">Batal</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {r.certificate ? (
                        <span className="space-y-0.5">
                          <span className="flex items-center gap-1.5">
                            <Badge tone="ok">Sudah</Badge>
                            <span className="font-mono text-xs text-muted-foreground">
                              {r.certificate.number}
                            </span>
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {formatDateTime(new Date(r.certificate.issuedAt))}
                          </span>
                        </span>
                      ) : (
                        <Badge tone="muted">Belum</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
