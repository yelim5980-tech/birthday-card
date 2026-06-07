import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  subValue?: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  className?: string;
  accentColor?: "blue" | "green" | "amber" | "red";
}

export function KpiCard({
  title,
  value,
  subValue,
  trend,
  trendLabel,
  className,
  accentColor = "blue",
}: KpiCardProps) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };

  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up"
      ? "text-green-600"
      : trend === "down"
      ? "text-red-500"
      : "text-gray-400";

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-500 truncate">{title}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 tabular-nums">
              {value}
            </p>
            {subValue && (
              <p className="mt-0.5 text-xs text-gray-500">{subValue}</p>
            )}
          </div>
          {trend && trendLabel && (
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                colors[accentColor]
              )}
            >
              <TrendIcon className={cn("h-3 w-3", trendColor)} />
              <span>{trendLabel}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
