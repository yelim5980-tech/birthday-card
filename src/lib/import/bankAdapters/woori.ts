import Papa from "papaparse";

export interface ParsedTransaction {
  transactionDate: string; // YYYY-MM-DD
  merchantName: string;
  amount: number; // KRW
  currency: string;
  exchangeRate: number | null;
  amountKrw: number;
  rawData: Record<string, string>;
}

export interface ParseResult {
  transactions: ParsedTransaction[];
  errors: string[];
  cardNumberLast4: string | null;
}

// 우리카드 이용대금명세서 CSV — EUC-KR 또는 UTF-8, 여러 헤더 행 포함
// 컬럼 예: 이용일자, 이용가맹점, 기간, 회차, 이용금액, 청구금액(원화), 수수료, 혜택, 납부하실금액
const DATE_KEYS = ["이용일자", "결제일자", "거래일자", "날짜"];
const MERCHANT_KEYS = ["이용가맹점", "가맹점명", "거래처", "사용처"];
const AMOUNT_KEYS = ["이용금액", "거래금액", "결제금액"];
const KRW_KEYS = ["청구금액(원화)", "원화금액", "청구금액", "납부하실금액"];
const CURRENCY_KEYS = ["통화", "이용통화", "외화통화"];

function findKey(headers: string[], candidates: string[]): string | null {
  for (const c of candidates) {
    const found = headers.find((h) => h.trim().includes(c));
    if (found) return found;
  }
  return null;
}

function parseDate(raw: string): string | null {
  const cleaned = raw.replace(/\./g, "-").replace(/\//g, "-").trim();
  // YYYY-MM-DD or YYYYMMDD
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(cleaned);
  if (iso) return cleaned;
  const compact = /^(\d{4})(\d{2})(\d{2})$/.exec(cleaned.replace(/-/g, ""));
  if (compact) return `${compact[1]}-${compact[2]}-${compact[3]}`;
  return null;
}

function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/,/g, "").replace(/\s/g, "").trim();
  if (!cleaned || cleaned === "-" || cleaned === "") return null;
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : Math.abs(n);
}

export function parseWooriCsv(csvText: string): ParseResult {
  const errors: string[] = [];
  const transactions: ParsedTransaction[] = [];
  let cardNumberLast4: string | null = null;

  // Try to extract card number from header section
  const cardMatch = csvText.match(/(\d{4}[-\s]?\*{4}[-\s]?\*{4}[-\s]?(\d{4}))/);
  if (cardMatch) cardNumberLast4 = cardMatch[2];

  // Find the row where transaction headers start — look for 이용일자 row
  const lines = csvText.split("\n");
  let headerRowIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("이용일자") || lines[i].includes("결제일자") || lines[i].includes("거래일자")) {
      headerRowIdx = i;
      break;
    }
  }

  if (headerRowIdx === -1) {
    // Fallback: just try parsing from row 0
    headerRowIdx = 0;
  }

  const dataSection = lines.slice(headerRowIdx).join("\n");

  const result = Papa.parse<Record<string, string>>(dataSection, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  if (result.errors.length > 0 && result.data.length === 0) {
    errors.push("CSV 파싱 오류: " + result.errors[0].message);
    return { transactions, errors, cardNumberLast4 };
  }

  const headers = result.meta.fields ?? [];
  const dateKey = findKey(headers, DATE_KEYS);
  const merchantKey = findKey(headers, MERCHANT_KEYS);
  const amountKey = findKey(headers, AMOUNT_KEYS);
  const krwKey = findKey(headers, KRW_KEYS);
  const currencyKey = findKey(headers, CURRENCY_KEYS);

  if (!dateKey) errors.push("이용일자 컬럼을 찾을 수 없습니다.");
  if (!merchantKey) errors.push("이용가맹점 컬럼을 찾을 수 없습니다.");
  if (!amountKey && !krwKey) errors.push("이용금액 컬럼을 찾을 수 없습니다.");

  if (!dateKey || !merchantKey || (!amountKey && !krwKey)) {
    return { transactions, errors, cardNumberLast4 };
  }

  for (let i = 0; i < result.data.length; i++) {
    const row = result.data[i];
    const rawDate = row[dateKey!]?.trim() ?? "";
    const rawMerchant = row[merchantKey!]?.trim() ?? "";

    if (!rawDate || !rawMerchant) continue;

    const transactionDate = parseDate(rawDate);
    if (!transactionDate) {
      errors.push(`행 ${headerRowIdx + i + 2}: 날짜 형식 오류 (${rawDate})`);
      continue;
    }

    const rawAmountStr = (amountKey ? row[amountKey] : null) ?? "";
    const rawKrwStr = (krwKey ? row[krwKey] : null) ?? "";
    const currency = currencyKey ? (row[currencyKey]?.trim() || "KRW") : "KRW";

    const rawAmount = parseAmount(rawAmountStr);
    const rawKrw = parseAmount(rawKrwStr);

    if (rawAmount === null && rawKrw === null) {
      errors.push(`행 ${headerRowIdx + i + 2}: 금액 파싱 실패 (${rawAmountStr || rawKrwStr})`);
      continue;
    }

    const amountKrw = rawKrw ?? rawAmount!;
    const amount = rawAmount ?? rawKrw!;

    let exchangeRate: number | null = null;
    if (currency !== "KRW" && amount > 0 && amountKrw > 0) {
      exchangeRate = amountKrw / amount;
    }

    transactions.push({
      transactionDate,
      merchantName: rawMerchant,
      amount,
      currency,
      exchangeRate,
      amountKrw,
      rawData: row,
    });
  }

  return { transactions, errors, cardNumberLast4 };
}
