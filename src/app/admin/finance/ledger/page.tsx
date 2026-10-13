import { redirect } from "next/navigation";

/** Laporan ini sekarang ada di Ringkasan kas (tab). Alamat lama tetap berfungsi. */
export default function Page() {
  redirect("/admin/finance?tab=ledger#laporan");
}
