import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { after, before, describe, it } from "node:test";

/**
 * Tes isolasi tenant (Fase A, langkah 1).
 *
 * Tiga jenis tes di berkas ini:
 *
 *  1. `it(...)`        — perilaku yang SUDAH benar dan harus tetap benar.
 *  2. `knownLeak(...)` — kebocoran yang SUDAH DIKETAHUI. Tes menuliskan perilaku yang
 *                        BENAR dan lulus selama aplikasi masih salah (assertion gagal).
 *                        Begitu kebocoran ditutup, tes ini sengaja menjadi MERAH dan
 *                        meminta diubah menjadi `it(...)`. Jadi CI hijau sekarang, dan
 *                        perbaikan tidak bisa lolos tanpa mengunci hasilnya.
 *  3. Ratchet          — daftar berkas yang masih memakai `prisma` mentah hanya boleh
 *                        menyusut, tidak boleh bertambah.
 *
 * Butuh Postgres bermigrasi (CI menyediakannya); tes database dilewati bila DATABASE_URL
 * tidak diset. Modul diimpor di dalam tes supaya berkas ini aman dimuat tanpa Prisma Client.
 */

const skip = process.env.DATABASE_URL ? false : "DATABASE_URL tidak diset";

function knownLeak(id: string, name: string, fn: () => Promise<void>) {
  it(`[bocor ${id}] ${name}`, { skip }, async () => {
    try {
      await fn();
    } catch (e) {
      if (e instanceof assert.AssertionError) return; // kebocoran masih ada (diharapkan)
      throw e; // kegagalan lain (fixture, koneksi, dll.) tidak boleh dianggap "bocor"
    }
    assert.fail(`Kebocoran ${id} sudah tertutup. Ubah knownLeak(...) ini menjadi it(...).`);
  });
}

type Fixture = {
  orgA: string;
  orgB: string;
  userA: string;
  userB: string;
  eventA: string;
  eventB: string;
};

describe("isolasi tenant (database)", { skip }, () => {
  const run = randomUUID().slice(0, 8);
  const fx = {} as Fixture;

  before(async () => {
    const { prisma } = await import("@/lib/prisma");
    const [member, admin] = await Promise.all([
      prisma.role.upsert({ where: { name: "MEMBER" }, update: {}, create: { name: "MEMBER" } }),
      prisma.role.upsert({ where: { name: "SUPER_ADMIN" }, update: {}, create: { name: "SUPER_ADMIN" } }),
    ]);

    const mkOrg = (tag: string) =>
      prisma.organization.create({ data: { name: `Org ${tag} ${run}`, subdomain: `iso-${tag}-${run}` } });
    const [a, b] = await Promise.all([mkOrg("a"), mkOrg("b")]);
    fx.orgA = a.id;
    fx.orgB = b.id;

    const mkUser = (tag: string, organizationId: string, roleId: number, approvalStatus: "APPROVED" | "PENDING") =>
      prisma.user.create({
        data: {
          nim: `9${run.replace(/\D/g, "").padEnd(5, "1")}${tag.charCodeAt(0)}`,
          fullName: `User ${tag}`,
          email: `iso-${tag}-${run}@example.test`,
          passwordHash: "x",
          roleId,
          approvalStatus,
          batchYear: 2024,
          organizationId,
        },
      });
    const [ua, ub] = await Promise.all([
      mkUser("a", fx.orgA, admin.id, "APPROVED"),
      mkUser("b", fx.orgB, member.id, "PENDING"), // antrean persetujuan MILIK org B
    ]);
    fx.userA = ua.id;
    fx.userB = ub.id;

    const mkEvent = (tag: string, organizationId: string, createdBy: string) =>
      prisma.event.create({
        data: {
          title: `Event ${tag}`,
          slug: `iso-ev-${tag}-${run}`,
          description: "fixture",
          startDate: new Date(Date.now() + 86_400_000),
          endDate: new Date(Date.now() + 2 * 86_400_000),
          location: "fixture",
          isPublic: true,
          createdBy,
          organizationId,
        },
      });
    const [ea, eb] = await Promise.all([mkEvent("a", fx.orgA, fx.userA), mkEvent("b", fx.orgB, fx.userB)]);
    fx.eventA = ea.id;
    fx.eventB = eb.id;
  });

  after(async () => {
    const { prisma } = await import("@/lib/prisma");
    await prisma.event.deleteMany({ where: { organizationId: { in: [fx.orgA, fx.orgB] } } });
    await prisma.user.deleteMany({ where: { organizationId: { in: [fx.orgA, fx.orgB] } } });
    await prisma.organization.deleteMany({ where: { id: { in: [fx.orgA, fx.orgB] } } });
  });

  // ── 1. Pagar yang sudah bekerja ────────────────────────────────────────────
  describe("klien tenant: yang sudah benar", () => {
    it("findMany hanya mengembalikan baris organisasi sendiri", async () => {
      const { getTenantPrisma } = await import("@/lib/prisma-tenant");
      const events = await getTenantPrisma(fx.orgA).event.findMany({ where: { slug: { contains: run } } });
      assert.deepEqual(events.map((e) => e.id), [fx.eventA]);
    });

    it("findFirst dengan ID milik org lain tidak menemukan apa pun", async () => {
      const { getTenantPrisma } = await import("@/lib/prisma-tenant");
      assert.equal(await getTenantPrisma(fx.orgA).event.findFirst({ where: { id: fx.eventB } }), null);
    });

    it("update atas baris org lain ditolak dan data tidak berubah", async () => {
      const { getTenantPrisma } = await import("@/lib/prisma-tenant");
      const { prisma } = await import("@/lib/prisma");
      await assert.rejects(
        getTenantPrisma(fx.orgA).event.update({ where: { id: fx.eventB }, data: { title: "DIRETAS" } }),
      );
      assert.equal((await prisma.event.findUniqueOrThrow({ where: { id: fx.eventB } })).title, "Event b");
    });

    it("delete atas baris org lain ditolak dan baris tetap ada", async () => {
      const { getTenantPrisma } = await import("@/lib/prisma-tenant");
      const { prisma } = await import("@/lib/prisma");
      await assert.rejects(getTenantPrisma(fx.orgA).event.delete({ where: { id: fx.eventB } }));
      assert.ok(await prisma.event.findUnique({ where: { id: fx.eventB } }));
    });

    it("updateMany tidak menyentuh baris org lain", async () => {
      const { getTenantPrisma } = await import("@/lib/prisma-tenant");
      const { prisma } = await import("@/lib/prisma");
      const r = await getTenantPrisma(fx.orgA).event.updateMany({
        where: { id: fx.eventB },
        data: { title: "DIRETAS" },
      });
      assert.equal(r.count, 0);
      assert.equal((await prisma.event.findUniqueOrThrow({ where: { id: fx.eventB } })).title, "Event b");
    });

    it("create selalu dicap dengan organisasi klien, bukan dari data masukan", async () => {
      const { getTenantPrisma } = await import("@/lib/prisma-tenant");
      const { prisma } = await import("@/lib/prisma");
      const made = await getTenantPrisma(fx.orgA).event.create({
        data: {
          title: "Dipaksa ke B",
          slug: `iso-forced-${run}`,
          description: "x",
          startDate: new Date(),
          endDate: new Date(),
          location: "x",
          createdBy: fx.userA,
          organizationId: fx.orgB,
        },
      });
      try {
        assert.equal(made.organizationId, fx.orgA);
      } finally {
        await prisma.event.delete({ where: { id: made.id } });
      }
    });
  });

  // ── 2. Kebocoran yang diketahui (perilaku BENAR ditulis; lulus selama masih bocor) ──
  describe("kebocoran yang diketahui", () => {
    it("findUnique atas ID milik org lain mengembalikan null", { skip }, async () => {
      const { getTenantPrisma } = await import("@/lib/prisma-tenant");
      const row = await getTenantPrisma(fx.orgA).event.findUnique({ where: { id: fx.eventB } });
      assert.equal(row, null);
    });

    it("findUniqueOrThrow atas ID milik org lain melempar", { skip }, async () => {
      const { getTenantPrisma } = await import("@/lib/prisma-tenant");
      await assert.rejects(getTenantPrisma(fx.orgA).event.findUniqueOrThrow({ where: { id: fx.eventB } }));
    });

    it("upsert atas baris milik org lain tidak mengubahnya", { skip }, async () => {
      const { getTenantPrisma } = await import("@/lib/prisma-tenant");
      const { prisma } = await import("@/lib/prisma");
      await getTenantPrisma(fx.orgA).event.upsert({
        where: { id: fx.eventB },
        update: { title: "DIRETAS-UPSERT" },
        create: {
          title: "x",
          slug: `iso-upsert-${run}`,
          description: "x",
          startDate: new Date(),
          endDate: new Date(),
          location: "x",
          createdBy: fx.userA,
        },
      });
      const row = await prisma.event.findUniqueOrThrow({ where: { id: fx.eventB } });
      assert.equal(row.title, "Event b");
    });

    it("getShellCounts org A tidak menghitung antrean persetujuan org B", { skip }, async () => {
      const { getShellCounts } = await import("@/lib/shell-counts");
      const admin = { id: fx.userA, role: "SUPER_ADMIN", permissions: [] as string[], organizationId: fx.orgA };
      const counts = await getShellCounts(admin);
      assert.equal(counts.members, undefined);
    });

    knownLeak("A3-organization-id-not-null", "semua kolom organization_id bertipe NOT NULL", async () => {
      const { prisma } = await import("@/lib/prisma");
      const rows = await prisma.$queryRaw<{ table_name: string }[]>`
        SELECT c.table_name::text
          FROM information_schema.columns c
          JOIN information_schema.tables t USING (table_schema, table_name)
         WHERE c.table_schema = 'public' AND t.table_type = 'BASE TABLE'
           AND c.column_name = 'organization_id' AND c.is_nullable = 'YES'
         ORDER BY 1`;
      assert.deepEqual(rows.map((r) => r.table_name), []);
    });

    knownLeak("A3-unique-per-tenant", "kunci alami (slug, nomor surat, dst.) unik per organisasi, bukan global", async () => {
      // Dikecualikan: `users` (menunggu keputusan model identitas, A3) dan kunci acak/HMAC yang memang
      // sengaja global (tracking_code, qr_code_hash, token_hash). Indeks yang memuat kolom *_id
      // (mis. event_id+user_id) mewarisi isolasi dari induknya dan tidak diperiksa di sini.
      const { prisma } = await import("@/lib/prisma");
      const rows = await prisma.$queryRaw<{ table_name: string; cols: string[] }[]>`
        WITH tt AS (
          SELECT ('public.' || quote_ident(c.table_name))::regclass AS oid, c.table_name::text AS table_name
            FROM information_schema.columns c
            JOIN information_schema.tables t USING (table_schema, table_name)
           WHERE c.table_schema = 'public' AND t.table_type = 'BASE TABLE' AND c.column_name = 'organization_id'
        )
        SELECT x.table_name, x.cols FROM (
          SELECT tt.table_name, array_agg(a.attname::text ORDER BY k.ord) AS cols
            FROM tt
            JOIN pg_index i ON i.indrelid = tt.oid AND i.indisunique AND i.indpred IS NULL
           CROSS JOIN LATERAL unnest(i.indkey) WITH ORDINALITY AS k(attnum, ord)
            JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = k.attnum
           GROUP BY tt.table_name, i.indexrelid
        ) x
        WHERE x.table_name <> 'users'
          AND NOT ('organization_id' = ANY (x.cols))
          AND NOT EXISTS (SELECT 1 FROM unnest(x.cols) AS col WHERE col LIKE '%\\_id' ESCAPE '\\')
          AND NOT (x.table_name = 'feedbacks' AND x.cols = ARRAY['tracking_code'])
          AND NOT (x.table_name = 'event_registrations' AND x.cols = ARRAY['qr_code_hash'])
          AND NOT (x.table_name = 'password_reset_tokens' AND x.cols = ARRAY['token_hash'])
        ORDER BY 1`;
      assert.deepEqual(rows, []);
    });

    knownLeak("A4-rls", "semua tabel ber-organization_id mengaktifkan Row-Level Security", async () => {
      const { prisma } = await import("@/lib/prisma");
      const rows = await prisma.$queryRaw<{ table_name: string }[]>`
        SELECT c.table_name::text
          FROM information_schema.columns c
          JOIN information_schema.tables t USING (table_schema, table_name)
          JOIN pg_class pc ON pc.oid = ('public.' || quote_ident(c.table_name))::regclass
         WHERE c.table_schema = 'public' AND t.table_type = 'BASE TABLE'
           AND c.column_name = 'organization_id' AND NOT pc.relrowsecurity
         ORDER BY 1`;
      assert.deepEqual(rows.map((r) => r.table_name), []);
    });
  });
});

// ── 3. Ratchet: akses `prisma` mentah ke model bertenant hanya boleh menyusut ──────────
// Menghitung pemanggilan `prisma.<modelBertenant>.…` dan `prisma.$queryRaw/$executeRaw` per berkas di
// `src/`. Itu adalah jalur yang melewati `getTenantPrisma()`, sehingga isolasinya bergantung pada
// disiplin manual. Angka per berkas hanya boleh TURUN:
//   • berkas baru atau angka naik  → gagal (pakai getTenantPrisma(organizationId));
//   • angka turun                  → gagal sampai angka di bawah ikut diturunkan/dihapus.
// Catatan: `prisma.role/permission/organization` (model global) tidak dihitung. Beberapa entri di sini
// memang sah secara permanen (login, resolusi tenant, rate-limit); akan dipisahkan ke daftar
// pengecualian saat A2 selesai.
const RAW_ACCESS_BASELINE = new Map<string, number>([
  ["src/actions/auth.ts", 2],
  ["src/actions/committee-meetings.ts", 13],
  ["src/actions/member-admin.ts", 5],
  ["src/actions/member-create.ts", 1],
  ["src/actions/member-import.ts", 3],
  ["src/actions/password-reset.ts", 6],
  ["src/app/(public)/verify-certificate/[id]/page.tsx", 1],
  ["src/app/(public)/verify-member/[token]/page.tsx", 2],
  ["src/app/(site)/aspirasi/lacak/page.tsx", 1],
  ["src/app/(site)/kegiatan/[slug]/page.tsx", 1],
  ["src/app/api/proofs/[name]/route.ts", 1],
  ["src/app/api/signatures/[name]/route.ts", 1],
  ["src/app/dashboard/events/[slug]/panitia/kelola/page.tsx", 1],
  ["src/app/dashboard/events/[slug]/panitia/page.tsx", 7],
  ["src/app/dashboard/events/[slug]/panitia/rapat/page.tsx", 3],
  ["src/app/dashboard/events/[slug]/panitia/scan/page.tsx", 1],
  ["src/app/dashboard/finance/page.tsx", 1],
  ["src/app/dashboard/resources/page.tsx", 1],
  ["src/auth.ts", 1],
  ["src/components/committee/manager.tsx", 4],
  ["src/components/committee/recap.tsx", 3],
  ["src/components/finance-reports.tsx", 1],
  ["src/lib/admin-overview.ts", 11],
  ["src/lib/approval.ts", 1],
  ["src/lib/certificate-service.ts", 2],
  ["src/lib/committee.ts", 3],
  ["src/lib/finance-report.ts", 4],
  ["src/lib/finance-service.ts", 4],
  ["src/lib/finance-statements.ts", 3],
  ["src/lib/notifications.ts", 8],
  ["src/lib/officers.ts", 1],
  ["src/lib/organization.ts", 2],
  ["src/lib/password-reset.ts", 6],
  ["src/lib/rate-limit.ts", 2],
  // shell-counts.ts sudah migrasi ke getTenantPrisma; entri baseline dihapus.
  ["src/lib/site-data.ts", 4],
]);

const TENANT_MODELS = [
  "user", "division", "member", "event", "eventRegistration", "committeeDivision", "committeeApplication",
  "committeeMeeting", "certificate", "financialTransaction", "memberDues", "officialLetter", "letterCounter",
  "cmsPost", "feedback", "auditLog", "appSetting", "resource", "orgOfficer", "notification",
  "notificationPreference", "notificationConsent", "passwordResetToken",
];
// Harus selaras dengan `modelsWithTenant` di src/lib/prisma-tenant.ts.
const RAW_ACCESS = new RegExp(
  String.raw`(?<![\w.])prisma\s*\.\s*(?:(?:${TENANT_MODELS.join("|")})\s*\.|\$(?:queryRaw|executeRaw|queryRawUnsafe|executeRawUnsafe))`,
  "g",
);
// Pintu masuk klien itu sendiri.
const RAW_ACCESS_EXEMPT = new Set(["src/lib/prisma.ts", "src/lib/prisma-tenant.ts"]);

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return name === "__tests__" ? [] : sourceFiles(full);
    return /\.(ts|tsx)$/.test(name) ? [full] : [];
  });
}

describe("ratchet: akses prisma mentah ke model bertenant", () => {
  const root = process.cwd();
  const actual = new Map<string, number>();
  for (const abs of sourceFiles(join(root, "src"))) {
    const rel = relative(root, abs).split(sep).join("/");
    if (RAW_ACCESS_EXEMPT.has(rel)) continue;
    const n = (readFileSync(abs, "utf8").match(RAW_ACCESS) ?? []).length;
    if (n > 0) actual.set(rel, n);
  }

  it("tidak ada akses mentah baru atau bertambah (pakai getTenantPrisma)", () => {
    const worse = [...actual]
      .filter(([f, n]) => n > (RAW_ACCESS_BASELINE.get(f) ?? 0))
      .map(([f, n]) => `${f}: ${RAW_ACCESS_BASELINE.get(f) ?? 0} -> ${n}`);
    assert.deepEqual(worse, [], "Gunakan getTenantPrisma(organizationId) alih-alih prisma mentah.");
  });

  it("angka baseline tidak usang (turunkan setelah migrasi berkas)", () => {
    const better = [...RAW_ACCESS_BASELINE]
      .filter(([f, n]) => (actual.get(f) ?? 0) < n)
      .map(([f, n]) => `${f}: ${n} -> ${actual.get(f) ?? 0}`);
    assert.deepEqual(better, [], "Perbarui RAW_ACCESS_BASELINE: ratchet harus ikut mengetat.");
  });
});
