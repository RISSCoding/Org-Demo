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
          // Solusinya: gunakan findFirst dengan filter ID + organizationId.
          if (["findUnique", "findUniqueOrThrow"].includes(operation)) {
            const uniqueWhere = { ...(args as any).where };
            return (prisma as any)[model].findFirst({
              where: { ...uniqueWhere, organizationId },
              ...args,
            });
          }

          // 5. Update / Delete (single): 
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
