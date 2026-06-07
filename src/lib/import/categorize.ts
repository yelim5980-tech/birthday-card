import {
  KOSME_CATEGORIES,
  KosmeCategory,
  findCategoryByKeyword,
  findCategoryByMcc,
  getParentCategory,
  isMonthlyLicense,
} from "@/lib/kosme/categories";
import { calcSubsidySplit } from "@/lib/vat";

export interface CategorizedTransaction {
  merchantName: string;
  transactionDate: string;
  amount: number;
  currency: string;
  exchangeRate: number | null;
  amountKrw: number;
  amountExclVat: number;
  vatAmount: number;
  semok: KosmeCategory | null;
  bimok: KosmeCategory | null;
  isSubsidyEligible: boolean;
  canSkipExpenseReport: boolean;
  isMonthlyLicense: boolean;
}

export function categorizeTransaction(
  merchantName: string,
  amountKrw: number,
  transactionDate: string,
  currency: string,
  exchangeRate: number | null,
  mccCode?: string,
): CategorizedTransaction {
  const { amountExclVat, vatAmount } = calcSubsidySplit(amountKrw);

  let semok: KosmeCategory | null = null;

  if (mccCode) {
    semok = findCategoryByMcc(mccCode);
  }

  if (!semok) {
    semok = findCategoryByKeyword(merchantName);
  }

  const bimok = semok ? getParentCategory(semok) : null;
  const isSubsidy = semok !== null;
  const canSkip = semok?.canSkipExpenseReport ?? false;
  const monthly = isMonthlyLicense(merchantName);

  return {
    merchantName,
    transactionDate,
    amount: currency === "KRW" ? amountKrw : (amountKrw / (exchangeRate ?? 1)),
    currency,
    exchangeRate,
    amountKrw,
    amountExclVat,
    vatAmount,
    semok,
    bimok,
    isSubsidyEligible: isSubsidy,
    canSkipExpenseReport: canSkip || monthly,
    isMonthlyLicense: monthly,
  };
}

export function categorizeAll(
  transactions: Array<{
    merchantName: string;
    amountKrw: number;
    transactionDate: string;
    currency: string;
    exchangeRate: number | null;
  }>,
): CategorizedTransaction[] {
  return transactions.map((tx) =>
    categorizeTransaction(
      tx.merchantName,
      tx.amountKrw,
      tx.transactionDate,
      tx.currency,
      tx.exchangeRate,
    )
  );
}
