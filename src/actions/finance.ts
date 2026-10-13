"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { parseWIB } from "@/lib/datetime";
import { CATEGORY_LABEL, MONTH_RE, monthLabel } from "@/lib/finance";
import { writeJournals } from "@/lib/finance-journal";
import { prisma } from "@/lib/prisma";
import { saveProofImage } from "@/lib/private-files";
import { requirePermission } from "@/lib/rbac";
import { UploadError } from "@/lib/storage";
import type { FormState } from "@/types/forms";

function refresh() {
  revalidatePath("/admin", "layout");
  revalidatePath("/admin/finance", "layout");
  revalidatePath("/dashboard/finance");
  revalidatePath("/dashboard/dues");
}

const txSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.enum(Object.keys(CATEGORY_LABEL) as [keyof typeof CATEGORY_LABEL, ...(keyof typeof CATEGORY_LABEL)[]]),
  title: z.string().trim().min(3, "Minimal 3 karakter").max(150),
  amount: z.number("Isi jumlah").int("Harus bilangan bulat").min(1, "Minimal Rp1").max(10_000_000_000),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid"),
  note: z.string().trim().max(500).optional(),
});

export async function addTransactionAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requirePermission("finance:write");
  const note = String(fd.get("note") ?? "").trim();
  const parsed = txSchema.safeParse({
    type: fd.get("type"),
    category: fd.get("category"),
    title: fd.get("title"),
    amount: fd.get("amount") === "" ? undefined : Number(fd.get("amount")),
    date: fd.get("date"),
    note: note || undefined,
  });
  if (!parsed.success) {
    return { error: "Periksa kembali isian formulir.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;

  let proofUrl: string | undefined;
  const proof = fd.get("proof");
  if (proof instanceof File && proof.size > 0) {
    try {
      proofUrl = await saveProofImage(proof);
    } catch (e) {
      if (e instanceof UploadError) return { error: "Bukti gagal diunggah.", fieldErrors: { proof: [e.message] } };
      throw e;
    }
  }

  // Transaksi, jurnalnya, dan catatan audit disimpan sekaligus: tidak ada transaksi tanpa jurnal.
  await prisma.$transaction(async (db) => {
    const tx = await db.financialTransaction.create({
      data: {
        type: d.type,
        category: d.category,
        title: d.title,
        amount: d.amount,
        date: parseWIB(`${d.date}T12:00`),
        note: d.note,
        proofOfPaymentUrl: proofUrl,
        createdBy: user.id,
      },
    });
    await writeJournals(db, [tx]);
    await db.auditLog.create({
      data: { userId: user.id, action: "CREATE", entity: "financial_transactions", entityId: tx.id },
    });
  });
  refresh();
  redirect("/admin/finance/transactions?flash=tx-saved");
}

/** Four-eyes rule: you can't verify what you entered yourself (SUPER_ADMIN excepted). */
export async function verifyTransaction(fd: FormData): Promise<void> {
  const user = await requirePermission("finance:write");
  const id = String(fd.get("id") ?? "");
  const tx = await prisma.financialTransaction.findUnique({ where: { id } });
  if (!tx || tx.verifiedBy) return;
  if (tx.createdBy === user.id && user.role !== "SUPER_ADMIN") return;

  await prisma.financialTransaction.update({
    where: { id },
    data: { verifiedBy: user.id, verifiedAt: new Date() },
  });
  await prisma.auditLog.create({
    data: { userId: user.id, action: "VERIFY", entity: "financial_transactions", entityId: id },
  });
  refresh();
}

/** Only unverified, hand-entered transactions can be deleted (by the creator or SUPER_ADMIN). */
export async function deleteTransaction(fd: FormData): Promise<void> {
  const user = await requirePermission("finance:write");
  const id = String(fd.get("id") ?? "");
  const tx = await prisma.financialTransaction.findUnique({
    where: { id },
    include: { _count: { select: { dues: true } } },
  });
  if (!tx || tx.verifiedBy || tx._count.dues > 0) return;
  if (tx.createdBy !== user.id && user.role !== "SUPER_ADMIN") return;

  await prisma.financialTransaction.delete({ where: { id } });
  await prisma.auditLog.create({
    data: { userId: user.id, action: "DELETE", entity: "financial_transactions", entityId: id, meta: { title: tx.title } },
  });
  refresh();
}

// ---------------- dues ----------------

const generateSchema = z.object({
  month: z.string().regex(MONTH_RE, "Bulan tidak valid"),
  amount: z.number("Isi nominal").int().min(1000, "Minimal Rp1.000").max(10_000_000),
});

export async function generateDuesAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requirePermission("finance:write");
  const parsed = generateSchema.safeParse({
    month: fd.get("month"),
    amount: fd.get("amount") === "" ? undefined : Number(fd.get("amount")),
  });
  if (!parsed.success) {
    return { error: "Periksa kembali isian.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { month, amount } = parsed.data;

  const members = await prisma.member.findMany({
    where: { status: "ACTIVE", user: { approvalStatus: "APPROVED" } },
    select: { userId: true },
  });
  const res = await prisma.memberDues.createMany({
    data: members.map((m) => ({ userId: m.userId, monthYear: month, amount })),
    skipDuplicates: true,
  });
  await prisma.appSetting.upsert({
    where: { key: "dues_amount" },
    create: { key: "dues_amount", value: String(amount) },
    update: { value: String(amount) },
  });
  await prisma.auditLog.create({
    data: { userId: user.id, action: "GENERATE_DUES", entity: "member_dues", meta: { month, amount, created: res.count } },
  });
  refresh();
  const existed = members.length - res.count;
  return { success: `${res.count} tagihan ${monthLabel(month)} dibuat${existed > 0 ? ` (${existed} sudah ada)` : ""}.` };
}

/** Approves a member's proof, or records a cash payment when there is no proof. */
export async function approveDues(fd: FormData): Promise<void> {
  const user = await requirePermission("finance:write");
  const id = String(fd.get("id") ?? "");
  const dues = await prisma.memberDues.findUnique({
    where: { id },
    include: { user: { select: { fullName: true, nim: true } } },
  });
  if (!dues || dues.status === "PAID") return;

  const now = new Date();
  await prisma.$transaction(async (tx) => {
    const t = await tx.financialTransaction.create({
      data: {
        type: "INCOME",
        category: "DUES",
        title: `Iuran kas ${monthLabel(dues.monthYear)}`, // no member name: this title is visible in the member-facing summary
        note: `${dues.user.fullName} (${dues.user.nim})${dues.proofUrl ? "" : " — tunai"}`,
        amount: dues.amount,
        date: now,
        proofOfPaymentUrl: dues.proofUrl,
        createdBy: user.id,
        verifiedBy: user.id,
        verifiedAt: now,
      },
    });
    await writeJournals(tx, [t]);
    await tx.memberDues.update({
      where: { id },
      data: { status: "PAID", paidAt: now, transactionId: t.id },
    });
    await tx.auditLog.create({
      data: { userId: user.id, action: "APPROVE_DUES", entity: "member_dues", entityId: id },
    });
  });
  refresh();
}

export async function rejectDues(fd: FormData): Promise<void> {
  const user = await requirePermission("finance:write");
  const id = String(fd.get("id") ?? "");
  const dues = await prisma.memberDues.findUnique({ where: { id } });
  if (!dues || dues.status === "PAID" || !dues.proofUrl) return;

  await prisma.memberDues.update({ where: { id }, data: { proofUrl: null, submittedAt: null } });
  await prisma.auditLog.create({
    data: { userId: user.id, action: "REJECT_DUES_PROOF", entity: "member_dues", entityId: id },
  });
  refresh();
}
