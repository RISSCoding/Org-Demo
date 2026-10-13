/**
 * Menyeragamkan nomor KTA anggota lama ke format AD Pasal 5 (mis. 2025 + NIM ...207 → 025207).
 *   npx tsx prisma/regenerate-kta.ts           # dry-run: hanya menampilkan rencana
 *   npx tsx prisma/regenerate-kta.ts --apply   # menerapkan
 * QR KTA memakai NPM, bukan nomor KTA, jadi kartu yang sudah dicetak tetap valid.
 */
import { PrismaClient } from "@prisma/client";
import { ktaBase } from "../src/lib/kta";

const prisma = new PrismaClient();
const apply = process.argv.includes("--apply");

async function main() {
  const members = await prisma.member.findMany({
    select: { id: true, ktaNumber: true, user: { select: { fullName: true, nim: true, batchYear: true } } },
    orderBy: { user: { createdAt: "asc" } },
  });

  const used = new Set<string>();
  const plan = members.map((m) => {
    const base = ktaBase(m.user.nim, m.user.batchYear);
    let to = base;
    for (let i = 2; used.has(to); i++) to = `${base}-${i}`;
    used.add(to);
    return { id: m.id, nama: m.user.fullName, dari: m.ktaNumber, ke: to, bentrok: to !== base };
  });

  const changes = plan.filter((p) => p.dari !== p.ke);
  console.table(changes.map((p) => ({ nama: p.nama, dari: p.dari, ke: p.ke, bentrok: p.bentrok })));
  console.log(`${changes.length} dari ${plan.length} nomor berubah; ${plan.filter((p) => p.bentrok).length} diberi akhiran karena bentrok.`);
  if (!apply) return console.log("Dry-run. Jalankan lagi dengan --apply untuk menerapkan.");

  // Dua tahap supaya batas unik tidak terlanggar di tengah jalan.
  await prisma.$transaction([
    ...changes.map((p) => prisma.member.update({ where: { id: p.id }, data: { ktaNumber: `TMP-${p.id}` } })),
    ...changes.map((p) => prisma.member.update({ where: { id: p.id }, data: { ktaNumber: p.ke } })),
  ]);
  console.log("Selesai.");
}

main().finally(() => prisma.$disconnect());
