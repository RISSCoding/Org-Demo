"use client";

import { deleteDivisionAction, updateDivisionAction } from "@/actions/divisions";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { DivisionMembers, type DivisionMember, type DivisionPerson } from "@/components/division-members";
import { SearchSelect } from "@/components/search-select";
import { btnLine, cardCls, inputCls } from "@/lib/ui";

export type DivisionRow = { id: number; name: string; leaderId: string | null; members: DivisionMember[] };

/**
 * Daftar divisi: ubah nama, pilih ketua lewat pencarian, dan kelola anggota tiap divisi.
 * Daftar orang dikirim sekali dari server lalu dipakai bersama oleh semua baris.
 */
export function DivisionsBoard({
  divisions,
  people,
  signedUserIds = [],
}: {
  divisions: DivisionRow[];
  people: DivisionPerson[];
  /** Akun yang sudah mengunggah tanda tangan (lewat Profil). Hanya untuk menampilkan status ketua divisi. */
  signedUserIds?: string[];
}) {
  const signed = new Set(signedUserIds);
  const leaderOptions = people.map((p) => ({ value: p.id, label: p.fullName, hint: p.nim }));
  const divisionNames = Object.fromEntries(divisions.map((d) => [d.id, d.name])) as Record<number, string>;

  return (
    <div className={`${cardCls} divide-y divide-border`}>
      {divisions.length === 0 && <p className="p-4 text-sm text-muted-foreground">Belum ada divisi.</p>}
      {divisions.map((d) => (
        <div key={d.id} className="space-y-1 p-4">
          <div className="flex flex-wrap items-end gap-3">
            <form action={updateDivisionAction} className="flex flex-1 flex-wrap items-end gap-3">
              <input type="hidden" name="id" value={d.id} />
              <div className="min-w-48 flex-1 space-y-1.5">
                <label htmlFor={`n-${d.id}`} className="text-sm font-medium">Nama</label>
                <input id={`n-${d.id}`} name="name" defaultValue={d.name} required minLength={2} maxLength={60} className={inputCls} />
              </div>
              <div className="min-w-56 flex-1 space-y-1.5">
                <label htmlFor={`l-${d.id}`} className="text-sm font-medium">Ketua</label>
                <SearchSelect id={`l-${d.id}`} name="leaderId" options={leaderOptions} defaultValue={d.leaderId ?? ""} />
                {d.leaderId && (
                  <p className="text-xs text-muted-foreground">
                    Tanda tangan ketua: {signed.has(d.leaderId) ? "sudah diunggah" : "belum diunggah (diunggah sendiri lewat Profil)"}
                  </p>
                )}
              </div>
              <button type="submit" className={btnLine}>Simpan</button>
            </form>
            <form action={deleteDivisionAction}>
              <input type="hidden" name="id" value={d.id} />
              <ConfirmSubmit message={`Hapus divisi ${d.name}?`} className={`${btnLine} text-red-600 dark:text-red-400`}>
                Hapus
              </ConfirmSubmit>
            </form>
          </div>

          <DivisionMembers
            divisionId={d.id}
            divisionName={d.name}
            leaderId={d.leaderId}
            members={d.members}
            candidates={people}
            divisionNames={divisionNames}
          />
        </div>
      ))}
    </div>
  );
}
