// Backtest vs live: the expected stats a saved backtest gives a playbook, and how live trading compares.
import { computeMetrics } from './metrics';
import type { PlaybookExpectedStats } from './store';
import type { JobOutput } from './types';
import type { BacktestSettings } from './types';
import type { JournalEntry } from '../types';
import { toMs } from './whatif';
import { eligible, netOf, realizedR } from '../components/journal/journalMath';
import { currencyOf } from '../components/journal/journalMath';
import { canonicalInstrument } from '../components/journal/instrumentMatching';

export function expectedFromRun(playbookId: string, runId: string, runName: string, symbol: string, o: JobOutput, version?: string, settings?:BacktestSettings): PlaybookExpectedStats {
  const r = o.result;
  const m = computeMetrics(r.trades, r.startBalance, r.rangeStart, r.rangeEnd);
  const rs = r.trades.map((t) => t.r);
  const mu = rs.length ? rs.reduce((a, b) => a + b, 0) / rs.length : 0;
  const stdR = rs.length > 1 ? Math.sqrt(rs.reduce((a, x) => a + (x - mu) ** 2, 0) / (rs.length - 1)) : 1;
  return { playbookId, runId, runName, savedAt: new Date().toISOString(), trades: m.trades, winRate: m.winRate, avgR: m.avgR, pf: m.profitFactor, maxDDPct: m.maxDDPct, stdR, symbol, currency: r.currency, playbookVersion: version, dataSource: 'generated-demo',settingsSnapshot:settings };
}

export interface LiveStats { trades: number; winRate: number; avgR: number; pf: number | null; maxDDPct: number | null; cumR: number[]; net: number; playbookVersion?: string }

export interface LiveScope { symbol?:string; currency?:string; playbookId?:string; playbookVersion?:string }
export function matchingLiveEntries(entries:JournalEntry[],playbookName:string,scope?:LiveScope) {
  return entries.filter((e) =>
    (scope?.playbookId && e.playbookId ? e.playbookId === scope.playbookId : e.strategy === playbookName) &&
    eligible(e) && realizedR(e) !== null &&
    (!scope?.symbol || canonicalInstrument(e.symbol) === canonicalInstrument(scope.symbol)) &&
    (!scope?.currency || currencyOf(e) === scope.currency) &&
    (!scope?.playbookVersion || e.playbookVersion === scope.playbookVersion))
    .sort((a, b) => (a.exitTime || a.entryTime || a.date).localeCompare(b.exitTime || b.entryTime || b.date));
}
export function liveStats(entries: JournalEntry[], playbookName: string, scope?: LiveScope): LiveStats {
  const list=matchingLiveEntries(entries,playbookName,scope);
  const ms = (e: JournalEntry) => toMs(e.exitTime || e.entryTime, e.date);
  const m = computeMetrics(list.map((e) => ({ entryTime: ms(e), exitTime: ms(e), net: netOf(e), r: realizedR(e) })), 1);
  let c = 0;
  const cumR = list.map((e) => (c += realizedR(e) ?? 0));
  return { trades: m.trades, winRate: m.winRate, avgR: m.avgR, pf: m.profitFactor, maxDDPct: null, cumR, net: m.netPnl, playbookVersion: scope?.playbookVersion };
}

export type Health = 'on-track' | 'behind' | 'too-few' | 'untested' | 'demo-reference' | 'outdated';
export const HEALTH_LABEL: Record<Health, string> = { 'on-track': 'On track', behind: 'Underperforming', 'too-few': 'Too few live trades', untested: 'No scoped reference', 'demo-reference': 'Demo reference only', outdated: 'Rules changed · reference outdated' };

/** Generated and unscoped references cannot classify live strategy health. */
export function healthOf(live: LiveStats, exp: PlaybookExpectedStats | undefined): { health: Health; gapR: number; lower: number; upper: number } {
  if (!exp) return { health: 'untested', gapR: 0, lower: 0, upper: 0 };
  if (!exp.currency || !exp.playbookVersion || exp.dataSource!=='generated-demo') return { health: 'untested', gapR: 0, lower: 0, upper: 0 };
  if (live.playbookVersion && live.playbookVersion !== exp.playbookVersion) return { health: 'outdated', gapR: 0, lower: 0, upper: 0 };
  return { health: 'demo-reference', gapR: live.avgR - exp.avgR, lower: 0, upper: 0 };
}
