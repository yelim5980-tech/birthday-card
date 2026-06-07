"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  Landmark,
  PiggyBank,
  TrendingUp,
  Receipt,
  Settings,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "대시보드", icon: LayoutDashboard },
  { href: "/cards", label: "카드 내역", icon: CreditCard },
  { href: "/subsidies", label: "지원사업", icon: Landmark },
  { href: "/budget", label: "예산 관리", icon: PiggyBank },
  { href: "/revenue", label: "매출", icon: TrendingUp },
  { href: "/expenses", label: "비용 계획", icon: Receipt },
  { href: "/settings", label: "설정", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-gray-200 bg-white">
      {/* 로고 */}
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <span className="text-sm font-bold text-white">핏</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">핏코 재무</p>
          <p className="text-xs text-gray-400">청창사 사업비 관리</p>
        </div>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight className="h-3.5 w-3.5 text-blue-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* 결제일 알림 */}
      <div className="border-t border-gray-200 p-4">
        <div className="rounded-lg bg-amber-50 p-3">
          <p className="text-xs font-medium text-amber-800">카드 결제일 안내</p>
          <p className="mt-0.5 text-xs text-amber-600">
            매월 <span className="font-bold">15일</span> 결제
            <br />
            지급요청 마감: 결제 7영업일 전
          </p>
        </div>
      </div>
    </aside>
  );
}
