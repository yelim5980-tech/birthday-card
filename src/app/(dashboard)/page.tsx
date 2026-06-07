import { Header } from "@/components/layout/Header";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { BudgetGauge } from "@/components/dashboard/BudgetGauge";
import { AlertPanel, type Alert } from "@/components/dashboard/AlertPanel";
import { AIAdvicePanel } from "@/components/dashboard/AIAdvicePanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatKrw } from "@/lib/vat";

// TODO: 실제 DB 데이터로 교체
const MOCK_DATA = {
  cashFlow: 23_000_000,
  cashFlowTrend: 12,
  revenue: { actual: 45_000_000, projected: 50_000_000 },
  expenses: { actual: 22_000_000, projected: 25_000_000 },
  cashBudget: { used: 8_500_000, total: 10_000_000 },
  subsidyBudget: { used: 18_000_000, total: 30_000_000, daysLeft: 45 },
  vatSelfPaid: 850_000,
  recentTransactions: [
    { id: "1", date: "2026-04-28", merchant: "FIGMA", amount: 66135, category: "기자재사용료", isSubsidy: true },
    { id: "2", date: "2026-04-24", merchant: "이니시스_애플스토어", amount: 4490000, category: "앱스토어", isSubsidy: false },
    { id: "3", date: "2026-04-24", merchant: "CLAUDE.AI SUBSCRIPTION", amount: 165905, category: "기자재사용료", isSubsidy: true },
  ],
};

const MOCK_ALERTS: Alert[] = [
  {
    id: "1",
    type: "CASH",
    severity: "warning",
    message: "이번 달 현금 예산의 85%를 사용했습니다. 지출을 조절하세요.",
  },
  {
    id: "2",
    type: "SUBSIDY",
    severity: "info",
    message: "청창사 사업비 만료까지 45일 남았습니다. 잔여 12,000,000원을 계획적으로 집행하세요.",
  },
];

export default function DashboardPage() {
  const { cashFlow, cashFlowTrend, revenue, expenses, cashBudget, subsidyBudget, vatSelfPaid, recentTransactions } = MOCK_DATA;

  return (
    <div className="flex flex-col">
      <Header title="대시보드" description="재무 현황 한눈에 보기" />

      <div className="space-y-6 p-6">
        {/* KPI 카드 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="이번 달 현금흐름"
            value={formatKrw(cashFlow)}
            trend="up"
            trendLabel={`+${cashFlowTrend}%`}
            accentColor="blue"
          />
          <KpiCard
            title="매출 실적"
            value={formatKrw(revenue.actual)}
            subValue={`목표: ${formatKrw(revenue.projected)}`}
            trend={revenue.actual >= revenue.projected ? "up" : "down"}
            trendLabel={`${Math.round((revenue.actual / revenue.projected) * 100)}%`}
            accentColor="green"
          />
          <KpiCard
            title="지출 실적"
            value={formatKrw(expenses.actual)}
            subValue={`계획: ${formatKrw(expenses.projected)}`}
            trend={expenses.actual <= expenses.projected ? "up" : "down"}
            accentColor="amber"
          />
          <KpiCard
            title="VAT 자부담 누계"
            value={formatKrw(vatSelfPaid)}
            subValue="지원금 집행 시 발생"
            accentColor="red"
          />
        </div>

        {/* 예산 현황 */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">
                💰 현금 예산 현황
                <span className="ml-2 text-xs font-normal text-gray-400">(낮을수록 좋음)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <BudgetGauge
                type="CASH"
                title="전체 현금 예산"
                used={cashBudget.used}
                total={cashBudget.total}
              />
              <p className="text-xs text-gray-400">
                VAT 자부담 포함 실질 지출: {formatKrw(cashBudget.used + vatSelfPaid)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">
                🏛️ 지원금 집행 현황
                <span className="ml-2 text-xs font-normal text-gray-400">(높을수록 좋음)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <BudgetGauge
                type="SUBSIDY"
                title="청창사 사업비"
                used={subsidyBudget.used}
                total={subsidyBudget.total}
                daysLeft={subsidyBudget.daysLeft}
              />
              <p className="text-xs text-gray-400">
                집행 시 VAT 10% ({formatKrw(Math.round(subsidyBudget.used * 0.1))})는 현금 자부담
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 알림 */}
        <AlertPanel alerts={MOCK_ALERTS} />

        {/* 최근 거래 & AI 조언 */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">
                최근 카드 내역
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs" asChild>
                <Link href="/cards">전체 보기</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2 w-2 rounded-full ${tx.isSubsidy ? "bg-green-500" : "bg-gray-300"}`}
                      />
                      <div>
                        <p className="font-medium text-gray-800">{tx.merchant}</p>
                        <p className="text-xs text-gray-400">
                          {tx.date} · {tx.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold tabular-nums text-gray-900">
                        {formatKrw(tx.amount)}
                      </p>
                      {tx.isSubsidy && (
                        <p className="text-xs text-green-600">지원금</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <AIAdvicePanel
              advice="이번 달 지원금 집행률이 60%입니다. 잔여 12,000,000원을 45일 내 집행하려면 월 약 8,000,000원 페이스가 필요합니다."
              generatedAt="2026-06"
            />

            <Card>
              <CardContent className="p-4">
                <p className="text-sm font-medium text-gray-700">빠른 작업</p>
                <div className="mt-3 space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2" asChild>
                    <Link href="/cards/import">카드 내역 가져오기</Link>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 border-green-200 text-green-700 hover:bg-green-50" asChild>
                    <Link href="/subsidies">사업비 사용내역서 작성</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
