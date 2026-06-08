import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

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

// In-memory cache — persists per server instance
// Production: use ai_advice_cache table in DB
const adviceCache = new Map<string, { advice: string; expiresAt: number }>();

function ruleBasedAdvice(ctx: FinancialContext): string {
  const subsidyPct = Math.round((ctx.subsidyUsed / ctx.subsidyTotal) * 100);
  const revenuePct = Math.round((ctx.revenueActual / ctx.revenueProjected) * 100);

  if (ctx.subsidyDaysLeft <= 30 && subsidyPct < 80) {
    const remaining = ctx.subsidyTotal - ctx.subsidyUsed;
    const perDay = Math.round(remaining / ctx.subsidyDaysLeft);
    return `지원금 만료까지 ${ctx.subsidyDaysLeft}일, 잔여 집행액 ${formatKrw(remaining)}이 남아있습니다. 소진하려면 하루 평균 ${formatKrw(perDay)}씩 집행이 필요합니다.`;
  }

  if (ctx.cashBudgetUsedPct >= 90) {
    return `현금 예산 사용률이 ${ctx.cashBudgetUsedPct}%입니다. 이번 달 추가 지출은 예산 초과로 이어질 수 있으니 주의하세요.`;
  }

  if (ctx.cashBudgetUsedPct >= 80) {
    return `현금 예산의 ${ctx.cashBudgetUsedPct}%를 소진했습니다. 남은 기간 동안 지출 계획을 재검토하세요.`;
  }

  if (revenuePct < 80) {
    return `이번 달 매출 달성률이 ${revenuePct}%입니다. 목표 대비 ${formatKrw(ctx.revenueProjected - ctx.revenueActual)} 부족합니다.`;
  }

  if (subsidyPct >= 90) {
    return `지원금 집행률 ${subsidyPct}% — 협약기간 내 전액 소진 예정입니다. VAT 자부담(${formatKrw(ctx.vatSelfPaid)})을 현금 예산에 확인하세요.`;
  }

  return `매출 달성률 ${revenuePct}%, 지원금 집행률 ${subsidyPct}%로 정상 운영 중입니다.`;
}

function formatKrw(amount: number): string {
  if (amount >= 10_000_000) return `${(amount / 10_000_000).toFixed(0)}천만원`;
  if (amount >= 1_000_000) return `${Math.round(amount / 10_000)}만원`;
  return new Intl.NumberFormat("ko-KR").format(amount) + "원";
}

async function claudeAdvice(ctx: FinancialContext): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return ruleBasedAdvice(ctx);

  const client = new Anthropic({ apiKey });

  const prompt = `당신은 중소기업 재무 어드바이저입니다. 아래 재무 현황을 보고 한국어로 2~3문장 이내의 실용적인 조언을 해주세요. 수치를 직접 언급하고, 가장 시급한 액션 1가지를 제시하세요.

재무 현황:
- 이번 달 현금흐름: ${formatKrw(ctx.cashFlowKrw)}
- 매출: ${formatKrw(ctx.revenueActual)} / 목표 ${formatKrw(ctx.revenueProjected)} (달성률 ${Math.round((ctx.revenueActual/ctx.revenueProjected)*100)}%)
- 지출: ${formatKrw(ctx.expenseActual)} / 계획 ${formatKrw(ctx.expensePlanned)}
- 지원금: ${formatKrw(ctx.subsidyUsed)} 집행 / ${formatKrw(ctx.subsidyTotal)} 협약 (잔여 ${ctx.subsidyDaysLeft}일)
- 현금 예산 사용률: ${ctx.cashBudgetUsedPct}%
- VAT 자부담 누적: ${formatKrw(ctx.vatSelfPaid)}

면책 문구 없이 조언만 출력하세요.`;

  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      messages: [{ role: "user", content: prompt }],
    });

    const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
    return text || ruleBasedAdvice(ctx);
  } catch {
    return ruleBasedAdvice(ctx);
  }
}

export async function POST(req: NextRequest) {
  const ctx: FinancialContext = await req.json();

  // Cache key: coarse hash of context for 4-hour TTL
  const cacheKey = `${Math.floor(ctx.subsidyDaysLeft / 7)}-${Math.floor(ctx.subsidyUsed / 1_000_000)}-${Math.floor(ctx.revenueActual / 1_000_000)}-${ctx.cashBudgetUsedPct}`;
  const cached = adviceCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json({ advice: cached.advice, cached: true });
  }

  const useAI = !!process.env.ANTHROPIC_API_KEY;
  const advice = useAI ? await claudeAdvice(ctx) : ruleBasedAdvice(ctx);

  adviceCache.set(cacheKey, { advice, expiresAt: Date.now() + 4 * 60 * 60 * 1000 });

  return NextResponse.json({ advice, cached: false });
}
