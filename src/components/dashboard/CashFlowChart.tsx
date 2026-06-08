"use client";

import {
  ComposedChart,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CHART_DATA = [
  { month: "1월", revenue: 12_000_000, expense: 8_200_000, subsidy: 2_000_000, cashFlow: 3_800_000 },
  { month: "2월", revenue: 18_000_000, expense: 9_100_000, subsidy: 3_500_000, cashFlow: 8_900_000 },
  { month: "3월", revenue: 22_000_000, expense: 11_500_000, subsidy: 4_200_000, cashFlow: 10_500_000 },
  { month: "4월", revenue: 45_000_000, expense: 22_000_000, subsidy: 6_350_000, cashFlow: 23_000_000 },
  { month: "5월", revenue: null, expense: null, subsidy: null, cashFlow: null },
  { month: "6월", revenue: null, expense: null, subsidy: null, cashFlow: null },
];

function fmtAxis(v: number) {
  if (v >= 10_000_000) return `${(v / 10_000_000).toFixed(0)}천만`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}백만`;
  return `${v}`;
}

function fmtTooltip(v: number | null) {
  if (v === null) return "-";
  return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", minimumFractionDigits: 0 }).format(v);
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number | null; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-lg text-xs">
      <p className="mb-2 font-semibold text-gray-700">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 py-0.5">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-500 w-16">{p.name}</span>
          <span className="font-semibold tabular-nums text-gray-800">{fmtTooltip(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export function CashFlowChart() {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={CHART_DATA} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={fmtAxis}
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconSize={8}
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            formatter={(v: string) => <span style={{ color: "#6b7280" }}>{v}</span>}
          />

          {/* 매출 면적 */}
          <Area
            type="monotone"
            dataKey="revenue"
            name="매출"
            stroke="#3b82f6"
            fill="#eff6ff"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
          {/* 현금흐름 면적 */}
          <Area
            type="monotone"
            dataKey="cashFlow"
            name="현금흐름"
            stroke="#10b981"
            fill="#ecfdf5"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
          {/* 현금 지출 바 */}
          <Bar
            dataKey="expense"
            name="현금지출"
            fill="#fde68a"
            radius={[3, 3, 0, 0]}
            maxBarSize={32}
          />
          {/* 지원금 집행 바 (적층) */}
          <Bar
            dataKey="subsidy"
            name="지원금집행"
            fill="#6ee7b7"
            radius={[3, 3, 0, 0]}
            maxBarSize={32}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
