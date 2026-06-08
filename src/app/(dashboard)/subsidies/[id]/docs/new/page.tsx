"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Download,
  CheckCircle,
  Copy,
  Check,
} from "lucide-react";
import { formatKrw, calcSubsidySplit, krwToWords } from "@/lib/vat";

type Step = "select" | "edit" | "preview";

interface LineItem {
  itemName: string;
  unitPrice: number;
  quantity: number;
  period: string;
}

// Mock transactions — subsidy-eligible
const MOCK_TRANSACTIONS = [
  {
    id: "tx1",
    date: "2026-04-28",
    merchant: "FIGMA",
    amountKrw: 66_135,
    bimok: "지급수수료",
    semok: "기자재사용료",
    isMonthlyLicense: true,
    canSkipReport: true,
  },
  {
    id: "tx2",
    date: "2026-04-24",
    merchant: "CLAUDE.AI SUBSCRIPTION",
    amountKrw: 165_905,
    bimok: "지급수수료",
    semok: "기자재사용료",
    isMonthlyLicense: true,
    canSkipReport: true,
  },
  {
    id: "tx3",
    date: "2026-04-27",
    merchant: "쿠팡(주)",
    amountKrw: 1_639_370,
    bimok: "재료비",
    semok: "기자재구입비",
    isMonthlyLicense: false,
    canSkipReport: false,
  },
];

const PURCHASE_REASON_TEMPLATES: Record<string, string> = {
  "기자재사용료":
    "사업 수행에 필요한 업무 도구 및 디자인·개발 플랫폼 사용료 지급",
  "기자재구입비":
    "사업 과제 수행을 위한 기자재 구입",
  "광고비":
    "사업 제품/서비스 홍보를 위한 온라인 광고 집행",
  "교육비":
    "과제 수행 역량 강화를 위한 교육 프로그램 참가",
  "전문기관시험/인증비":
    "제품 안전성 및 품질 검증을 위한 전문기관 시험/인증",
};

function getProductName(merchant: string): string {
  const map: Record<string, string> = {
    "FIGMA": "Figma Professional 구독",
    "CLAUDE.AI SUBSCRIPTION": "Claude.ai Pro 구독",
    "쿠팡(주)": "기자재 구입",
  };
  return map[merchant] ?? merchant;
}

export default function DocsNewPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("select");
  const [selectedTx, setSelectedTx] = useState<typeof MOCK_TRANSACTIONS[0] | null>(null);
  const [productName, setProductName] = useState("");
  const [purchaseReason, setPurchaseReason] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [generating, setGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function selectTransaction(tx: typeof MOCK_TRANSACTIONS[0]) {
    setSelectedTx(tx);
    const name = getProductName(tx.merchant);
    setProductName(name);
    setPurchaseReason(
      PURCHASE_REASON_TEMPLATES[tx.semok] ?? `${tx.semok} 관련 비용 지급`
    );
    setDeliveryDate(tx.date);

    const { amountExclVat } = calcSubsidySplit(tx.amountKrw);
    setLineItems([
      {
        itemName: name,
        unitPrice: amountExclVat,
        quantity: 1,
        period: tx.isMonthlyLicense ? "2026-04" : "",
      },
    ]);
    setStep("edit");
  }

  function addLineItem() {
    setLineItems((prev) => [
      ...prev,
      { itemName: "", unitPrice: 0, quantity: 1, period: "" },
    ]);
  }

  function removeLineItem(i: number) {
    setLineItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateLineItem(i: number, field: keyof LineItem, value: string | number) {
    setLineItems((prev) =>
      prev.map((item, idx) =>
        idx === i ? { ...item, [field]: value } : item
      )
    );
  }

  const totalExclVat = lineItems.reduce(
    (s, item) => s + item.unitPrice * item.quantity,
    0
  );

  const { vatAmount } = selectedTx
    ? calcSubsidySplit(selectedTx.amountKrw)
    : { vatAmount: 0 };

  async function generatePdf() {
    if (!selectedTx) return;
    setGenerating(true);

    const payload = {
      programName: "청창사 사업비 (조예림 16기)",
      companyName: "핏코 (FitCo)",
      representativeName: "조예림",
      purchaseDate: selectedTx.date,
      deliveryDate,
      productName,
      purchaseReason,
      bimok: selectedTx.bimok,
      semok: selectedTx.semok,
      items: lineItems.map((item) => ({
        itemName: item.itemName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        totalExclVat: item.unitPrice * item.quantity,
        period: item.period,
      })),
      totalExclVat,
      receiptImageUrls: [],
      createdDate: new Date().toLocaleDateString("ko-KR"),
    };

    try {
      const res = await fetch("/api/pdf/expense-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setStep("preview");
    } catch (err) {
      alert("PDF 생성 중 오류가 발생했습니다. " + (err as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  function buildKosmeText(): string {
    if (!selectedTx) return "";
    return [
      `비목: ${selectedTx.bimok}`,
      `세목: ${selectedTx.semok}`,
      `제품(계약)명: ${productName}`,
      `구매/계약업체명: ${selectedTx.merchant}`,
      `구매사유: ${purchaseReason}`,
      `소요금액(VAT제외): ${krwToWords(totalExclVat)}`,
      `지급요청금액(VAT제외): ${krwToWords(totalExclVat)}`,
      `은행: 우리  계좌: 1006001578606  예금주: 조예림`,
    ].join("\n");
  }

  function copyKosmeText() {
    navigator.clipboard.writeText(buildKosmeText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const stepLabels = ["거래 선택", "내용 작성", "PDF 생성"];
  const stepKeys: Step[] = ["select", "edit", "preview"];
  const currentStepIdx = stepKeys.indexOf(step);

  return (
    <div className="flex flex-col">
      <Header title="사업비 사용내역서 작성" description="KOSME 공식 양식 자동 생성">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          뒤로
        </Button>
      </Header>

      <div className="space-y-6 p-6">
        {/* Step indicator */}
        <div className="flex items-center gap-2 text-sm">
          {stepKeys.map((s, idx) => {
            const active = s === step;
            const done = idx < currentStepIdx;
            return (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                    done
                      ? "bg-green-500 text-white"
                      : active
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {done ? "✓" : idx + 1}
                </div>
                <span
                  className={
                    active
                      ? "font-semibold text-gray-800"
                      : "text-gray-400"
                  }
                >
                  {stepLabels[idx]}
                </span>
                {idx < 2 && (
                  <ArrowRight className="h-4 w-4 text-gray-300" />
                )}
              </div>
            );
          })}
        </div>

        {/* Step 1: Select transaction */}
        {step === "select" && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">
                지원금 연결된 거래 내역 선택
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {MOCK_TRANSACTIONS.map((tx) => {
                const { amountExclVat, vatAmount } = calcSubsidySplit(tx.amountKrw);
                return (
                  <button
                    key={tx.id}
                    onClick={() => selectTransaction(tx)}
                    className="flex w-full items-center justify-between rounded-xl border border-gray-200 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{tx.merchant}</span>
                        {tx.isMonthlyLicense && (
                          <Badge variant="secondary" className="text-xs">월정액</Badge>
                        )}
                        {tx.canSkipReport && (
                          <Badge variant="secondary" className="text-xs">내역서 생략가</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {tx.date} · {tx.bimok} &gt; {tx.semok}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold tabular-nums text-gray-900">
                        {formatKrw(tx.amountKrw)}
                      </p>
                      <p className="text-xs text-green-600">
                        공급가 {formatKrw(amountExclVat)} + VAT {formatKrw(vatAmount)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Edit content */}
        {step === "edit" && selectedTx && (
          <>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">구매일자</label>
                    <input
                      type="date"
                      value={selectedTx.date}
                      readOnly
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">납품일자</label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">제품명</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="예: Figma Professional (구독)"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">구매사유</label>
                  <textarea
                    value={purchaseReason}
                    onChange={(e) => setPurchaseReason(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                  />
                </div>

                <div className="rounded-lg bg-gray-50 px-4 py-3 text-xs text-gray-500">
                  <span className="font-medium text-gray-700">비목/세목:</span>{" "}
                  {selectedTx.bimok} &gt; {selectedTx.semok}
                </div>
              </CardContent>
            </Card>

            {/* Line items */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-gray-700">세부 내역</CardTitle>
                  <Button variant="outline" size="sm" onClick={addLineItem} className="gap-1.5">
                    <Plus className="h-3.5 w-3.5" />
                    항목 추가
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-12 gap-2 text-xs text-gray-400 px-1">
                  <span className="col-span-5">종류</span>
                  <span className="col-span-2">기간/회차</span>
                  <span className="col-span-2 text-right">단가(VAT제외)</span>
                  <span className="col-span-1 text-center">수량</span>
                  <span className="col-span-2 text-right">합계(VAT제외)</span>
                </div>

                {lineItems.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      value={item.itemName}
                      onChange={(e) => updateLineItem(i, "itemName", e.target.value)}
                      className="col-span-5 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      placeholder="종류명"
                    />
                    <input
                      value={item.period}
                      onChange={(e) => updateLineItem(i, "period", e.target.value)}
                      className="col-span-2 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      placeholder="2026-04"
                    />
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(i, "unitPrice", Number(e.target.value))}
                      className="col-span-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-300 tabular-nums"
                    />
                    <input
                      type="number"
                      value={item.quantity}
                      min={1}
                      onChange={(e) => updateLineItem(i, "quantity", Number(e.target.value))}
                      className="col-span-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <div className="col-span-1 text-right tabular-nums text-sm font-semibold text-gray-700">
                      {formatKrw(item.unitPrice * item.quantity)}
                    </div>
                    {lineItems.length > 1 && (
                      <button
                        onClick={() => removeLineItem(i)}
                        className="col-span-1 flex justify-center text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}

                {/* Total */}
                <div className="flex justify-between rounded-lg bg-green-50 px-4 py-3 border border-green-100">
                  <div className="space-y-0.5">
                    <p className="text-xs text-gray-500">
                      지원금 집행 (총계 VAT제외)
                    </p>
                    <p className="text-xl font-bold tabular-nums text-green-700">
                      {formatKrw(totalExclVat)}
                    </p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <p className="text-xs text-gray-500">현금 자부담 (VAT)</p>
                    <p className="text-lg font-semibold tabular-nums text-amber-600">
                      {formatKrw(vatAmount)}
                    </p>
                    <p className="text-xs text-gray-400">총 결제 {formatKrw(selectedTx.amountKrw)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("select")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                거래 재선택
              </Button>
              <Button
                onClick={generatePdf}
                disabled={generating || !productName || lineItems.length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                {generating ? "생성 중..." : "PDF 생성"}
                {!generating && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </>
        )}

        {/* Step 3: Preview & download */}
        {step === "preview" && selectedTx && (
          <>
            <Card className="border-green-200 bg-green-50">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-green-800">PDF 생성 완료</p>
                  <p className="text-sm text-green-600">
                    {productName} — {formatKrw(totalExclVat)} (VAT제외)
                  </p>
                </div>
                {pdfUrl && (
                  <a href={pdfUrl} download={`사업비사용내역서_${selectedTx.date}.pdf`}>
                    <Button className="gap-2 bg-green-600 hover:bg-green-700">
                      <Download className="h-4 w-4" />
                      PDF 다운로드
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>

            {/* KOSME copy-paste panel */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-gray-700">
                    KOSME 홈페이지 지급요청 정보
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={copyKosmeText}
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-green-600" />
                        복사됨
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        전체 복사
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700 font-mono leading-relaxed whitespace-pre-wrap select-all">
                  {buildKosmeText()}
                </pre>
                <p className="mt-3 text-xs text-gray-400">
                  위 내용을 KOSME 홈페이지 사업비 지급요청 폼에 붙여넣으세요.
                </p>
              </CardContent>
            </Card>

            {/* Required docs checklist */}
            {selectedTx && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-700">
                    제출 서류 체크리스트 — {selectedTx.semok}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { label: "견적서 (영수증)", required: true, done: true },
                      { label: "카드영수증 (이용대금명세서)", required: true, done: false },
                      ...(selectedTx.canSkipReport
                        ? [{ label: "사업비 사용내역서", required: false, done: true, note: "월정액 라이선스 — 생략 가능" }]
                        : [{ label: "사업비 사용내역서", required: true, done: true, note: "방금 생성됨" }]),
                    ].map((doc, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <div
                          className={`h-5 w-5 rounded-full flex items-center justify-center text-xs ${
                            doc.done
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {doc.done ? "✓" : "○"}
                        </div>
                        <span className={doc.required ? "text-gray-700" : "text-gray-400"}>
                          {doc.label}
                          {!doc.required && " (선택)"}
                        </span>
                        {doc.note && (
                          <span className="text-xs text-gray-400">— {doc.note}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("select")}>
                새 사용내역서 작성
              </Button>
              <Button variant="outline" onClick={() => router.back()}>
                지원사업 목록으로
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
