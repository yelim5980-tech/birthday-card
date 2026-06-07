import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BudgetGauge } from "@/components/dashboard/BudgetGauge";
import Link from "next/link";
import { Plus, FileText, ChevronRight } from "lucide-react";
import { formatKrw, calcSubsidySplit } from "@/lib/vat";

const MOCK_PROGRAMS = [
  {
    id: "1",
    name: "청창사 사업비 (조예림 16기)",
    agency: "KOSME 청년창업사관학교",
    totalAmount: 30_000_000,
    usedAmount: 18_000_000,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    daysLeft: 207,
    recentUsages: [
      { date: "2026-04-28", product: "Figma Professional (구독)", amountExclVat: 60301, category: "지급수수료 > 기자재사용료", status: "SUBMITTED" },
      { date: "2026-04-24", product: "Claude.ai 구독", amountExclVat: 150822, category: "지급수수료 > 기자재사용료", status: "READY" },
    ],
  },
];

export default function SubsidiesPage() {
  return (
    <div className="flex flex-col">
      <Header title="지원사업 관리" description="청창사 사업비 집행 현황 및 사용내역서 관리">
        <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4" />
          지원사업 등록
        </Button>
      </Header>

      <div className="space-y-6 p-6">
        {MOCK_PROGRAMS.map((program) => {
          const remainingDays = program.daysLeft;
          const pct = Math.round((program.usedAmount / program.totalAmount) * 100);
          const remaining = program.totalAmount - program.usedAmount;
          const vatSelfPaid = Math.round(program.usedAmount * 0.1);

          return (
            <Card key={program.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">{program.name}</CardTitle>
                    <p className="mt-1 text-sm text-gray-500">{program.agency}</p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {program.startDate} ~ {program.endDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={remainingDays <= 30 ? "destructive" : remainingDays <= 60 ? "warning" : "success"}
                    >
                      만료 D-{remainingDays}
                    </Badge>
                    <Button variant="outline" size="sm" className="gap-1.5" asChild>
                      <Link href={`/subsidies/${program.id}`}>
                        상세보기 <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* 집행 현황 */}
                <BudgetGauge
                  type="SUBSIDY"
                  title={`사업비 집행 현황 (${formatKrw(program.totalAmount)} 협약)`}
                  used={program.usedAmount}
                  total={program.totalAmount}
                  daysLeft={remainingDays}
                />

                {/* 금액 요약 */}
                <div className="grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-4 text-center">
                  <div>
                    <p className="text-xs text-gray-400">집행 (공급가액)</p>
                    <p className="mt-1 text-lg font-bold text-green-600 tabular-nums">
                      {formatKrw(program.usedAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">잔여 집행 가능</p>
                    <p className="mt-1 text-lg font-bold text-gray-700 tabular-nums">
                      {formatKrw(remaining)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">현금 자부담 (VAT)</p>
                    <p className="mt-1 text-lg font-bold text-amber-600 tabular-nums">
                      {formatKrw(vatSelfPaid)}
                    </p>
                    <p className="text-xs text-gray-400">집행액의 10%</p>
                  </div>
                </div>

                {/* 최근 사용 내역 */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">최근 사용내역서</p>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-green-700">
                      <FileText className="h-3.5 w-3.5" />
                      사용내역서 작성
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {program.recentUsages.map((usage, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 text-sm"
                      >
                        <div>
                          <p className="font-medium text-gray-800">{usage.product}</p>
                          <p className="text-xs text-gray-400">{usage.date} · {usage.category}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="tabular-nums font-semibold text-gray-900">
                            {formatKrw(usage.amountExclVat)}
                            <span className="ml-1 text-xs font-normal text-gray-400">(VAT제외)</span>
                          </span>
                          <Badge variant={usage.status === "SUBMITTED" ? "success" : "warning"}>
                            {usage.status === "SUBMITTED" ? "제출완료" : "작성필요"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
