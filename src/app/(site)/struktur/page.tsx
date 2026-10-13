import type { OfficerPosition } from "@prisma/client";
import { PageHead, Section } from "@/components/site/section";
import { getOrgStructure, type DivisionSnapshot, type OfficerHolder } from "@/lib/organization";
import { BPH_INTI, BPP, DEPARTEMEN } from "@/lib/site-content";

export const metadata = { title: "Struktur — HIMMAN UKRI" };
// Halaman publik: cache 5 menit. Setelah admin mengubah pengurus,
// action memanggil revalidatePath("/struktur") agar langsung segar.
export const revalidate = 300;

const CORE_MAP: Record<string, OfficerPosition> = {
  Ketua: "CHAIR",
  "Wakil Ketua": "VICE_CHAIR",
  "Sekretaris Umum": "SECRETARY",
  "Bendahara Umum": "TREASURER",
};

const initials = (name: string) =>
  name.split(/\s+/).slice(0, 2).map((s) => s[0]).join("").toUpperCase();

function MiniAvatar({ name, url }: { name: string; url: string | null }) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        className="size-6 shrink-0 rounded-full border border-[var(--s-line)] object-cover"
      />
    );
  }
  return (
    <span
      aria-hidden
      className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--s-panel)] text-[10px] font-semibold text-[var(--s-head)]"
    >
      {initials(name)}
    </span>
  );
}

function PersonChip({ holder }: { holder: { name: string; avatarUrl: string | null } }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--s-line)] bg-[var(--s-bg)] py-0.5 pr-3 pl-0.5 text-sm">
      <MiniAvatar name={holder.name} url={holder.avatarUrl} />
      <span className="font-medium text-[var(--s-head)]">{holder.name}</span>
    </span>
  );
}

function EmptyChip({ label = "Belum diisi" }: { label?: string }) {
  return (
    <span className="inline-block rounded-full border border-dashed border-[var(--s-line)] px-2.5 py-0.5 text-xs text-[var(--s-muted)]">
      {label}
    </span>
  );
}

function RoleRow({
  role,
  tasks,
  holder,
}: {
  role: string;
  tasks: string;
  holder?: OfficerHolder | null;
}) {
  return (
    <div className="grid gap-2 border-t border-[var(--s-line)] py-4 first:border-t-0 sm:grid-cols-[15rem_1fr] sm:gap-6">
      <dt>
        <span className="font-semibold text-[var(--s-head)]">{role}</span>
        <div className="mt-1.5">
          {holder ? <PersonChip holder={holder} /> : <EmptyChip />}
        </div>
      </dt>
      <dd className="s-serif">{tasks}</dd>
    </div>
  );
}

function DivisionCard({
  meta,
  data,
}: {
  meta: (typeof DEPARTEMEN)[number];
  data?: DivisionSnapshot;
}) {
  const members = data?.members ?? [];
  const heads = members.filter((m) => m.divisionRole === "DEPT_HEAD");
  const secretaries = members.filter((m) => m.divisionRole === "DEPT_SECRETARY");
  const staffs = members.filter((m) => m.divisionRole === "STAFF" || m.divisionRole === null);

  return (
    <article className="space-y-4 border border-[var(--s-line)] bg-[var(--s-bg)] p-5">
      <header>
        <h3 className="text-lg font-semibold text-[var(--s-head)]">{meta.name}</h3>
        <p className="s-serif mt-1 text-sm text-[var(--s-muted)]">{meta.summary}</p>
      </header>

      <ul className="s-serif list-disc space-y-1 pl-5 text-sm">
        {meta.tasks.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>

      <div className="space-y-3 border-t border-[var(--s-line)] pt-4 text-sm">
        <div>
          <p className="text-xs font-semibold tracking-wide text-[var(--s-muted)] uppercase">
            Kepala Departemen
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {heads.length ? heads.map((h) => <PersonChip key={h.userId} holder={h} />) : <EmptyChip />}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-wide text-[var(--s-muted)] uppercase">
            Sekretaris Departemen
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {secretaries.length
              ? secretaries.map((s) => <PersonChip key={s.userId} holder={s} />)
              : <EmptyChip />}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-wide text-[var(--s-muted)] uppercase">
            Staf {staffs.length > 0 && <span className="text-[var(--s-head)]">({staffs.length})</span>}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {staffs.length
              ? staffs.map((s) => <PersonChip key={s.userId} holder={s} />)
              : <EmptyChip label="Belum ada staf" />}
          </div>
        </div>
      </div>
    </article>
  );
}

export default async function Struktur() {
  const org = await getOrgStructure();

  const bphDivision = org.divisions.find((d) => d.name === "BPH");
  const bphStaff =
    bphDivision?.members.filter((m) => m.divisionRole === "STAFF" || m.divisionRole === null) ?? [];
  const deptDivisions = org.divisions.filter((d) => d.name !== "BPH");

  const externalSigners: { position: OfficerPosition; label: string }[] = [
    { position: "PRODI_HEAD", label: "Ketua Program Studi" },
    { position: "DEAN", label: "Dekan" },
    { position: "VICE_RECTOR_3", label: "Wakil Rektor III" },
  ];
  const hasExternal = externalSigners.some((s) => org.core[s.position]);

  return (
    <>
      <PageHead
        title="Struktur organisasi"
        intro="Kepengurusan HIMMAN terdiri dari Badan Pengurus Harian (BPH) yang menjalankan program, dan Badan Pengawas Pengurus (BPP) yang mengawasinya. Masa baktinya satu periode, yaitu satu tahun."
      />

      <Section id="bph" title="Badan Pengurus Harian">
        <dl className="max-w-3xl">
          {BPH_INTI.map((r) => (
            <RoleRow key={r.role} role={r.role} tasks={r.tasks} holder={org.core[CORE_MAP[r.role]]} />
          ))}
        </dl>
        <p className="s-serif mt-6 max-w-3xl text-[var(--s-muted)]">
          Setiap departemen dipimpin seorang kepala, dibantu sekretaris departemen dan beberapa anggota. Kepala
          departemen melapor kepada Ketua Himpunan sebelum dan sesudah kegiatan.
        </p>
        {bphStaff.length > 0 && (
          <div className="mt-6 max-w-3xl border-t border-[var(--s-line)] pt-5">
            <p className="text-xs font-semibold tracking-wide text-[var(--s-muted)] uppercase">
              Staf BPH ({bphStaff.length})
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {bphStaff.map((s) => (
                <PersonChip key={s.userId} holder={s} />
              ))}
            </div>
          </div>
        )}
      </Section>

      <Section id="departemen" title="Departemen" panel>
        <div className="grid gap-6 lg:grid-cols-2">
          {DEPARTEMEN.map((meta) => (
            <DivisionCard
              key={meta.short}
              meta={meta}
              data={deptDivisions.find((d) => d.name === meta.short)}
            />
          ))}
        </div>
      </Section>

      <Section id="bpp" title="Badan Pengawas Pengurus">
        <p className="s-serif mb-4 max-w-3xl text-[var(--s-muted)]">
          BPP adalah lembaga legislatif yang mengawasi BPH. Anggotanya berasal dari demisioner kabinet sebelumnya.
          Susunan BPP ditetapkan lewat Musyawarah Luar Biasa (MUSLUB).
        </p>
        <dl className="max-w-3xl">
          {BPP.map((r) => (
            <div
              key={r.role}
              className="grid gap-1 border-t border-[var(--s-line)] py-4 first:border-t-0 sm:grid-cols-[15rem_1fr] sm:gap-6"
            >
              <dt className="font-semibold text-[var(--s-head)]">{r.role}</dt>
              <dd className="s-serif">{r.tasks}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="pembina" title="Dewan Pembina" panel>
        <p className="s-serif mb-4 max-w-3xl">
          Dewan Pembina adalah pihak yang ditugaskan fakultas untuk membina HIMMAN. Tugasnya memberi motivasi,
          pembinaan, dan semangat, serta saran dan kritik demi kemajuan organisasi.
        </p>
        {org.advisors.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {org.advisors.map((a) => (
              <PersonChip key={a.userId ?? a.name} holder={a} />
            ))}
          </div>
        ) : (
          <EmptyChip label="Belum ditetapkan" />
        )}
      </Section>

      {hasExternal && (
        <Section id="penandatangan-eksternal" title="Penandatangan eksternal">
          <p className="s-serif mb-4 max-w-3xl text-[var(--s-muted)]">
            Pihak kampus yang menandatangani proposal dan LPJ saat kegiatan memakai dana universitas.
          </p>
          <dl className="max-w-3xl">
            {externalSigners.map(({ position, label }) =>
              org.core[position] ? (
                <div
                  key={position}
                  className="grid gap-1 border-t border-[var(--s-line)] py-4 first:border-t-0 sm:grid-cols-[15rem_1fr] sm:gap-6"
                >
                  <dt className="font-semibold text-[var(--s-head)]">{label}</dt>
                  <dd>
                    <PersonChip holder={org.core[position]!} />
                  </dd>
                </div>
              ) : null,
            )}
          </dl>
        </Section>
      )}
    </>
  );
}
