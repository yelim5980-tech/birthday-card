"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, AlertCircle, ArrowRight, RotateCcw, ChevronDown } from "lucide-react";
import { parseWooriCsv, ParsedTransaction } from "@/lib/import/bankAdapters/woori";
import { categorizeAll, CategorizedTransaction } from "@/lib/import/categorize";
import { formatKrw } from "@/lib/vat";

type Step = "upload" | "preview" | "done";

const SUBSIDY_LABEL_MAP: Record<string, string> = {
  FEE_EQUIPMENT_RENTAL: "기자재사용료",
  FEE_AD: "광고비",
  FEE_EDUCATION: "교육비",
  FEE_BOOK: "기술서적구입비",
  FEE_SEMINAR: "세미나및학회참가비",
  FEE_EXHIBITION: "개별전시회참가비",
  FEE_CATALOG: "카탈로그및포장디자인제작비",
  FEE_VIDEO: "영상제작비",
  FEE_HOMEPAGE: "홈페이지및온라인쇼핑몰제작비",
  FEE_MALL: "온라인쇼핑몰입점비",
  FEE_TEST: "전문기관시험/인증비",
  FEE_IP: "지재권출원비",
  FEE_CONSULTING: "기술및경영자문비",
  FEE_ACCOUNTING: "회계처리비",
  FEE_DOMESTIC_TRAVEL: "국내출장여비",
  FEE_OVERSEAS_TRAVEL: "해외출장여비",
  FEE_MANAGEMENT: "경영활동비",
  MATERIAL_PRODUCT: "제품제작비",
  MATERIAL_EQUIPMENT: "기자재구입비",
  MACHINE_IT: "전산장비와통신기기구매비",
  LABOR_TASK: "과제참여인건비",
};

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // Try UTF-8 first; if garbled, caller can retry with EUC-KR via iconv
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("파일 읽기 실패"));
    reader.readAsText(file, "utf-8");
  });
}

async function readFileAsEucKr(file: File): Promise<string> {
  const iconv = (await import("iconv-lite")).default;
  const buffer = await file.arrayBuffer();
  return iconv.decode(Buffer.from(buffer), "EUC-KR");
}

function hasGarbledChars(text: string): boolean {
  // EUC-KR files mis-decoded as UTF-8 produce replacement chars
  return text.includes("�") || (text.includes("â") && text.includes("ã"));
}

export default function ImportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [categorized, setCategorized] = useState<CategorizedTransaction[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  async function processFile(file: File) {
    setFileName(file.name);
    setParseErrors([]);

    let text = await readFileAsText(file);
    if (hasGarbledChars(text)) {
      text = await readFileAsEucKr(file);
    }

    const { transactions, errors } = parseWooriCsv(text);
    const cats = categorizeAll(transactions);

    setParseErrors(errors);
    setCategorized(cats);
    // Pre-select all by default
    setSelected(new Set(cats.map((_, i) => i)));
    setStep("preview");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function toggleRow(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === categorized.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(categorized.map((_, i) => i)));
    }
  }

  function toggleExpand(i: number) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  async function handleImport() {
    setImporting(true);
    // In MVP: just simulate import success (DB not connected)
    await new Promise((r) => setTimeout(r, 800));
    setImporting(false);
    setStep("done");
  }

  const selectedItems = categorized.filter((_, i) => selected.has(i));
  const subsidyCount = selectedItems.filter((t) => t.isSubsidyEligible).length;
  const totalKrw = selectedItems.reduce((s, t) => s + t.amountKrw, 0);

  return (
    <div className="flex flex-col">
      <Header title="내역 가져오기" description="카드 이용 내역 CSV 파일 업로드" />

      <div className="space-y-6 p-6">
        {/* Step indicator */}
        <div className="flex items-center gap-2 text-sm">
          {(["upload", "preview", "done"] as Step[]).map((s, idx) => {
            const labels = ["파일 선택", "내역 확인", "완료"];
            const active = s === step;
            const done =
              (step === "preview" && idx === 0) ||
              (step === "done" && idx < 2);
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
                <span className={active ? "font-semibold text-gray-800" : "text-gray-400"}>
                  {labels[idx]}
                </span>
                {idx < 2 && <ArrowRight className="h-4 w-4 text-gray-300" />}
              </div>
            );
          })}
        </div>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <Card>
            <CardContent className="p-6">
              <div
                className={`relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-12 transition ${
                  dragging ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-300"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                  <Upload className="h-7 w-7 text-blue-600" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-800">CSV 파일을 여기에 드래그하거나</p>
                  <p className="mt-1 text-sm text-gray-400">
                    우리카드 이용대금명세서 CSV / EUC-KR·UTF-8 모두 지원
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  파일 선택
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <div className="mt-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                <p className="font-semibold">우리카드 CSV 내보내기 방법</p>
                <ol className="mt-2 list-decimal pl-4 space-y-1 text-amber-700">
                  <li>우리카드 앱 또는 웹사이트 → 이용내역</li>
                  <li>기간 선택 후 <strong>엑셀/CSV 다운로드</strong></li>
                  <li>다운로드된 파일을 여기에 업로드</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Preview & categorize */}
        {step === "preview" && (
          <>
            {parseErrors.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                  <AlertCircle className="h-4 w-4" />
                  파싱 경고 ({parseErrors.length}건)
                </p>
                <ul className="mt-2 list-disc pl-5 text-xs text-amber-700 space-y-0.5">
                  {parseErrors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                  {parseErrors.length > 5 && <li>...외 {parseErrors.length - 5}건</li>}
                </ul>
              </div>
            )}

            {categorized.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-400">
                  <FileText className="mx-auto h-10 w-10 mb-3 opacity-30" />
                  <p>파싱된 거래 내역이 없습니다.</p>
                  <p className="mt-1 text-xs">파일 형식을 확인하고 다시 시도해주세요.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => { setStep("upload"); setFileName(null); }}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    다시 업로드
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Summary bar */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs text-gray-400">총 거래 건수</p>
                      <p className="mt-1 text-xl font-bold text-gray-900">{categorized.length}건</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs text-gray-400">지원금 해당</p>
                      <p className="mt-1 text-xl font-bold text-green-600">{categorized.filter(t => t.isSubsidyEligible).length}건</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs text-gray-400">선택 금액 합계</p>
                      <p className="mt-1 text-xl font-bold tabular-nums text-gray-900">{formatKrw(totalKrw)}</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold text-gray-700">
                        {fileName} — {categorized.length}건
                      </CardTitle>
                      <div className="flex items-center gap-3">
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-500">
                          <input
                            type="checkbox"
                            checked={selected.size === categorized.length}
                            onChange={toggleAll}
                            className="accent-blue-600"
                          />
                          전체 선택
                        </label>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100 text-left text-xs text-gray-400">
                            <th className="w-8 pb-3" />
                            <th className="pb-3 pr-4 font-medium">날짜</th>
                            <th className="pb-3 pr-4 font-medium">가맹점</th>
                            <th className="pb-3 pr-4 font-medium">비목/세목</th>
                            <th className="pb-3 pr-4 text-right font-medium">결제금액</th>
                            <th className="pb-3 pr-4 text-right font-medium">공급가액</th>
                            <th className="pb-3 font-medium">비고</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {categorized.map((tx, i) => {
                            const isSelected = selected.has(i);
                            const isExpanded = expandedRows.has(i);
                            return (
                              <>
                                <tr
                                  key={i}
                                  className={`cursor-pointer hover:bg-gray-50 ${!isSelected ? "opacity-40" : ""}`}
                                  onClick={() => toggleRow(i)}
                                >
                                  <td className="py-3 pr-2">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => toggleRow(i)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="accent-blue-600"
                                    />
                                  </td>
                                  <td className="py-3 pr-4 text-gray-500 tabular-nums">
                                    {tx.transactionDate}
                                  </td>
                                  <td className="py-3 pr-4">
                                    <div className="flex items-center gap-2">
                                      {tx.isSubsidyEligible && (
                                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                                      )}
                                      <span className="font-medium text-gray-800 max-w-[180px] truncate">
                                        {tx.merchantName}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-3 pr-4 text-gray-500">
                                    {tx.semok ? (
                                      <span className="text-gray-700">
                                        {tx.bimok?.name} &gt; {tx.semok.name}
                                      </span>
                                    ) : (
                                      <span className="text-amber-500">미분류</span>
                                    )}
                                  </td>
                                  <td className="py-3 pr-4 text-right tabular-nums font-semibold text-gray-900">
                                    {formatKrw(tx.amountKrw)}
                                    {tx.currency !== "KRW" && (
                                      <span className="ml-1 text-xs text-gray-400">({tx.currency})</span>
                                    )}
                                  </td>
                                  <td className="py-3 pr-4 text-right tabular-nums text-green-600">
                                    {tx.isSubsidyEligible ? formatKrw(tx.amountExclVat) : "-"}
                                  </td>
                                  <td className="py-3">
                                    <div className="flex items-center gap-1">
                                      {tx.isMonthlyLicense && (
                                        <Badge variant="secondary" className="text-xs">월정액</Badge>
                                      )}
                                      {tx.canSkipExpenseReport && (
                                        <Badge variant="secondary" className="text-xs">내역서 생략가</Badge>
                                      )}
                                      {tx.isSubsidyEligible && (
                                        <button
                                          onClick={(e) => { e.stopPropagation(); toggleExpand(i); }}
                                          className="ml-1 text-gray-400 hover:text-gray-600"
                                        >
                                          <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                                {isExpanded && tx.isSubsidyEligible && (
                                  <tr key={`${i}-detail`} className="bg-green-50">
                                    <td colSpan={7} className="px-4 py-2 text-xs text-gray-600">
                                      <div className="flex gap-6">
                                        <span>
                                          <span className="text-gray-400">지원금 집행 (공급가):</span>{" "}
                                          <strong className="text-green-700">{formatKrw(tx.amountExclVat)}</strong>
                                        </span>
                                        <span>
                                          <span className="text-gray-400">현금 자부담 (VAT):</span>{" "}
                                          <strong className="text-blue-700">{formatKrw(tx.vatAmount)}</strong>
                                        </span>
                                        {tx.semok?.requiredDocs && tx.semok.requiredDocs.length > 0 && (
                                          <span>
                                            <span className="text-gray-400">필요 서류:</span>{" "}
                                            {tx.semok.requiredDocs
                                              .filter((d) => d.required)
                                              .map((d) => d.label)
                                              .join(", ")}
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => { setStep("upload"); setFileName(null); }}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    다시 업로드
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={selected.size === 0 || importing}
                  >
                    {importing ? "가져오는 중..." : `선택 ${selected.size}건 가져오기`}
                  </Button>
                </div>
              </>
            )}
          </>
        )}

        {/* Step 3: Done */}
        {step === "done" && (
          <Card>
            <CardContent className="flex flex-col items-center gap-5 py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">
                  {selected.size}건 가져오기 완료
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  총 {formatKrw(totalKrw)} · 지원금 해당 {subsidyCount}건
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => router.push("/cards")}>
                  카드 내역으로 이동
                </Button>
                <Button variant="outline" onClick={() => { setStep("upload"); setFileName(null); setCategorized([]); }}>
                  추가 업로드
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
