// Backtest vs live: the expected stats a saved backtest gives a playbook, and how live trading compares.
import { computeMetrics } from './metrics';
import type { PlaybookExpectedStats } from './store';
import type { JobOutput } from './types';
import type { JournalEntry } from '../types';
import { toMs } from './whatif';
import { eligible, netOf, realizedR } from '../components/journal/journalMath';

export function expectedFromRun(playbookId: string, runId: string, runName: string, symbol: string, o: JobOutput): PlaybookExpectedStats {
  const r = o.result;
  const m = computeMetrics(r.trades, r.startBalance, r.rangeStart, r.rangeEnd);
  const rs = r.trades.map((t) => t.r);
  const mu = rs.length ? rs.reduce((a, b) => a + b, 0) / rs.length : 0;
  const stdR = rs.length > 1 ? Math.sqrt(rs.reduce((a, x) => a + (x - mu) ** 2, 0) / (rs.length - 1)) : 1;
  return { playbookId, runId, runName, savedAt: new Date().toISOString(), trades: m.trades, winRate: m.winRate, avgR: m.avgR, pf: m.profitFactor, maxDDPct: m.maxDDPct, stdR, symbol };
}

export interface LiveStats { trades: number; winRate: number; avgR: number; pf: number | null; maxDDPct: number | null; cumR: number[]; net: number }

export function liveStats(entries: JournalEntry[], playbookName: string): LiveStats {
  const list = entries.filter((e) => e.strategy === playbookName && eligible(e) && realizedR(e) !== null)
    .sort((a, b) => (a.entryTime || a.date).localeCompare(b.entryTime || b.date));
  const ms = (e: JournalEntry) => toMs(e.exitTime || e.entryTime, e.date);
  const m = computeMetrics(list.map((e) => ({ entryTime: ms(e), exitTime: ms(e), net: netOf(e), r: realizedR(e) })), 1);
  let c = 0;
  const cumR = list.map((e) => (c += realizedR(e) ?? 0));
  return { trades: m.trades, winRate: m.winRate, avgR: m.avgR, pf: m.profitFactor, maxDDPct: null, cumR, net: m.netPnl };
}

export type Health = 'on-track' | 'behind' | 'too-few' | 'untested';
export const HEALTH_LABEL: Record<Health, string> = { 'on-track': 'On track', behind: 'Underperforming', 'too-few': 'Too few live trades', untested: 'Not tested yet' };

/** Live cumulative R is on track while it stays above the backtest's expected range (mean − 2 standard deviations). */
export function healthOf(live: LiveStats, exp: PlaybookExpectedStats | undefined): { health: Health; gapR: number; lower: number; upper: number } {
  if (!exp) return { health: 'untested', gapR: 0, lower: 0, upper: 0 };
  const n = live.trades;
  const lower = exp.avgR * n - 2 * exp.stdR * Math.sqrt(n);
  const upper = exp.avgR * n + 2 * exp.stdR * Math.sqrt(n);
  const last = live.cumR[live.cumR.length - 1] ?? 0;
  if (n < 5) return { health: 'too-few', gapR: live.avgR - exp.avgR, lower, upper };
  return { health: last >= lower ? 'on-track' : 'behind', gapR: live.avgR - exp.avgR, lower, upper };
}
