"use client";

import { useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AIAdvicePanelProps {
  advice: string | null;
  generatedAt?: string;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function AIAdvicePanel({
  advice,
  generatedAt,
  isLoading,
  onRefresh,
}: AIAdvicePanelProps) {
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
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-7 gap-1.5 text-xs text-purple-700 hover:bg-purple-100"
          >
            <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} />
            새로고침
          </Button>
        )}
      </div>

      <div className="mt-2">
        {isLoading ? (
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
