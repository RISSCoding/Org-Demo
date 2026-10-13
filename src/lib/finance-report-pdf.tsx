import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { formatDate } from "@/lib/datetime";
import { CATEGORY_LABEL, rupiah } from "@/lib/finance";
import type { MonthlyReport } from "@/lib/finance-report";

const NAVY = "#0b1f4b";
const GOLD = "#c9a227";

const s = StyleSheet.create({
  page: { padding: 36, fontSize: 9, fontFamily: "Helvetica", color: "#0f172a" },
  org: { fontSize: 13, fontFamily: "Helvetica-Bold", color: NAVY },
  sub: { fontSize: 9, color: "#475569", marginTop: 2 },
  rule: { height: 2, backgroundColor: GOLD, marginVertical: 10 },
  title: { fontSize: 14, fontFamily: "Helvetica-Bold", color: NAVY },
  period: { fontSize: 10, color: "#475569", marginBottom: 10 },
  sumRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3, borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0" },
  bold: { fontFamily: "Helvetica-Bold" },
  th: { flexDirection: "row", backgroundColor: NAVY, color: "#ffffff", paddingVertical: 5, paddingHorizontal: 4, fontFamily: "Helvetica-Bold", marginTop: 14 },
  tr: { flexDirection: "row", paddingVertical: 4, paddingHorizontal: 4, borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0" },
  tf: { flexDirection: "row", paddingVertical: 5, paddingHorizontal: 4, fontFamily: "Helvetica-Bold", backgroundColor: "#f1f5f9" },
  cNo: { width: "6%" },
  cDate: { width: "15%" },
  cTitle: { width: "33%" },
  cCat: { width: "14%" },
  cIn: { width: "16%", textAlign: "right" },
  cOut: { width: "16%", textAlign: "right" },
  note: { fontSize: 8, color: "#64748b", marginTop: 8 },
  signs: { flexDirection: "row", justifyContent: "space-around", marginTop: 36 },
  sign: { width: 160, alignItems: "center" },
  signLine: { borderTopWidth: 1, borderTopColor: NAVY, paddingTop: 3, width: "100%", textAlign: "center", marginTop: 46 },
});

export async function renderFinanceReportPdf(r: MonthlyReport): Promise<Buffer> {
  const ketua = process.env.CERT_SIGNER_NAME ?? "..............................";
  const bendahara = process.env.FINANCE_TREASURER_NAME ?? "..............................";

  return renderToBuffer(
    <Document title={`Laporan Keuangan ${r.label}`} author="HIMMAN UKRI">
      <Page size="A4" style={s.page}>
        <Text style={s.org}>HIMPUNAN MAHASISWA MANAJEMEN</Text>
        <Text style={s.sub}>Universitas Kebangsaan Republik Indonesia</Text>
        <View style={s.rule} />
        <Text style={s.title}>Laporan Keuangan</Text>
        <Text style={s.period}>Periode {r.label}</Text>

        <View>
          <View style={s.sumRow}><Text>Saldo awal</Text><Text>{rupiah(r.opening)}</Text></View>
          <View style={s.sumRow}><Text>Total pemasukan</Text><Text>{rupiah(r.income)}</Text></View>
          <View style={s.sumRow}><Text>Total pengeluaran</Text><Text>{rupiah(r.expense)}</Text></View>
          <View style={s.sumRow}><Text style={s.bold}>Saldo akhir</Text><Text style={s.bold}>{rupiah(r.closing)}</Text></View>
          <View style={s.sumRow}>
            <Text>Iuran kas bulan ini</Text>
            <Text>{r.dues.paid} lunas · {r.dues.pending + r.dues.overdue} belum bayar</Text>
          </View>
        </View>

        <View style={s.th}>
          <Text style={s.cNo}>No</Text>
          <Text style={s.cDate}>Tanggal</Text>
          <Text style={s.cTitle}>Uraian</Text>
          <Text style={s.cCat}>Kategori</Text>
          <Text style={s.cIn}>Pemasukan</Text>
          <Text style={s.cOut}>Pengeluaran</Text>
        </View>
        {r.rows.length === 0 && (
          <View style={s.tr}><Text>Tidak ada transaksi terverifikasi pada periode ini.</Text></View>
        )}
        {r.rows.map((row, i) => (
          <View key={i} style={s.tr} wrap={false}>
            <Text style={s.cNo}>{i + 1}</Text>
            <Text style={s.cDate}>{formatDate(row.date)}</Text>
            <Text style={s.cTitle}>{row.title}</Text>
            <Text style={s.cCat}>{CATEGORY_LABEL[row.category]}</Text>
            <Text style={s.cIn}>{row.income ? rupiah(row.income) : "-"}</Text>
            <Text style={s.cOut}>{row.expense ? rupiah(row.expense) : "-"}</Text>
          </View>
        ))}
        <View style={s.tf} wrap={false}>
          <Text style={{ width: "68%" }}>Total</Text>
          <Text style={s.cIn}>{rupiah(r.income)}</Text>
          <Text style={s.cOut}>{rupiah(r.expense)}</Text>
        </View>

        {r.unverifiedExcluded > 0 && (
          <Text style={s.note}>
            Catatan: {r.unverifiedExcluded} transaksi periode ini belum diverifikasi dan tidak dimasukkan ke laporan.
          </Text>
        )}

        <View style={s.signs} wrap={false}>
          <View style={s.sign}>
            <Text>Bendahara</Text>
            <Text style={s.signLine}>{bendahara}</Text>
          </View>
          <View style={s.sign}>
            <Text>Ketua Umum</Text>
            <Text style={s.signLine}>{ketua}</Text>
          </View>
        </View>
      </Page>
    </Document>,
  );
}
