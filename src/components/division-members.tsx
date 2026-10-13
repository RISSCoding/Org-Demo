"use client";

import type { DivisionRole } from "@prisma/client";
import { ChevronDown, Search, UserMinus, UserPlus } from "lucide-react";
import { useActionState, useId, useState } from "react";
import {
  addDivisionMembersAction,
  removeDivisionMemberAction,
  setMemberDivisionRoleAction,
} from "@/actions/divisions";
import { SubmitButton } from "@/components/submit-button";
import { useFormFeedback } from "@/components/ux/use-form-feedback";
import { alertErr, btnGhost, btnLine, inputCls } from "@/lib/ui";
import type { FormState } from "@/types/forms";

/** isMember: sudah punya profil anggota (syarat untuk ditempatkan di divisi). */
export type DivisionPerson = { id: string; fullName: string; nim: string; isMember: boolean; divisionId: number | null };
export type DivisionMember = { userId: string; fullName: string; nim: string; divisionRole: DivisionRole | null };

const MAX_SHOWN = 60;

const ROLE_OPTIONS: { value: DivisionRole; label: string }[] = [
  { value: "DEPT_HEAD", label: "Kepala Departemen" },
  { value: "DEPT_SECRETARY", label: "Sekretaris Departemen" },
  { value: "STAFF", label: "Staf" },
];

const ROLE_BADGE: Record<DivisionRole, string> = {
  DEPT_HEAD: "bg-[#ffa500]/20 text-[var(--state-warning-fg)]",
  DEPT_SECRETARY: "bg-[var(--state-success-bg)] text-[var(--emerald)]",
  STAFF: "bg-muted text-muted-foreground",
};

export function DivisionMembers({
  divisionId,
  divisionName,
  members,
  candidates,
  divisionNames,
}: {
  divisionId: number;
  divisionName: string;
  members: DivisionMember[];
  /** Semua akun yang boleh ditempatkan; yang sudah di divisi ini disaring di sini. */
  candidates: DivisionPerson[];
  divisionNames: Record<number, string>;
}) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [onlyFree, setOnlyFree] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);

  const [addState, addAction] = useActionState<FormState, FormData>(async (prev, fd) => {
    const res = await addDivisionMembersAction(prev, fd);
    if (res.success) {
      setPicked([]);
      setQuery("");
    }
    return res;
  }, {});
  const [removeState, removeAction] = useActionState<FormState, FormData>(removeDivisionMemberAction, {});
  const [roleState, roleAction] = useActionState<FormState, FormData>(setMemberDivisionRoleAction, {});
  useFormFeedback(addState);
  useFormFeedback(removeState);

  const q = query.trim().toLowerCase();
  const pool = candidates.filter(
    (p) =>
      p.isMember &&
      p.divisionId !== divisionId &&
      (!onlyFree || p.divisionId === null) &&
      (!q || p.fullName.toLowerCase().includes(q) || p.nim.toLowerCase().includes(q)),
  );
  const shown = pool.slice(0, MAX_SHOWN);
  const toggle = (id: string) => setPicked((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  return (
    <div className="w-full">
      <button
        type="button"
        className={`${btnGhost} -ml-3 text-muted-foreground hover:text-foreground`}
        aria-expanded={open}
        aria-controls={`${uid}-panel`}
        onClick={() => setOpen((o) => !o)}
      >
        <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
        Anggota ({members.length})
      </button>

      {open && (
        <div id={`${uid}-panel`} className="mt-2 grid gap-5 lg:grid-cols-2">
          {/* Anggota saat ini */}
          <section aria-label={`Anggota ${divisionName}`} className="space-y-2">
            <h3 className="text-sm font-medium">Anggota saat ini</h3>
            {members.length === 0 ? (
              <p className="rounded-sm border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
                Belum ada anggota. Pilih dari daftar di samping lalu tekan Tambahkan.
              </p>
            ) : (
              <ul className="max-h-72 divide-y divide-border overflow-auto rounded-sm border border-border">
                {members.map((m) => {
                  const role: DivisionRole = m.divisionRole ?? "STAFF";
                  return (
                    <li key={m.userId} className="flex items-center gap-2 px-3 py-1.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">{m.fullName}</p>
                        <p className="tabular text-xs text-muted-foreground">{m.nim}</p>
                      </div>
                      <form action={roleAction} className="flex items-center gap-1">
                        <input type="hidden" name="userId" value={m.userId} />
                        <input type="hidden" name="divisionId" value={divisionId} />
                        <label className="sr-only" htmlFor={`r-${uid}-${m.userId}`}>
                          Jabatan {m.fullName} di {divisionName}
                        </label>
                        <select
                          id={`r-${uid}-${m.userId}`}
                          name="divisionRole"
                          defaultValue={role}
                          onChange={(e) => e.currentTarget.form?.requestSubmit()}
                          className={`h-8 rounded-sm border border-border bg-background px-2 text-xs font-medium ${ROLE_BADGE[role]}`}
                        >
                          {ROLE_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </form>
                      <form action={removeAction}>
                        <input type="hidden" name="divisionId" value={divisionId} />
                        <input type="hidden" name="userId" value={m.userId} />
                        <SubmitButton
                          className={`${btnGhost} text-[var(--state-danger-fg)]`}
                          aria-label={`Keluarkan ${m.fullName} dari ${divisionName}`}
                          title="Keluarkan dari divisi"
                        >
                          <UserMinus className="size-4" aria-hidden />
                        </SubmitButton>
                      </form>
                    </li>
                  );
                })}
              </ul>
            )}
            {removeState.error && <p role="alert" className={alertErr}>{removeState.error}</p>}
            {roleState.error && <p role="alert" className={alertErr}>{roleState.error}</p>}
            {roleState.success && <p role="status" className="text-xs text-[var(--emerald)]">{roleState.success}</p>}
          </section>

          {/* Tambah anggota */}
          <section aria-label={`Tambah anggota ${divisionName}`} className="space-y-2">
            <h3 className="text-sm font-medium">Tambah anggota</h3>
            <form action={addAction} className="space-y-2">
              <input type="hidden" name="divisionId" value={divisionId} />
              {picked.map((id) => (
                <input key={id} type="hidden" name="userId" value={id} />
              ))}

              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.preventDefault();
                  }}
                  placeholder="Cari nama atau NPM…"
                  aria-label="Cari anggota untuk ditambahkan"
                  autoComplete="off"
                  className={`${inputCls} pl-9`}
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" checked={onlyFree} onChange={(e) => setOnlyFree(e.target.checked)} className="size-4 accent-[#ffa500]" />
                Hanya yang belum punya divisi
              </label>

              <ul className="max-h-64 divide-y divide-border overflow-auto rounded-sm border border-border" aria-label="Hasil pencarian anggota">
                {pool.length === 0 && (
                  <li className="px-3 py-4 text-sm text-muted-foreground">
                    {q ? `Tidak ada yang cocok dengan “${query.trim()}”.` : "Tidak ada anggota lain yang bisa ditambahkan."}
                  </li>
                )}
                {shown.map((p) => {
                  const checked = picked.includes(p.id);
                  return (
                    <li key={p.id}>
                      <label className={`flex min-h-11 cursor-pointer items-center gap-3 px-3 py-1.5 hover:bg-muted ${checked ? "bg-muted" : ""}`}>
                        <input type="checkbox" checked={checked} onChange={() => toggle(p.id)} className="size-4 shrink-0 accent-[#ffa500]" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm">{p.fullName}</span>
                          <span className="tabular block text-xs text-muted-foreground">
                            {p.nim}
                            {p.divisionId !== null && ` · saat ini di ${divisionNames[p.divisionId] ?? "divisi lain"} (akan dipindahkan)`}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
                {pool.length > MAX_SHOWN && (
                  <li className="px-3 py-2 text-xs text-muted-foreground">Menampilkan {MAX_SHOWN} dari {pool.length}. Ketik lebih spesifik untuk mempersempit.</li>
                )}
              </ul>

              <label className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium">Jabatan saat ditambahkan</span>
                <select name="divisionRole" defaultValue="STAFF" className={`${inputCls} w-auto`}>
                  {ROLE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>
              <p className="text-xs text-muted-foreground">
                Jabatan bisa diubah nanti dari daftar anggota. Ketua Departemen hanya boleh satu orang per divisi.
              </p>

              {addState.error && <p role="alert" className={alertErr}>{addState.error}</p>}

              <div className="flex flex-wrap items-center gap-2">
                <SubmitButton pendingLabel="Menambahkan…" disabled={picked.length === 0}>
                  <UserPlus className="size-4" aria-hidden />
                  {picked.length > 0 ? `Tambahkan ${picked.length} anggota` : "Tambahkan"}
                </SubmitButton>
                {picked.length > 0 && (
                  <button type="button" className={btnLine} onClick={() => setPicked([])}>
                    Kosongkan pilihan
                  </button>
                )}
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
