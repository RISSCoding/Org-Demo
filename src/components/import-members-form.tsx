"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { FileSpreadsheet } from "lucide-react";
import { importMembersChunkAction, previewMemberImportAction } from "@/actions/member-import";
import { Field } from "@/components/auth/field";
import { defaultPassword } from "@/lib/member-import";
import type { ImportPreview } from "@/lib/member-import";
import { MEMBER_STATUS_OPTIONS } from "@/lib/permissions-meta";
import { btnLine, btnPrimary, cardCls, inputCls, linkCls } from "@/lib/ui";

const CHUNK = 20;
type Totals = { created: number; skipped: number; failed: { nim: string; reason: string }[] };

export function ImportMembersForm() {
  const [pending, startTransition] = useTransition();
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE" | "ALUMNI">("ACTIVE");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);

  const fresh = preview?.rows?.filter((r) => !r.exists) ?? [];
  const existing = (preview?.rows?.length ?? 0) - fresh.length;

  function onPreview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setTotals(null); setFatal(null);
    startTransition(async () => setPreview(await previewMemberImportAction(fd)));
  }

  async function onImport() {
    setRunning(true); setFatal(null); setProgress(0);
    const acc: Totals = { created: 0, skipped: 0, failed: [] };
    try {
      for (let i = 0; i < fresh.length; i += CHUNK) {
        const rows = fresh.slice(i, i + CHUNK).map(({ nim, fullName }) => ({ nim, fullName }));
        const r = await importMembersChunkAction({ rows, memberStatus: status });
        acc.created += r.created; acc.skipped += r.skipped; acc.failed.push(...r.failed);
        setProgress(Math.min(i + CHUNK, fresh.length));
      }
    } catch {
      setFatal("Proses terhenti di tengah jalan. Muat ulang halaman, lalu pratinjau lagi: NPM yang sudah masuk otomatis dilewati.");
    }
    setTotals(acc);
    setPreview(null);
    setRunning(false);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onPreview} className={`${cardCls} space-y-4 p-5`}>
        <h2 className="text-lg font-semibold text-[var(--s-head)]">1. Pilih file</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="file" className="text-sm font-medium">File Excel mahasiswa baru (.xlsx)</label>
            <input id="file" name="file" type="file" accept=".xlsx" required className={`${inputCls} py-1.5`} />
          </div>
          <Field label="Prodi yang diambil" name="prodi" defaultValue="Manajemen" hint='Cocok dengan judul blok "PRODI …" di file.' required />
        </div>
        <div className="max-w-xs space-y-1.5">
          <label htmlFor="memberStatus" className="text-sm font-medium">Status anggota</label>
          <select id="memberStatus" value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={inputCls}>
            {MEMBER_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <button type="submit" disabled={pending || running} className={btnLine}>
          <FileSpreadsheet className="size-4" /> {pending ? "Membaca…" : "Pratinjau"}
        </button>
      </form>

      {preview?.error && (
        <div role="alert" className="space-y-1 rounded-sm bg-[var(--state-danger-bg)] px-3 py-2 text-sm text-[var(--state-danger-fg)]">
          <p>{preview.error}</p>
          {preview.sections && preview.sections.length > 0 && <p className="text-xs">Blok yang ada di file: {preview.sections.join(", ")}</p>}
        </div>
      )}

      {preview?.rows && (
        <section className={`${cardCls} space-y-4 p-5`}>
          <h2 className="text-lg font-semibold text-[var(--s-head)]">2. Periksa lalu impor</h2>
          <p className="text-sm">
            Prodi <strong>{preview.prodiLabel}</strong>: <strong>{preview.rows.length}</strong> mahasiswa di file,{" "}
            <strong>{fresh.length}</strong> akan dibuat{existing > 0 && <>, {existing} sudah terdaftar (dilewati)</>}
            {preview.invalid && preview.invalid.length > 0 && <>, {preview.invalid.length} baris bermasalah (dilewati)</>}.
          </p>
          {fresh[0] && (
            <p className="text-sm text-muted-foreground">
              Login memakai NPM. Contoh: <code>{fresh[0].nim}</code> dengan password <code>{defaultPassword(fresh[0].nim, fresh[0].batchYear)}</code>.
              Akun langsung disetujui, peran Anggota, nomor KTA diterbitkan otomatis, email sementara diisi otomatis.
            </p>
          )}
          {preview.invalid && preview.invalid.length > 0 && (
            <ul className="list-inside list-disc text-xs text-[var(--state-danger-fg)]">
              {preview.invalid.map((x) => <li key={x.row}>Baris {x.row}: {x.reason}</li>)}
            </ul>
          )}
          <div className="max-h-80 overflow-auto border border-border">
            <table className="w-full min-w-[480px] text-sm">
              <thead className="sticky top-0 bg-card"><tr className="border-b border-border">
                <th className="px-3 py-2 text-left font-semibold">NPM</th><th className="px-3 py-2 text-left font-semibold">Nama</th>
                <th className="px-3 py-2 text-left font-semibold">Angkatan</th><th className="px-3 py-2 text-left font-semibold">Keterangan</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {preview.rows.map((r) => (
                  <tr key={r.nim} className={r.exists ? "text-muted-foreground" : ""}>
                    <td className="px-3 py-1.5">{r.nim}</td><td className="px-3 py-1.5">{r.fullName}</td>
                    <td className="px-3 py-1.5">{r.batchYear}</td><td className="px-3 py-1.5">{r.exists ? "Sudah terdaftar" : "Baru"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onImport} disabled={running || fresh.length === 0} className={btnPrimary}>
              {running ? `Mengimpor… ${progress}/${fresh.length}` : `Impor ${fresh.length} anggota`}
            </button>
            {running && <progress value={progress} max={fresh.length} className="h-2 w-48" />}
          </div>
        </section>
      )}

      {fatal && <p role="alert" className="rounded-sm bg-[var(--state-danger-bg)] px-3 py-2 text-sm text-[var(--state-danger-fg)]">{fatal}</p>}
      {totals && (
        <section className={`${cardCls} space-y-2 p-5`}>
          <h2 className="text-lg font-semibold text-[var(--s-head)]">Selesai</h2>
          <p className="text-sm">
            <strong>{totals.created}</strong> akun dibuat, {totals.skipped} dilewati (sudah ada), {totals.failed.length} gagal.
          </p>
          {totals.failed.length > 0 && (
            <ul className="list-inside list-disc text-xs text-[var(--state-danger-fg)]">
              {totals.failed.map((f) => <li key={f.nim}>{f.nim}: {f.reason}</li>)}
            </ul>
          )}
          <Link href="/admin/members" className={linkCls}>Lihat daftar anggota</Link>
        </section>
      )}
    </div>
  );
}
