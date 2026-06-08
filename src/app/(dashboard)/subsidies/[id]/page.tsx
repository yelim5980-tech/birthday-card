import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BudgetGauge } from "@/components/dashboard/BudgetGauge";
import Link from "next/link";
import { Plus, FileText, Download, ChevronRight, ArrowLeft } from "lucide-react";
import { formatKrw } from "@/lib/vat";

// Mock data — will be replaced with DB query once Supabase is connected
const MOCK_PROGRAM = {
  id: "1",
  name: "청창사 사업비 (조예림 16기)",
  agency: "KOSME 청년창업사관학교",
  totalAmount: 30_000_000,
  usedAmount: 18_000_000,
  startDate: "2026-01-01",
  endDate: "2026-12-31",
  daysLeft: 207,
};

const MOCK_EXPENSE_REPORTS = [
  {
    id: "r1",
    purchaseDate: "2026-04-28",
    productName: "Figma Professional (구독)",
    bimok: "지급수수료",
    semok: "기자재사용료",
    totalExclVat: 60_301,
    status: "SUBMITTED" as const,
    pdfUrl: null,
    canSkipReport: true,
  },
  {
    id: "r2",
    purchaseDate: "2026-04-24",
    productName: "Claude.ai 구독",
    bimok: "지급수수료",
    semok: "기자재사용료",
    totalExclVat: 150_822,
    status: "READY" as const,
    pdfUrl: null,
    canSkipReport: true,
  },
  {
    id: "r3",
    purchaseDate: "2026-04-27",
    productName: "기자재 구입 (쿠팡)",
    bimok: "재료비",
    semok: "기자재구입비",
    totalExclVat: 1_490_336,
    status: "DRAFT" as const,
    pdfUrl: null,
    canSkipReport: false,
  },
];

const statusConfig = {
  DRAFT: { label: "작성중", variant: "warning" as const },
  READY: { label: "생성완료", variant: "secondary" as const },
  SUBMITTED: { label: "제출완료", variant: "success" as const },
};

export default function SubsidyDetailPage() {
  const program = MOCK_PROGRAM;
  const remaining = program.totalAmount - program.usedAmount;
  const vatSelfPaid = Math.round(program.usedAmount * 0.1);
  const pct = Math.round((program.usedAmount / program.totalAmount) * 100);

  return (
    <div className="flex flex-col">
      <Header title={program.name} description={program.agency}>
        <Button variant="outline" size="sm" asChild>
          <Link href="/subsidies">
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로
          </Link>
        </Button>
        <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700" asChild>
          <Link href={`/subsidies/${program.id}/docs/new`}>
            <Plus className="h-4 w-4" />
            사용내역서 작성
          </Link>
        </Button>
      </Header>

      <div className="space-y-6 p-6">
        {/* 집행 현황 요약 */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-gray-400">협약금액</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-gray-900">
                {formatKrw(program.totalAmount)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-gray-400">집행 (공급가액)</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-green-600">
                {formatKrw(program.usedAmount)}
              </p>
              <p className="text-xs text-gray-400">{pct}% 집행</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-gray-400">잔여 집행 가능</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-gray-700">
                {formatKrw(remaining)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-gray-400">현금 자부담 (VAT)</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-amber-600">
                {formatKrw(vatSelfPaid)}
              </p>
              <p className="text-xs text-gray-400">집행액의 10%</p>
            </CardContent>
          </Card>
        </div>

        {/* 집행 게이지 */}
        <Card>
          <CardContent className="p-6">
            <BudgetGauge
              type="SUBSIDY"
              title={`${program.name} 집행 현황`}
              used={program.usedAmount}
              total={program.totalAmount}
              daysLeft={program.daysLeft}
            />
            <div className="mt-4 flex gap-3 text-xs text-gray-500">
              <span>기간: {program.startDate} ~ {program.endDate}</span>
              <span>·</span>
              <span className={program.daysLeft <= 30 ? "text-red-500 font-semibold" : ""}>
                만료 D-{program.daysLeft}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 사용내역서 목록 */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-700">
                사업비 사용내역서 ({MOCK_EXPENSE_REPORTS.length}건)
              </CardTitle>
              <Button variant="outline" size="sm" className="gap-1.5" asChild>
                <Link href={`/subsidies/${program.id}/docs/new`}>
                  <Plus className="h-4 w-4" />
                  새 사용내역서
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-400">
                  <th className="pb-3 pr-4 font-medium">구매일자</th>
                  <th className="pb-3 pr-4 font-medium">제품명</th>
                  <th className="pb-3 pr-4 font-medium">비목/세목</th>
                  <th className="pb-3 pr-4 text-right font-medium">금액(VAT제외)</th>
                  <th className="pb-3 pr-4 font-medium">상태</th>
                  <th className="pb-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {MOCK_EXPENSE_REPORTS.map((report) => {
                  const sc = statusConfig[report.status];
                  return (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="py-3 pr-4 tabular-nums text-gray-500">
                        {report.purchaseDate}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">
                            {report.productName}
                          </span>
                          {report.canSkipReport && (
                            <Badge variant="secondary" className="text-xs">내역서 생략가</Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-gray-500">
                        {report.bimok} &gt; {report.semok}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums font-semibold text-gray-900">
                        {formatKrw(report.totalExclVat)}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={sc.variant}>{sc.label}</Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {report.status !== "DRAFT" && (
                            <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
                              <Download className="h-3.5 w-3.5" />
                              PDF
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs" asChild>
                            <Link href={`/subsidies/${program.id}/docs/new?report=${report.id}`}>
                              <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* KOSME 지급요청 안내 */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-5">
            <p className="mb-3 text-sm font-semibold text-green-800">
              ◎ KOSME 홈페이지 지급요청 체크리스트
            </p>
            <ol className="list-decimal pl-5 text-sm text-green-700 space-y-1">
              <li>Start-Up 카드 결제 확인 (우리카드 이용대금명세서)</li>
              <li>사업비 사용내역서 생성 (월정액 라이선스는 생략 가능)</li>
              <li>세목별 필수 서류 업로드 (견적서, 카드영수증 등)</li>
              <li>KOSME 홈페이지 → 사업비 지급요청 등록</li>
              <li>카드 결제일(매월 15일) 7영업일 전까지 완료</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
