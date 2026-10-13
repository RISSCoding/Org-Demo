import { prisma } from "@/lib/prisma";
import { dateKey } from "@/lib/finance";

/**
 * Data untuk halaman Ringkasan admin. Semua dalam satu pemanggilan.
 * Tujuan: menjawab empat pertanyaan saat membuka panel:
 *   1. Apa yang menunggu tindakan saya?
 *   2. Apa yang harus disiapkan minggu ini?
 *   3. Bagaimana kondisi kas bulan ini?
 *   4. Apa yang baru terjadi di organisasi?
 */
export type ActionItem = {
  key: string;
  label: string;
  href: string;
  count: number;
  hint?: string;
};

export type UpcomingEvent = {
  id: string;
  slug: string;
  title: string;
  startDate: Date;
  location: string;
  daysUntil: number;
  participantCount: number;
  committeeCount: number;
  committeeOpen: boolean;
};

export type RecentActivity = {
  id: string;
  at: Date;
  actorName: string | null;
  description: string;
};

export type AdminOverview = {
  actions: ActionItem[];
  upcomingEvents: UpcomingEvent[];
  finance: {
    balance: number;
    incomeThisMonth: number;
    expenseThisMonth: number;
    incomeLastMonth: number;
    expenseLastMonth: number;
    duesPaidThisMonth: number;
    duesTotalThisMonth: number;
  };
  recentActivity: RecentActivity[];
};

// Pemetaan action → kata kerja untuk deskripsi aktivitas.
const ACTION_VERB: Record<string, string> = {
  CREATE: "menambah",
  UPDATE: "mengubah",
  DELETE: "menghapus",
  VERIFY: "memverifikasi",
  APPROVE_DUES: "menyetujui iuran",
  REJECT_DUES_PROOF: "menolak bukti iuran",
  GENERATE_DUES: "membuat tagihan iuran",
  CHECK_IN: "check-in peserta",
  COMMITTEE_CHECK_IN: "check-in panitia",
  COMMITTEE_DAY_MARK: "menandai hadir panitia",
  COMMITTEE_DAY_UNMARK: "membatalkan kehadiran panitia",
  ISSUE_CERTIFICATES: "menerbitkan sertifikat peserta",
  ISSUE_COMMITTEE_CERTIFICATES: "menerbitkan sertifikat panitia",
  COMMITTEE_APPLY: "mendaftar jadi panitia",
  COMMITTEE_WITHDRAW: "mengundurkan diri dari kepanitiaan",
  COMMITTEE_DECIDE: "memutuskan pendaftar panitia",
  COMMITTEE_SETTINGS: "mengubah pengaturan kepanitiaan",
  COMMITTEE_DIVISION_ADD: "menambah divisi panitia",
  COMMITTEE_DIVISION_EDIT: "mengubah divisi panitia",
  COMMITTEE_DIVISION_DELETE: "menghapus divisi panitia",
  COMMITTEE_MEETING_CREATE: "membuat rapat panitia",
  COMMITTEE_MEETING_OPEN: "membuka absensi rapat",
  COMMITTEE_MEETING_CLOSE: "menutup absensi rapat",
  COMMITTEE_MEETING_DELETE: "menghapus rapat panitia",
  SIGNATURE_SET: "mengunggah tanda tangan",
  SIGNATURE_REMOVE: "menghapus tanda tangan",
  CREATE_MEMBER: "menambah anggota",
  IMPORT_MEMBERS: "mengimpor anggota",
  UPDATE_MEMBER: "mengubah data anggota",
  RESET_PASSWORD: "mengatur ulang password",
  CHANGE_PASSWORD: "mengganti password",
  UPDATE_SETTING: "mengubah pengaturan",
  ONBOARDING_COMPLETE: "menyelesaikan tutorial",
  FORWARD: "meneruskan surat",
  APPROVED: "menyetujui pendaftaran anggota",
  REJECTED: "menolak pendaftaran anggota",
};

// Pemetaan entity → kata benda, kalau action-nya generik (CREATE/UPDATE/DELETE).
const ENTITY_NOUN: Record<string, string> = {
  users: "akun",
  members: "anggota",
  financial_transactions: "transaksi",
  member_dues: "iuran",
  official_letters: "surat",
  events: "event",
  divisions: "divisi",
  org_officers: "pengurus",
  cms_posts: "tulisan",
  feedbacks: "aspirasi",
  resources: "materi",
  committee_applications: "pendaftaran panitia",
  committee_meetings: "rapat panitia",
  app_settings: "pengaturan",
};

function describe(action: string, entity: string): string {
  const verb = ACTION_VERB[action];
  if (verb) return verb;
  const noun = ENTITY_NOUN[entity] ?? entity;
  return `${action.toLowerCase()} ${noun}`;
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1) - 7 * 3600_000);
  const startOfNextMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 1) - 7 * 3600_000);
  const startOfLastMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth() - 1, 1) - 7 * 3600_000);
  const thisMonthKey = dateKey(now).slice(0, 7);

  const [
    pendingMembers,
    unverifiedTx,
    awaitingDues,
    openFeedback,
    openBugs,
    upcomingRaw,
    txThisMonth,
    txLastMonth,
    duesAgg,
    balanceRows,
    recentLogs,
  ] = await Promise.all([
    prisma.user.count({ where: { approvalStatus: "PENDING" } }),
    prisma.financialTransaction.count({ where: { verifiedBy: null } }),
    prisma.memberDues.count({ where: { proofUrl: { not: null }, status: { not: "PAID" } } }),
    prisma.feedback.count({ where: { status: "OPEN", category: { not: "Bug" } } }),
    prisma.feedback.count({ where: { status: "OPEN", category: "Bug" } }),

    prisma.event.findMany({
      where: { startDate: { gte: now, lte: in30Days } },
      orderBy: { startDate: "asc" },
      take: 5,
      select: {
        id: true, slug: true, title: true, startDate: true, location: true, committeeOpen: true,
        _count: {
          select: {
            registrations: { where: { status: { not: "CANCELLED" } } },
            committeeApplications: { where: { status: "ACCEPTED" } },
          },
        },
      },
    }),

    prisma.financialTransaction.groupBy({
      by: ["type"],
      where: { date: { gte: startOfMonth, lt: startOfNextMonth }, verifiedBy: { not: null } },
      _sum: { amount: true },
    }),
    prisma.financialTransaction.groupBy({
      by: ["type"],
      where: { date: { gte: startOfLastMonth, lt: startOfMonth }, verifiedBy: { not: null } },
      _sum: { amount: true },
    }),
    prisma.memberDues.groupBy({
      by: ["status"],
      where: { monthYear: thisMonthKey },
      _count: true,
    }),

    // Saldo: jumlah pemasukan terverifikasi − pengeluaran terverifikasi, sepanjang waktu.
    prisma.financialTransaction.groupBy({
      by: ["type"],
      where: { verifiedBy: { not: null } },
      _sum: { amount: true },
    }),

    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true, action: true, entity: true, createdAt: true,
        user: { select: { fullName: true } },
      },
    }),
  ]);

  const num = (v: unknown): number => (v == null ? 0 : Number(v));
  const sumOf = (rows: { type: string; _sum: { amount: unknown } }[], type: string) =>
    num(rows.find((r) => r.type === type)?._sum.amount);

  const incomeThisMonth = sumOf(txThisMonth, "INCOME");
  const expenseThisMonth = sumOf(txThisMonth, "EXPENSE");
  const incomeLastMonth = sumOf(txLastMonth, "INCOME");
  const expenseLastMonth = sumOf(txLastMonth, "EXPENSE");
  const balance = sumOf(balanceRows, "INCOME") - sumOf(balanceRows, "EXPENSE");

  const duesPaidThisMonth = duesAgg.find((d) => d.status === "PAID")?._count ?? 0;
  const duesTotalThisMonth = duesAgg.reduce((a, d) => a + d._count, 0);

  // Antrean: hanya tampilkan yang > 0, urut prioritas.
  const actions: ActionItem[] = [];
  if (pendingMembers > 0)
    actions.push({
      key: "members",
      label: `${pendingMembers} pendaftar anggota menunggu persetujuan`,
      href: "/admin/members#menunggu",
      count: pendingMembers,
    });
  if (awaitingDues > 0)
    actions.push({
      key: "dues",
      label: `${awaitingDues} bukti iuran menunggu verifikasi`,
      href: "/admin/finance/dues",
      count: awaitingDues,
    });
  if (unverifiedTx > 0)
    actions.push({
      key: "tx",
      label: `${unverifiedTx} transaksi belum diverifikasi`,
      href: "/admin/finance/transactions?status=unverified",
      count: unverifiedTx,
    });
  if (openFeedback > 0)
    actions.push({
      key: "feedback",
      label: `${openFeedback} aspirasi belum ditanggapi`,
      href: "/admin/feedback?status=OPEN",
      count: openFeedback,
    });
  if (openBugs > 0)
    actions.push({
      key: "bugs",
      label: `${openBugs} laporan bug belum ditangani`,
      href: "/admin/feedback?category=Bug&status=OPEN",
      count: openBugs,
    });

  const upcomingEvents: UpcomingEvent[] = upcomingRaw.map((e) => {
    const daysUntil = Math.max(0, Math.ceil((e.startDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
    return {
      id: e.id,
      slug: e.slug,
      title: e.title,
      startDate: e.startDate,
      location: e.location,
      daysUntil,
      participantCount: e._count.registrations,
      committeeCount: e._count.committeeApplications,
      committeeOpen: e.committeeOpen,
    };
  });

  const recentActivity: RecentActivity[] = recentLogs.map((l) => ({
    id: l.id,
    at: l.createdAt,
    actorName: l.user?.fullName ?? null,
    description: describe(l.action, l.entity),
  }));

  return {
    actions,
    upcomingEvents,
    finance: {
      balance,
      incomeThisMonth,
      expenseThisMonth,
      incomeLastMonth,
      expenseLastMonth,
      duesPaidThisMonth,
      duesTotalThisMonth,
    },
    recentActivity,
  };
}
