"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

const back = (kind: "error" | "ok", msg: string): never =>
  redirect(`/admin/resources?${kind}=${encodeURIComponent(msg)}`);

const schema = z.object({
  title: z.string().trim().min(3, "Judul minimal 3 karakter").max(150, "Judul maksimal 150 karakter"),
  description: z.string().trim().max(500, "Deskripsi maksimal 500 karakter"),
  category: z.enum(["MODUL", "TEMPLATE", "PANDUAN", "LAINNYA"], { message: "Pilih kategori" }),
  url: z
    .string()
    .trim()
    .max(500)
    .refine((v) => {
      try {
        return new URL(v).protocol === "https:";
      } catch {
        return false;
      }
    }, "Tautan harus diawali https://"),
});

export async function createResourceAction(fd: FormData): Promise<void> {
  const user = await requirePermission("cms:write");
  const parsed = schema.safeParse({
    title: fd.get("title"),
    description: fd.get("description") ?? "",
    category: fd.get("category"),
    url: fd.get("url"),
  });
  if (!parsed.success) return back("error", parsed.error.issues[0].message);

  const d = parsed.data;
  const r = await prisma.resource.create({
    data: { title: d.title, description: d.description || null, category: d.category, url: d.url, createdBy: user.id },
  });
  await prisma.auditLog.create({ data: { userId: user.id, action: "CREATE", entity: "resources", entityId: r.id } });
  revalidatePath("/admin/resources");
  revalidatePath("/dashboard/resources");
  return back("ok", "Materi ditambahkan.");
}

export async function deleteResourceAction(fd: FormData): Promise<void> {
  const user = await requirePermission("cms:write");
  const id = String(fd.get("id") ?? "");
  const found = await prisma.resource.findUnique({ where: { id }, select: { id: true } });
  if (!found) return back("error", "Materi tidak ditemukan.");

  await prisma.resource.delete({ where: { id } });
  await prisma.auditLog.create({ data: { userId: user.id, action: "DELETE", entity: "resources", entityId: id } });
  revalidatePath("/admin/resources");
  revalidatePath("/dashboard/resources");
  return back("ok", "Materi dihapus.");
}
