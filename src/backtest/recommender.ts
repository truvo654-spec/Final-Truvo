import type { BacktestSettings, RunResult } from './types';
import { computeMetrics, type Metrics } from './metrics';
import { resolveSymbol } from './marketData';

export type RecommendationGoal = 'net' | 'drawdown' | 'win';
export interface RecommendationMetrics { netPnl: number; maxDD: number; winRate: number; trades: number }
export interface RecommendationCandidate {
  id: string; name: string; metrics: RecommendationMetrics;
  validation?: { baseline: RecommendationMetrics; candidate: RecommendationMetrics } | null;
  estimated?: boolean;
}
export interface SetupRecommendation {
  status: 'candidate' | 'exploratory' | 'keep' | 'insufficient' | 'incomparable';
  candidate: RecommendationCandidate | null; reason: string;
}
const valid = (m: RecommendationMetrics) => [m.netPnl, m.maxDD, m.winRate, m.trades].every(Number.isFinite) && m.maxDD >= 0 && Number.isInteger(m.trades) && m.trades > 0 && m.winRate >= 0 && m.winRate <= 1;

/** Deterministic, local statistical selection. Validation never influences the selected candidate. */
export function recommendSetup(candidates: RecommendationCandidate[], baseline: RecommendationMetrics, goal: RecommendationGoal, comparable = true): SetupRecommendation {
  if (!comparable) return { status: 'incomparable', candidate: null, reason: 'Match instrument, dates, account currency, balance, position sizing and costs before choosing a winner.' };
  if (!valid(baseline) || baseline.trades < 2) return { status: 'insufficient', candidate: null, reason: 'At least two benchmark trades are needed to explore a candidate. Ten or more selection trades are needed for the candidate badge.' };
  const eligible = candidates.filter(c => valid(c.metrics) && c.metrics.trades >= Math.max(2, Math.ceil(baseline.trades * 0.5)));
  const gain = (m: RecommendationMetrics) => goal === 'drawdown' ? baseline.maxDD - m.maxDD : goal === 'win' ? m.winRate - baseline.winRate : m.netPnl - baseline.netPnl;
  const improving = eligible.filter(c => gain(c.metrics) > 1e-8 && (goal === 'net'
    ? c.metrics.maxDD <= baseline.maxDD + Math.max(baseline.maxDD * 0.25, Math.abs(baseline.netPnl) * 0.05, 1)
    : c.metrics.netPnl >= baseline.netPnl - 1e-8));
  improving.sort((a,b) => gain(b.metrics)-gain(a.metrics) || a.metrics.maxDD-b.metrics.maxDD || a.id.localeCompare(b.id));
  const candidate = improving[0];
  if (!candidate) return { status: 'keep', candidate: null, reason: 'Keep the benchmark. No tested alternative improved this goal while retaining at least half the trades and meeting the risk / net-result guardrail.' };
  const exploratory = baseline.trades < 10 || candidate.metrics.trades < 10;
  return { status: exploratory ? 'exploratory' : 'candidate', candidate,
    reason: goal === 'net' ? 'Highest net improvement among candidates that retain at least half the benchmark trades and stay within the drawdown guardrail.' : goal === 'drawdown' ? 'Lowest drawdown among candidates with net results at least as high as the benchmark and at least half its trades.' : 'Highest win rate among candidates with net results at least as high as the benchmark and at least half its trades.' };
}

/** Session, rules and timeframe may differ intentionally; account and test conditions must match. */
export function comparableSetups(settings: BacktestSettings[]): boolean {
  const stable = (value: unknown): unknown => Array.isArray(value) ? value.map(stable) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,stable(v)])) : value;
  const signature = (s: BacktestSettings) => JSON.stringify(stable({ symbol: resolveSymbol(s.symbol) || s.symbol, from:s.from,to:s.to,risk:s.risk,costs:s.costs,weekdays:[...s.weekdays].sort(),news:s.news,prop:s.prop }));
  return settings.length > 0 && settings.every(s => signature(s) === signature(settings[0]));
}

/** Summarize a completed run without implying an independent validation rerun. */
export function runRecommendationCandidate(id: string, name: string, result: RunResult): RecommendationCandidate {
  const metrics: Metrics = computeMetrics(result.trades, result.startBalance, result.rangeStart, result.rangeEnd);
  return { id, name, metrics };
}
