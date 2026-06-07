import {
  findCategoryByKeyword,
  findCategoryByMcc,
  isMonthlyLicense,
  needsPurchaseApproval,
  type KosmeCategory,
  type RequiredDoc,
} from "./categories";

export interface DocCheckResult {
  category: KosmeCategory | null;
  requiredDocs: RequiredDoc[];
  canSkipExpenseReport: boolean;
  needsPurchaseApproval: boolean;
  hint: string | null;
}

export function getDocCheckResult(
  merchantName: string,
  amountKrw: number,
  mccCode?: string
): DocCheckResult {
  let category: KosmeCategory | null = null;

  if (mccCode) category = findCategoryByMcc(mccCode);
  if (!category) category = findCategoryByKeyword(merchantName);

  const monthly = isMonthlyLicense(merchantName);
  const needsApproval = needsPurchaseApproval(amountKrw, category ?? undefined);

  const docs = category?.requiredDocs ?? [];
  const filteredDocs = monthly
    ? docs.filter((d) => d.key !== "expense_report" && d.key !== "rental_contract")
    : docs;

  let hint: string | null = null;
  if (monthly && category?.code === "FEE_EQUIPMENT_RENTAL") {
    hint = "월정액 라이선스는 견적서(영수증)와 카드영수증만으로 지급요청이 가능합니다.";
  }
  if (needsApproval) {
    hint = (hint ? hint + " " : "") + "⚠️ 금액이 1,000만원을 초과하여 구매계약 승인이 필요합니다.";
  }

  return {
    category,
    requiredDocs: filteredDocs,
    canSkipExpenseReport: monthly && (category?.canSkipExpenseReport ?? false),
    needsPurchaseApproval: needsApproval,
    hint,
  };
}

export function buildKosmeRequestInfo(params: {
  kosmeCategory: string;
  kosmeSubcategory: string;
  productName: string;
  vendorName: string;
  purchaseReason: string;
  amountExclVat: number;
  representativeName: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
}): string {
  return `비목: ${params.kosmeCategory}
세목: ${params.kosmeSubcategory}
제품(계약)명: ${params.productName}
구매/계약업체명: ${params.vendorName}
구매사유: ${params.purchaseReason}
소요금액(VAT제외): 일금 ${params.amountExclVat.toLocaleString("ko-KR")}원
지급요청금액(VAT제외): 일금 ${params.amountExclVat.toLocaleString("ko-KR")}원
은행: ${params.bankName}  계좌: ${params.bankAccount}  예금주: ${params.representativeName}`;
}
