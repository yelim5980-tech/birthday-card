import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { formatKrw } from "@/lib/vat";

const MOCK_REVENUE = [
  { month: "2026-01", actual: 12_000_000, projected: 15_000_000 },
  { month: "2026-02", actual: 18_000_000, projected: 15_000_000 },
  { month: "2026-03", actual: 22_000_000, projected: 20_000_000 },
  { month: "2026-04", actual: 45_000_000, projected: 50_000_000 },
  { month: "2026-05", actual: null, projected: 55_000_000 },
  { month: "2026-06", actual: null, projected: 60_000_000 },
];

export default function RevenuePage() {
  const totalActual = MOCK_REVENUE.filter(r => r.actual !== null).reduce((s, r) => s + (r.actual ?? 0), 0);
  const totalProjected = MOCK_REVENUE.reduce((s, r) => s + r.projected, 0);

  return (
    <div className="flex flex-col">
      <Header title="매출 관리" description="실적 vs 계획 비교">
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          매출 입력
        </Button>
      </Header>

      <div className="space-y-6 p-6">
        {/* 요약 */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-gray-400">누적 실적</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900">{formatKrw(totalActual)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-gray-400">연간 목표</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900">{formatKrw(totalProjected)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-gray-400">달성률</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-blue-600">
                {Math.round((totalActual / totalProjected) * 100)}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 월별 테이블 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">월별 매출 실적 vs 계획</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-400">
                  <th className="pb-3 font-medium">월</th>
                  <th className="pb-3 text-right font-medium">실적</th>
                  <th className="pb-3 text-right font-medium">계획</th>
                  <th className="pb-3 text-right font-medium">달성률</th>
                  <th className="pb-3 font-medium">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {MOCK_REVENUE.map((r) => {
                  const achievement = r.actual ? Math.round((r.actual / r.projected) * 100) : null;
                  return (
                    <tr key={r.month} className="hover:bg-gray-50">
                      <td className="py-3 font-medium text-gray-700">{r.month}</td>
                      <td className="py-3 text-right tabular-nums text-gray-900">
                        {r.actual ? formatKrw(r.actual) : <span className="text-gray-300">-</span>}
                      </td>
                      <td className="py-3 text-right tabular-nums text-gray-500">{formatKrw(r.projected)}</td>
                      <td className="py-3 text-right tabular-nums font-semibold">
                        {achievement !== null ? (
                          <span className={achievement >= 100 ? "text-green-600" : achievement >= 80 ? "text-amber-600" : "text-red-500"}>
                            {achievement}%
                          </span>
                        ) : <span className="text-gray-300">-</span>}
                      </td>
                      <td className="py-3">
                        {r.actual === null ? (
                          <Badge variant="secondary">예정</Badge>
                        ) : achievement! >= 100 ? (
                          <Badge variant="success">목표초과</Badge>
                        ) : achievement! >= 80 ? (
                          <Badge variant="warning">진행중</Badge>
                        ) : (
                          <Badge variant="destructive">미달</Badge>
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
