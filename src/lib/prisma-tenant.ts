import { prisma } from "@/lib/prisma";

/**
 * Prisma Client Extension untuk Multi-Tenant.
 * Membungkus semua operasi database dan otomatis menyuntikkan `organizationId`.
 */
export function getTenantPrisma(organizationId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const modelsWithTenant = [
            "User", "Division", "Member", "Event", "EventRegistration",
            "CommitteeDivision", "CommitteeApplication", "CommitteeMeeting",
            "Certificate", "FinancialTransaction", "MemberDues", "OfficialLetter",
            "LetterCounter", "CmsPost", "Feedback", "AuditLog", "AppSetting",
            "Resource", "OrgOfficer", "Notification", "NotificationPreference",
            "NotificationConsent", "PasswordResetToken"
          ];

          // Model global (Role, Permission, Organization) tidak difilter
          if (!modelsWithTenant.includes(model)) {
            return query(args);
          }

          // 1. Baca (findMany, findFirst, count, aggregate)
          if (["findMany", "findFirst", "findFirstOrThrow", "count", "aggregate", "groupBy"].includes(operation)) {
            (args as any).where = { ...(args as any).where, organizationId };
          }

          // 2. Update/Delete Massal
          if (["updateMany", "deleteMany"].includes(operation)) {
            (args as any).where = { ...(args as any).where, organizationId };
          }

          // 3. Create (Sisipkan organizationId otomatis)
          if (["create"].includes(operation)) {
            (args as any).data = { ...(args as any).data, organizationId };
          }
          if (["createMany"].includes(operation)) {
            if (Array.isArray((args as any).data)) {
              (args as any).data = (args as any).data.map((d: any) => ({ ...d, organizationId }));
            } else {
              (args as any).data = { ...(args as any).data, organizationId };
            }
          }

          // 4. findUnique / findUniqueOrThrow:
          // Prisma tidak mengizinkan filter non-unique (organizationId) di findUnique.
          // Solusinya: konversi ke findFirst/findFirstOrThrow dengan filter ID + organizationId.
          // Spread `args` LEBIH DULU, lalu timpa `where` — bila urutannya dibalik, `args.where`
          // menimpa `organizationId` dan filter isolasi hilang.
          if (operation === "findUnique" || operation === "findUniqueOrThrow") {
            const where = (args as any).where;
            // Composite key yang memuat organizationId (mis. app_settings PK
            // [organizationId, key], letter_counters PK [organizationId, year, type]):
            // pemanggil sudah eksplisit menentukan tenant, biarkan lewat.
            if (Object.keys(where).some((k) => k.startsWith("organizationId_"))) {
              return query(args);
            }
            const newWhere = { ...where, organizationId };
            const finder = operation === "findUnique" ? "findFirst" : "findFirstOrThrow";
            return (prisma as any)[model][finder]({ ...args, where: newWhere });
          }

          // 5. Upsert: Prisma meng-upsert pada unique field yang bisa saja milik org lain,
          // sehingga tanpa guard ia bisa menimpa baris tenant lain. Cek dulu apakah baris
          // dengan where + organizationId sudah ada; jika ya → jalankan update (aman);
          // jika tidak → jalankan create. Kolisi dengan org lain akan memicu P2002 dari
          // unique constraint, yang justru benar (menolak menimpa baris orang lain).
          if (operation === "upsert") {
            const upsertArgs = args as any;
            // Composite key yang memuat organizationId: pemanggil sudah eksplisit.
            if (Object.keys(upsertArgs.where).some((k) => k.startsWith("organizationId_"))) {
              return query(args);
            }
            const existing = await (prisma as any)[model].findFirst({
              where: { ...upsertArgs.where, organizationId },
              select: { id: true },
            });
            if (existing) {
              return query(args);
            }
            const createArgs: any = { data: { ...upsertArgs.create, organizationId } };
            if (upsertArgs.select) createArgs.select = upsertArgs.select;
            if (upsertArgs.include) createArgs.include = upsertArgs.include;
            if (upsertArgs.omit) createArgs.omit = upsertArgs.omit;
            return (prisma as any)[model].create(createArgs);
          }

          // 6. Update / Delete (single): 
          // Pastikan data milik org ini sebelum update/delete.
          if (["update", "delete"].includes(operation)) {
            const uniqueWhere = { ...(args as any).where };
            const existing = await (prisma as any)[model].findFirst({
              where: { ...uniqueWhere, organizationId },
              select: { id: true },
            });
            if (!existing) {
              throw new Error(`Data ${model} tidak ditemukan atau bukan milik organisasi Anda.`);
            }
            return query(args);
          }

          return query(args);
        },
      },
    },
  });
}
