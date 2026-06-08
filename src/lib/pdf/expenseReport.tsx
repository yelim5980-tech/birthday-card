import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  Font,
  StyleSheet,
} from "@react-pdf/renderer";
import path from "path";

// Register Korean font
Font.register({
  family: "NanumGothic",
  src: path.join(process.cwd(), "public", "NanumGothic.ttf"),
});

Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    fontFamily: "NanumGothic",
    fontSize: 9,
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
    color: "#000",
  },
  title: {
    fontSize: 16,
    fontFamily: "NanumGothic",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 8,
    textAlign: "center",
    marginBottom: 18,
    color: "#555",
  },
  table: {
    border: "1pt solid #000",
  },
  row: {
    flexDirection: "row",
    borderBottom: "1pt solid #000",
  },
  rowLast: {
    flexDirection: "row",
  },
  labelCell: {
    width: 90,
    backgroundColor: "#f0f0f0",
    padding: "5 6",
    borderRight: "1pt solid #000",
    fontFamily: "NanumGothic",
    fontSize: 8,
  },
  valueCell: {
    flex: 1,
    padding: "5 6",
    fontFamily: "NanumGothic",
    fontSize: 9,
  },
  // Inner table (line items)
  innerTable: {
    width: "100%",
  },
  innerHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottom: "0.5pt solid #000",
  },
  innerRow: {
    flexDirection: "row",
    borderBottom: "0.5pt solid #aaa",
  },
  innerRowLast: {
    flexDirection: "row",
  },
  innerCell: {
    flex: 1,
    padding: "3 4",
    textAlign: "center",
    fontSize: 8,
    borderRight: "0.5pt solid #aaa",
  },
  innerCellLast: {
    flex: 1,
    padding: "3 4",
    textAlign: "center",
    fontSize: 8,
  },
  innerCellWide: {
    flex: 2,
    padding: "3 4",
    textAlign: "center",
    fontSize: 8,
    borderRight: "0.5pt solid #aaa",
  },
  totalRow: {
    flexDirection: "row",
    borderTop: "1pt solid #000",
    backgroundColor: "#f8f8f8",
  },
  totalLabel: {
    flex: 3,
    padding: "4 6",
    textAlign: "right",
    fontSize: 9,
    fontFamily: "NanumGothic",
    borderRight: "0.5pt solid #aaa",
  },
  totalValue: {
    flex: 1,
    padding: "4 6",
    textAlign: "right",
    fontSize: 9,
    fontFamily: "NanumGothic",
  },
  signatureSection: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    gap: 8,
  },
  signatureDate: {
    fontSize: 9,
    marginBottom: 16,
    textAlign: "center",
  },
  signatureLine: {
    borderBottom: "1pt solid #000",
    width: 150,
    textAlign: "right",
    paddingRight: 4,
    fontSize: 9,
    marginBottom: 2,
  },
  sectionLabel: {
    fontSize: 8,
    color: "#555",
    marginTop: 2,
    textAlign: "right",
  },
  receiptSection: {
    marginTop: 16,
    borderTop: "1pt solid #ccc",
    paddingTop: 10,
  },
  receiptTitle: {
    fontSize: 9,
    marginBottom: 8,
    color: "#444",
  },
  receiptGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  receiptImage: {
    width: 160,
    height: 110,
    objectFit: "contain",
    border: "0.5pt solid #ccc",
  },
  headerMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    fontSize: 8,
    color: "#555",
  },
  programInfo: {
    marginBottom: 10,
    padding: "5 6",
    border: "0.5pt solid #ccc",
    backgroundColor: "#fafafa",
  },
  programInfoRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  programInfoLabel: {
    width: 70,
    fontSize: 8,
    color: "#666",
  },
  programInfoValue: {
    flex: 1,
    fontSize: 8,
  },
});

function formatKrwPdf(amount: number): string {
  return new Intl.NumberFormat("ko-KR").format(amount) + "원";
}

export interface ExpenseReportPdfProps {
  programName: string;
  companyName: string;
  representativeName: string;
  purchaseDate: string;
  deliveryDate: string;
  productName: string;
  purchaseReason: string;
  bimok: string;
  semok: string;
  items: Array<{
    itemName: string;
    unitPrice: number;
    quantity: number;
    totalExclVat: number;
    period?: string;
  }>;
  totalExclVat: number;
  receiptImageUrls?: string[];
  createdDate: string;
}

export function ExpenseReportPdf({
  programName,
  companyName,
  representativeName,
  purchaseDate,
  deliveryDate,
  productName,
  purchaseReason,
  bimok,
  semok,
  items,
  totalExclVat,
  receiptImageUrls = [],
  createdDate,
}: ExpenseReportPdfProps) {
  return (
    <Document
      title="사업비 사용내역서"
      author={companyName}
      language="ko"
    >
      <Page size="A4" style={styles.page}>
        {/* Title */}
        <Text style={styles.title}>사업비 사용내역서</Text>
        <Text style={styles.subtitle}>
          ※ 본 서류는 중소벤처기업부 청년창업사관학교 사업비 집행 양식입니다.
        </Text>

        {/* Program info */}
        <View style={styles.programInfo}>
          <View style={styles.programInfoRow}>
            <Text style={styles.programInfoLabel}>지원사업명</Text>
            <Text style={styles.programInfoValue}>{programName}</Text>
          </View>
          <View style={styles.programInfoRow}>
            <Text style={styles.programInfoLabel}>참여기업명</Text>
            <Text style={styles.programInfoValue}>{companyName}</Text>
          </View>
        </View>

        {/* Main table */}
        <View style={styles.table}>
          {/* Row: 구매일자 / 납품일자 */}
          <View style={styles.row}>
            <Text style={[styles.labelCell, { width: 90 }]}>구매일자</Text>
            <Text style={[styles.valueCell, { flex: 1 }]}>{purchaseDate}</Text>
            <Text style={[styles.labelCell, { width: 70, borderLeft: "1pt solid #000" }]}>납품일자</Text>
            <Text style={[styles.valueCell, { flex: 1, borderLeft: "none" }]}>{deliveryDate}</Text>
          </View>

          {/* Row: 제품명 */}
          <View style={styles.row}>
            <Text style={styles.labelCell}>제품명</Text>
            <Text style={styles.valueCell}>{productName}</Text>
          </View>

          {/* Row: 구매사유 */}
          <View style={styles.row}>
            <Text style={styles.labelCell}>구매사유</Text>
            <Text style={styles.valueCell}>{purchaseReason}</Text>
          </View>

          {/* Row: 비목/세목 */}
          <View style={styles.row}>
            <Text style={styles.labelCell}>비목/세목</Text>
            <Text style={styles.valueCell}>{bimok} / {semok}</Text>
          </View>

          {/* Row: 세부내역 */}
          <View style={styles.row}>
            <Text style={[styles.labelCell, { paddingTop: 5 }]}>세부내역</Text>
            <View style={[styles.valueCell, { padding: 0 }]}>
              {/* Inner header */}
              <View style={styles.innerHeaderRow}>
                <Text style={[styles.innerCellWide, { fontFamily: "NanumGothic" }]}>종류</Text>
                <Text style={[styles.innerCell, { fontFamily: "NanumGothic" }]}>단가(VAT제외)</Text>
                <Text style={[styles.innerCell, { fontFamily: "NanumGothic" }]}>수량</Text>
                <Text style={[styles.innerCellLast, { fontFamily: "NanumGothic" }]}>합계(VAT제외)</Text>
              </View>
              {/* Items */}
              {items.map((item, idx) => (
                <View
                  key={idx}
                  style={idx < items.length - 1 ? styles.innerRow : styles.innerRowLast}
                >
                  <Text style={styles.innerCellWide}>
                    {item.itemName}{item.period ? ` (${item.period})` : ""}
                  </Text>
                  <Text style={styles.innerCell}>{formatKrwPdf(item.unitPrice)}</Text>
                  <Text style={styles.innerCell}>{item.quantity}</Text>
                  <Text style={styles.innerCellLast}>{formatKrwPdf(item.totalExclVat)}</Text>
                </View>
              ))}
              {/* Total row */}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>합계 (VAT 제외)</Text>
                <Text style={styles.totalValue}>{formatKrwPdf(totalExclVat)}</Text>
              </View>
            </View>
          </View>

          {/* Row: 총계 */}
          <View style={styles.rowLast}>
            <Text style={styles.labelCell}>총계(VAT제외)</Text>
            <Text style={[styles.valueCell, { fontFamily: "NanumGothic", fontSize: 11 }]}>
              일금 {formatKrwPdf(totalExclVat)}
            </Text>
          </View>
        </View>

        {/* Signature section */}
        <View style={styles.signatureSection}>
          <View>
            <Text style={styles.signatureDate}>{createdDate}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={{ fontSize: 9 }}>대표자: {representativeName}</Text>
              <View
                style={{
                  width: 60,
                  height: 60,
                  border: "1pt solid #ccc",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: 8,
                }}
              >
                <Text style={{ fontSize: 7, color: "#bbb" }}>(인)</Text>
              </View>
            </View>
            <Text style={{ fontSize: 7, color: "#888", marginTop: 2 }}>
              회사명: {companyName}
            </Text>
          </View>
        </View>

        {/* Receipt images */}
        {receiptImageUrls.length > 0 && (
          <View style={styles.receiptSection}>
            <Text style={styles.receiptTitle}>◎ 증빙 자료</Text>
            <View style={styles.receiptGrid}>
              {receiptImageUrls.map((url, i) => (
                <Image key={i} src={url} style={styles.receiptImage} />
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}
