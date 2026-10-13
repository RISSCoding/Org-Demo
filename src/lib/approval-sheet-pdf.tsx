/* eslint-disable jsx-a11y/alt-text */
import { Document, Image, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { inRows } from "@/lib/approval-meta";
import type { SignatureImage } from "@/lib/signatures";

const NAVY = "#0b1f4b";
const GOLD = "#c9a227";
const DOTS = "..............................";

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#0f172a" },
  org: { fontSize: 13, fontFamily: "Helvetica-Bold", color: NAVY },
  sub: { fontSize: 9, color: "#475569", marginTop: 2 },
  rule: { height: 2, backgroundColor: GOLD, marginVertical: 10 },
  title: { fontSize: 16, fontFamily: "Helvetica-Bold", color: NAVY, textAlign: "center", letterSpacing: 1.5 },
  docType: { fontSize: 11, color: "#475569", textAlign: "center", marginTop: 3, marginBottom: 16 },
  infoRow: { flexDirection: "row", paddingVertical: 3 },
  infoKey: { width: 120, color: "#475569" },
  infoVal: { flex: 1, fontFamily: "Helvetica-Bold" },
  lead: { marginTop: 18, marginBottom: 6, color: "#475569" },
  row: { flexDirection: "row", justifyContent: "space-around", marginTop: 14 },
  sign: { width: 220, alignItems: "center" },
  signLabel: { fontSize: 10, textAlign: "center", minHeight: 26 },
  sigBox: { height: 62, width: 190, alignItems: "center", justifyContent: "center" },
  sigImg: { height: 56, width: 180, objectFit: "contain" },
  signName: { borderTopWidth: 1, borderTopColor: NAVY, paddingTop: 3, width: "100%", textAlign: "center", fontFamily: "Helvetica-Bold" },
  note: { fontSize: 8, color: "#64748b", marginTop: 26 },
});

export type ApprovalSheetData = {
  /** "Proposal Kegiatan" / "Laporan Pertanggungjawaban (LPJ)" */
  docLabel: string;
  number: string | null;
  subject: string;
  partyLabel: string;
  party: string;
  activity: string | null;
  dateText: string;
  campusFunds: boolean;
  signers: { label: string; name: string | null; signature: SignatureImage | null }[];
  printedAt: string;
};

function Info({ k, v }: { k: string; v: string }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoKey}>{k}</Text>
      <Text style={s.infoVal}>{v}</Text>
    </View>
  );
}

/**
 * Lembar pengesahan proposal/LPJ. Penandatangan yang gambarnya belum diunggah dibiarkan kosong supaya bisa
 * ditandatangani basah setelah dicetak; nama yang belum ditentukan diganti titik-titik untuk ditulis tangan.
 */
export async function renderApprovalSheetPdf(d: ApprovalSheetData): Promise<Buffer> {
  return renderToBuffer(
    <Document title={`Lembar Pengesahan ${d.number ?? d.subject}`} author="ORG">
      <Page size="A4" style={s.page}>
        <Text style={s.org}>HIMPUNAN MAHASISWA MANAJEMEN</Text>
        <Text style={s.sub}>Universitas Antah Berantah Republik Wakanda</Text>
        <View style={s.rule} />

        <Text style={s.title}>LEMBAR PENGESAHAN</Text>
        <Text style={s.docType}>{d.docLabel}</Text>

        <Info k="Nomor" v={d.number ?? "-"} />
        <Info k="Perihal" v={d.subject} />
        {d.activity ? <Info k="Kegiatan" v={d.activity} /> : null}
        <Info k={d.partyLabel} v={d.party} />
        <Info k="Tanggal" v={d.dateText} />
        <Info k="Dana dari kampus" v={d.campusFunds ? "Ya" : "Tidak"} />

        <Text style={s.lead}>Disahkan oleh:</Text>
        {inRows(d.signers).map((row, i) => (
          <View key={i} style={s.row} wrap={false}>
            {row.map((sg) => (
              <View key={sg.label} style={s.sign}>
                <Text style={s.signLabel}>{sg.label}</Text>
                <View style={s.sigBox}>
                  {sg.signature ? <Image src={{ data: sg.signature.data, format: sg.signature.format }} style={s.sigImg} /> : null}
                </View>
                <Text style={s.signName}>{sg.name ?? DOTS}</Text>
              </View>
            ))}
          </View>
        ))}

        <Text style={s.note}>Dicetak dari sistem ORG pada {d.printedAt}.</Text>
      </Page>
    </Document>,
  );
}
