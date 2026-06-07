import { AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Alert {
  id: string;
  type: "CASH" | "SUBSIDY" | "INFO";
  severity: "warning" | "danger" | "info";
  message: string;
}

interface AlertPanelProps {
  alerts: Alert[];
}

export function AlertPanel({ alerts }: AlertPanelProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={cn(
            "flex items-start gap-3 rounded-lg border px-4 py-3 text-sm",
            alert.severity === "danger"
              ? "border-red-200 bg-red-50 text-red-800"
              : alert.severity === "warning"
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : "border-blue-200 bg-blue-50 text-blue-800"
          )}
        >
          {alert.severity === "info" ? (
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <div className="flex-1">
            <span
              className={cn(
                "mr-2 inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-semibold",
                alert.type === "CASH"
                  ? "bg-blue-100 text-blue-700"
                  : alert.type === "SUBSIDY"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              )}
            >
              {alert.type === "CASH" ? "현금" : alert.type === "SUBSIDY" ? "지원금" : "정보"}
            </span>
            {alert.message}
          </div>
        </div>
      ))}
    </div>
  );
}
