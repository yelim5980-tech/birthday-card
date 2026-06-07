import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetGauge } from "@/components/dashboard/BudgetGauge";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Settings } from "lucide-react";
import { formatKrw } from "@/lib/vat";

const MOCK_CASH_BUDGETS = [
  { category: "마케팅·광고", used: 3_200_000, total: 4_000_000 },
  { category: "교육비", used: 800_000, total: 1_000_000 },
  { category: "출장여비", used: 450_000, total: 500_000 },
  { category: "소모품·기타", used: 150_000, total: 500_000 },
];

const MOCK_SUBSIDY_BUDGETS = [
  { category: "지급수수료 > 기자재사용료", used: 800_000, total: 3_000_000, daysLeft: 207 },
  { category: "지급수수료 > 광고비", used: 5_000_000, total: 10_000_000, daysLeft: 207 },
  { category: "재료비 > 기자재구입비", used: 8_200_000, total: 12_000_000, daysLeft: 207 },
  { category: "지급수수료 > 교육비", used: 4_000_000, total: 5_000_000, daysLeft: 207 },
];

export default function BudgetPage() {
  const totalCash = MOCK_CASH_BUDGETS.reduce((s, b) => s + b.total, 0);
  const usedCash = MOCK_CASH_BUDGETS.reduce((s, b) => s + b.used, 0);
  const totalSubsidy = MOCK_SUBSIDY_BUDGETS.reduce((s, b) => s + b.total, 0);
  const usedSubsidy = MOCK_SUBSIDY_BUDGETS.reduce((s, b) => s + b.used, 0);

  return (
    <div className="flex flex-col">
      <Header title="예산 관리" description="현금 예산과 지원금 예산 현황">
        <Button variant="outline" size="sm" className="gap-2" asChild>
          <Link href="/budget/settings">
            <Settings className="h-4 w-4" />
            예산 설정
          </Link>
        </Button>
      </Header>

      <div className="space-y-6 p-6">
        {/* 현금 예산 */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-700">
                💰 현금 예산
                <span className="ml-2 text-xs font-normal text-gray-400">
                  전체: {formatKrw(totalCash)} / 사용: {formatKrw(usedCash)} / 잔여: {formatKrw(totalCash - usedCash)}
                </span>
              </CardTitle>
              <Badge variant="cash">지출 최소화 목표</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {MOCK_CASH_BUDGETS.map((b) => (
              <BudgetGauge
                key={b.category}
                type="CASH"
                title={b.category}
                used={b.used}
                total={b.total}
              />
            ))}
          </CardContent>
        </Card>

        {/* 지원금 예산 */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-700">
                🏛️ 지원금 예산 (청창사 비목별)
                <span className="ml-2 text-xs font-normal text-gray-400">
                  전체: {formatKrw(totalSubsidy)} / 집행: {formatKrw(usedSubsidy)} / 잔여: {formatKrw(totalSubsidy - usedSubsidy)}
                </span>
              </CardTitle>
              <Badge variant="subsidy">전액 소진 목표</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {MOCK_SUBSIDY_BUDGETS.map((b) => (
              <BudgetGauge
                key={b.category}
                type="SUBSIDY"
                title={b.category}
                used={b.used}
                total={b.total}
                daysLeft={b.daysLeft}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
