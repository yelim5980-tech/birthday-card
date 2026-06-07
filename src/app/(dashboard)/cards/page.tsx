import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Upload, CreditCard } from "lucide-react";
import { formatKrw } from "@/lib/vat";

const MOCK_CARDS = [
  {
    id: "1",
    name: "우리카드 Start-Up",
    last4: "3639",
    issuer: "우리",
    isStartupCard: true,
    thisMonthAmount: 4_790_505,
    pendingCount: 3,
  },
];

const MOCK_TRANSACTIONS = [
  { id: "1", date: "2026-04-28", merchant: "FIGMA", amount: 66135, category: "기자재사용료", bimok: "지급수수료", isSubsidy: true, status: "SUBSIDY_LINKED" },
  { id: "2", date: "2026-04-24", merchant: "CLAUDE.AI SUBSCRIPTION", amount: 165905, category: "기자재사용료", bimok: "지급수수료", isSubsidy: true, status: "CATEGORIZED" },
  { id: "3", date: "2026-04-27", merchant: "쿠팡(주)", amount: 1639370, category: "미분류", bimok: null, isSubsidy: false, status: "UNCATEGORIZED" },
  { id: "4", date: "2026-04-24", merchant: "이니시스_애플스토어", amount: 4490000, category: "미분류", bimok: null, isSubsidy: false, status: "UNCATEGORIZED" },
];

const statusLabels: Record<string, { label: string; variant: "default" | "success" | "warning" | "secondary" | "subsidy" }> = {
  UNCATEGORIZED: { label: "미분류", variant: "warning" },
  CATEGORIZED: { label: "분류완료", variant: "secondary" },
  SUBSIDY_LINKED: { label: "지원금 연결", variant: "subsidy" },
  REPORT_GENERATED: { label: "내역서 생성", variant: "success" },
  SUBMITTED: { label: "제출완료", variant: "default" },
};

export default function CardsPage() {
  return (
    <div className="flex flex-col">
      <Header title="카드 내역" description="Start-Up 카드 거래 내역 관리">
        <Button variant="outline" size="sm" className="gap-2" asChild>
          <Link href="/cards/import">
            <Upload className="h-4 w-4" />
            내역 가져오기
          </Link>
        </Button>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          카드 등록
        </Button>
      </Header>

      <div className="space-y-6 p-6">
        {/* 카드 목록 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_CARDS.map((card) => (
            <Card key={card.id} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{card.name}</p>
                      <p className="text-xs text-gray-400">****-{card.last4} · {card.issuer}</p>
                    </div>
                  </div>
                  {card.isStartupCard && (
                    <Badge variant="subsidy" className="text-xs">Start-Up</Badge>
                  )}
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-gray-400">이번 달 결제</p>
                    <p className="text-lg font-bold tabular-nums text-gray-900">
                      {formatKrw(card.thisMonthAmount)}
                    </p>
                  </div>
                  {card.pendingCount > 0 && (
                    <Badge variant="warning">{card.pendingCount}건 미처리</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          <button className="flex h-full min-h-[120px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 p-5 text-sm text-gray-400 transition hover:border-blue-300 hover:text-blue-500">
            <Plus className="h-5 w-5" />
            카드 추가
          </button>
        </div>

        {/* 거래 내역 테이블 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">거래 내역</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs text-gray-400">
                    <th className="pb-3 pr-4 font-medium">날짜</th>
                    <th className="pb-3 pr-4 font-medium">가맹점</th>
                    <th className="pb-3 pr-4 font-medium">비목/세목</th>
                    <th className="pb-3 pr-4 font-medium text-right">금액</th>
                    <th className="pb-3 pr-4 font-medium text-right">공급가액</th>
                    <th className="pb-3 font-medium">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {MOCK_TRANSACTIONS.map((tx) => {
                    const amountExclVat = Math.round(tx.amount / 1.1);
                    const vatAmt = tx.amount - amountExclVat;
                    const s = statusLabels[tx.status];
                    return (
                      <tr key={tx.id} className="group hover:bg-gray-50">
                        <td className="py-3 pr-4 text-gray-500">{tx.date}</td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            {tx.isSubsidy && (
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            )}
                            <span className="font-medium text-gray-800">{tx.merchant}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-gray-500">
                          {tx.bimok ? (
                            <span>{tx.bimok} &gt; {tx.category}</span>
                          ) : (
                            <span className="text-amber-500">미분류</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums font-semibold text-gray-900">
                          {formatKrw(tx.amount)}
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums text-gray-500">
                          {tx.isSubsidy ? (
                            <span className="text-green-600">{formatKrw(amountExclVat)}</span>
                          ) : "-"}
                        </td>
                        <td className="py-3">
                          <Badge variant={s.variant} className="text-xs">{s.label}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
