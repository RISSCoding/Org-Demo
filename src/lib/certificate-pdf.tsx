import { Document, Image, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";

const NAVY = "#0b1f4b";
const GOLD = "#c9a227";

const s = StyleSheet.create({
  page: { padding: 24, backgroundColor: "#ffffff", fontFamily: "Helvetica" },
  outer: { flexGrow: 1, borderWidth: 3, borderColor: NAVY, padding: 6 },
  inner: { flexGrow: 1, borderWidth: 1, borderColor: GOLD, paddingVertical: 22, paddingHorizontal: 40, alignItems: "center" },
  org: { fontSize: 13, fontFamily: "Helvetica-Bold", color: NAVY, letterSpacing: 2 },
  univ: { fontSize: 10, color: "#475569", marginTop: 2 },
  title: { fontSize: 40, fontFamily: "Helvetica-Bold", color: NAVY, letterSpacing: 6, marginTop: 14 },
  number: { fontSize: 9, color: "#64748b", marginTop: 4 },
  label: { fontSize: 11, color: "#475569", marginTop: 16 },
  name: { fontFamily: "Helvetica-Bold", color: NAVY, marginTop: 6, textAlign: "center" },
  rule: { width: 220, height: 2, backgroundColor: GOLD, marginTop: 8 },
  body: { fontSize: 11, color: "#475569", marginTop: 12 },
  event: { fontSize: 18, fontFamily: "Helvetica-Bold", color: NAVY, marginTop: 6, textAlign: "center" },
  meta: { fontSize: 10, color: "#475569", marginTop: 6, textAlign: "center" },
  footer: { marginTop: "auto", width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  qrBox: { alignItems: "flex-start" },
  qrText: { fontSize: 7, color: "#64748b", marginTop: 3 },
  qrUrl: { fontSize: 7, color: NAVY },
  sign: { alignItems: "center", width: 200 },
  signTitle: { fontSize: 10, color: "#475569" },
  signName: { fontSize: 11, fontFamily: "Helvetica-Bold", color: NAVY, borderTopWidth: 1, borderTopColor: NAVY, paddingTop: 3 },
});

export type CertificateData = {
  number: string;
  name: string;
  eventTitle: string;
  dateText: string;
  location: string;
  verifyUrl: string;
  /** Hanya untuk sertifikat panitia, mis. "Ketua Panitia". */
  roleTitle?: string | null;
  /** Penandatangan; bila kosong dipakai CERT_SIGNER_NAME / CERT_SIGNER_TITLE. */
  signer?: { name: string; title: string };
};

export async function renderCertificatePdf(d: CertificateData): Promise<Buffer> {
  const qr = await QRCode.toDataURL(d.verifyUrl, { margin: 1, width: 240, errorCorrectionLevel: "M" });
  const signerName = d.signer?.name ?? process.env.CERT_SIGNER_NAME ?? "Ketua Umum";
  const signerTitle = d.signer?.title ?? process.env.CERT_SIGNER_TITLE ?? "Ketua Umum HIMMAN UKRI";

  return renderToBuffer(
    <Document title={`Sertifikat ${d.number}`} author="HIMMAN UKRI">
      <Page size="A4" orientation="landscape" style={s.page}>
        <View style={s.outer}>
          <View style={s.inner}>
            <Text style={s.org}>HIMPUNAN MAHASISWA MANAJEMEN</Text>
            <Text style={s.univ}>Universitas Kebangsaan Republik Indonesia</Text>
            <Text style={s.title}>SERTIFIKAT</Text>
            <Text style={s.number}>Nomor: {d.number}</Text>
            <Text style={s.label}>diberikan kepada</Text>
            <Text style={[s.name, { fontSize: d.name.length > 34 ? 22 : 32 }]}>{d.name}</Text>
            <View style={s.rule} />
            {d.roleTitle ? (
              <>
                <Text style={s.body}>atas dedikasi dan kontribusinya sebagai</Text>
                <Text style={[s.event, { fontSize: 16, marginTop: 4 }]}>{d.roleTitle}</Text>
                <Text style={[s.body, { marginTop: 6 }]}>dalam kegiatan</Text>
              </>
            ) : (
              <Text style={s.body}>atas partisipasinya sebagai peserta dalam kegiatan</Text>
            )}
            <Text style={s.event}>{d.eventTitle}</Text>
            <Text style={s.meta}>
              {d.dateText} · {d.location}
            </Text>
            <View style={s.footer}>
              <View style={s.qrBox}>
                <Image src={qr} style={{ width: 70, height: 70 }} />
                <Text style={s.qrText}>Verifikasi keaslian sertifikat:</Text>
                <Text style={s.qrUrl}>{d.verifyUrl}</Text>
              </View>
              <View style={s.sign}>
                <Text style={s.signTitle}>{signerTitle}</Text>
                <View style={{ height: 42 }} />
                <Text style={s.signName}>{signerName}</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>,
  );
}
