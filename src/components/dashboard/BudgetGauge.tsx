"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatKrw } from "@/lib/vat";
import { AlertTriangle, TrendingUp } from "lucide-react";

interface BudgetGaugeProps {
  type: "CASH" | "SUBSIDY";
  title: string;
  used: number;
  total: number;
  daysLeft?: number;
  className?: string;
}

export function BudgetGauge({
  type,
  title,
  used,
  total,
  daysLeft,
  className,
}: BudgetGaugeProps) {
  const pct = total > 0 ? Math.min(Math.round((used / total) * 100), 100) : 0;
  const remaining = total - used;

  const isCash = type === "CASH";
  // 현금: 높은 % = 위험. 지원금: 낮은 % = 위험(소진 안됨)
  const isWarning = isCash ? pct >= 80 : (daysLeft !== undefined && daysLeft <= 30 && pct < 80);
  const isDanger = isCash ? pct >= 100 : (daysLeft !== undefined && daysLeft <= 7 && pct < 90);

  const progressColor = isCash
    ? isDanger
      ? "bg-red-500"
      : isWarning
      ? "bg-amber-500"
      : "bg-blue-600"
    : pct >= 80
    ? "bg-green-600"
    : isWarning
    ? "bg-amber-500"
    : "bg-green-400";

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isCash ? (
            <span className="text-sm font-medium text-gray-700">💰 {title}</span>
          ) : (
            <span className="text-sm font-medium text-gray-700">🏛️ {title}</span>
          )}
          {(isWarning || isDanger) && (
            <AlertTriangle
              className={cn("h-3.5 w-3.5", isDanger ? "text-red-500" : "text-amber-500")}
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          {daysLeft !== undefined && (
            <Badge
              variant={daysLeft <= 7 ? "destructive" : daysLeft <= 30 ? "warning" : "secondary"}
              className="text-xs"
            >
              만료 D-{daysLeft}
            </Badge>
          )}
          <span
            className={cn(
              "text-sm font-bold",
              isDanger
                ? "text-red-600"
                : isWarning
                ? "text-amber-600"
                : isCash
                ? "text-blue-600"
                : "text-green-600"
            )}
          >
            {pct}%
          </span>
        </div>
      </div>

      <Progress
        value={pct}
        className="h-2.5 bg-gray-100"
        indicatorClassName={progressColor}
      />

      <div className="flex justify-between text-xs text-gray-500">
        <span>
          {isCash ? "사용" : "집행"}: {formatKrw(used)}
        </span>
        <span>
          {isCash ? "잔여" : "잔여 집행"}: {formatKrw(remaining)}
        </span>
      </div>

      {!isCash && isWarning && (
        <div className="flex items-center gap-1.5 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
          <TrendingUp className="h-3.5 w-3.5 shrink-0" />
          <span>
            잔여 {formatKrw(remaining)}을 {daysLeft}일 내에 집행해야 합니다.
          </span>
        </div>
      )}
    </div>
  );
}
