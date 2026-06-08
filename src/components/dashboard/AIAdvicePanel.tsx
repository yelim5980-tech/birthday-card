"use client";

import { useEffect, useState, useCallback } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FinancialContext {
  cashFlowKrw: number;
  revenueActual: number;
  revenueProjected: number;
  expenseActual: number;
  expensePlanned: number;
  subsidyUsed: number;
  subsidyTotal: number;
  subsidyDaysLeft: number;
  cashBudgetUsedPct: number;
  vatSelfPaid: number;
}

interface AIAdvicePanelProps {
  context: FinancialContext;
  generatedAt?: string;
}

export function AIAdvicePanel({ context, generatedAt }: AIAdvicePanelProps) {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAdvice = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(context),
      });
      const data = await res.json();
      setAdvice(data.advice ?? null);
    } catch {
      setAdvice("재무 현황을 분석할 수 없습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }, [context]);

  useEffect(() => {
    fetchAdvice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-800">AI 재무 요약</span>
          {generatedAt && (
            <span className="text-xs text-purple-500">{generatedAt} 기준</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchAdvice}
          disabled={loading}
          className="h-7 gap-1.5 text-xs text-purple-700 hover:bg-purple-100"
        >
          <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
          새로고침
        </Button>
      </div>

      <div className="mt-2 min-h-[2.5rem]">
        {loading ? (
          <div className="space-y-1.5">
            <div className="h-3 w-3/4 animate-pulse rounded bg-purple-200" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-purple-200" />
          </div>
        ) : advice ? (
          <p className="text-sm text-purple-700">{advice}</p>
        ) : (
          <p className="text-sm text-purple-500">
            데이터를 입력하면 AI 재무 요약이 생성됩니다.
          </p>
        )}
      </div>

      <p className="mt-2.5 text-xs text-purple-400">
        본 분석은 AI가 생성한 참고 정보이며 전문 회계사의 조언을 대체하지 않습니다.
      </p>
    </div>
  );
}
