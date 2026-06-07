import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { formatKrw } from "@/lib/vat";

const MOCK_EXPENSES = [
  { month: "2026-04", category: "지급수수료 > 기자재사용료", actual: 232_040, planned: 300_000 },
  { month: "2026-04", category: "지급수수료 > 광고비", actual: 1_500_000, planned: 1_000_000 },
  { month: "2026-04", category: "재료비 > 기자재구입비", actual: 4_490_000, planned: 5_000_000 },
  { month: "2026-04", category: "현금 > 출장여비", actual: 150_000, planned: 200_000 },
];

export default function ExpensesPage() {
  const totalActual = MOCK_EXPENSES.reduce((s, e) => s + e.actual, 0);
  const totalPlanned = MOCK_EXPENSES.reduce((s, e) => s + e.planned, 0);

  return (
    <div className="flex flex-col">
      <Header title="비용 계획" description="실적 vs 계획 비교">
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          비용 계획 입력
        </Button>
      </Header>

      <div className="space-y-6 p-6">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-gray-400">이번 달 실지출</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900">{formatKrw(totalActual)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-gray-400">이번 달 계획</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900">{formatKrw(totalPlanned)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-gray-400">집행률</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-blue-600">
                {Math.round((totalActual / totalPlanned) * 100)}%
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">세목별 비용 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-400">
                  <th className="pb-3 font-medium">카테고리</th>
                  <th className="pb-3 text-right font-medium">실지출</th>
                  <th className="pb-3 text-right font-medium">계획</th>
                  <th className="pb-3 text-right font-medium">차이</th>
                  <th className="pb-3 font-medium">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {MOCK_EXPENSES.map((e, i) => {
                  const diff = e.actual - e.planned;
                  const overBudget = diff > 0;
                  return (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="py-3 text-gray-700">{e.category}</td>
                      <td className="py-3 text-right tabular-nums font-semibold text-gray-900">{formatKrw(e.actual)}</td>
                      <td className="py-3 text-right tabular-nums text-gray-500">{formatKrw(e.planned)}</td>
                      <td className={`py-3 text-right tabular-nums font-semibold ${overBudget ? "text-red-500" : "text-green-600"}`}>
                        {overBudget ? "+" : ""}{formatKrw(diff)}
                      </td>
                      <td className="py-3">
                        {overBudget ? (
                          <Badge variant="destructive">초과</Badge>
                        ) : (
                          <Badge variant="success">정상</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
