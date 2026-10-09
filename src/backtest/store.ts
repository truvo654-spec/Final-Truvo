// Browser storage for the Backtesting module until a backend exists.
// Entities follow the spec: BacktestRun (with its BacktestTrades), ReplaySession, WhatIfRun, PlaybookExpectedStats.
import { POINTS } from './config';
import { computeMetrics } from './metrics';
import { BacktestSettings, JobOutput } from './types';
import type { WhatIfRule } from './whatif';

const KEYS = {
  runs: 'ms_backtest_runs_v1',
  usage: 'ms_backtest_usage_v1',
  replay: 'ms_backtest_replay_v1',
  whatif: 'ms_backtest_whatif_v1',
  expected: 'ms_backtest_expected_v1',
  awarded: 'ms_backtest_awarded_v1',
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function write(key: string, value: unknown): boolean {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
}

// ── Backtest runs ──

export interface RunSummary { trades: number; net: number; netPct: number; winRate: number; avgR: number; pf: number | null; maxDDPct: number }

export interface BacktestRun {
  id: string;
  name: string;
  mode: 'automated';
  status: 'done';
  playbookId: string | null;
  symbol: string;
  timeframe: string;
  from: string;
  to: string;
  createdAt: string;
  lastRun: string;
  settings: BacktestSettings;
  summary: RunSummary;
  output: JobOutput;
  pointsAwarded?: boolean;
}

export const summarize = (o: JobOutput): RunSummary => {
  const m = computeMetrics(o.result.trades, o.result.startBalance, o.result.rangeStart, o.result.rangeEnd);
  return { trades: m.trades, net: m.netPnl, netPct: m.netPct, winRate: m.winRate, avgR: m.avgR, pf: m.profitFactor, maxDDPct: m.maxDDPct };
};

export const loadRuns = (): BacktestRun[] => read<BacktestRun[]>(KEYS.runs, []);

/** Saves the list; if storage is full, drops the oldest runs' trade lists until it fits. */
export function saveRuns(runs: BacktestRun[]): boolean {
  const list = runs.slice(0, 30);
  if (write(KEYS.runs, list)) return true;
  const slim = list.map((r, i) => (i < 5 ? r : { ...r, output: { ...r.output, result: { ...r.output.result, trades: r.output.result.trades.slice(0, 200) } } }));
  return write(KEYS.runs, slim);
}

// ── Monthly usage of automated runs ──

/** used: included runs used; prepaid: extra runs bought with credits and not used yet. */
export interface Usage { month: string; used: number; extraPaid: number; prepaid: number }
export const thisMonth = () => new Date().toISOString().slice(0, 7);
export function loadUsage(): Usage {
  const u = read<Usage>(KEYS.usage, { month: thisMonth(), used: 0, extraPaid: 0, prepaid: 0 });
  return u.month === thisMonth() ? { ...u, prepaid: u.prepaid ?? 0 } : { month: thisMonth(), used: 0, extraPaid: 0, prepaid: u.prepaid ?? 0 };
}
export const saveUsage = (u: Usage) => write(KEYS.usage, u);

// ── Replay sessions ──

export interface PracticeTrade { dir: 'long' | 'short'; entry: number; exit: number; size: number; net: number; r: number | null; entryBar: number; exitBar: number; tags: string[] }
export interface ReplaySession {
  id: string; source: 'random' | 'similar' | 'journal'; symbol: string; label: string; startedAt: string; finishedAt: string | null;
  trades: PracticeTrade[]; net: number; notes: string; tags: string[]; pointsAwarded: boolean; journalTradeId?: string;
}
export const loadReplay = (): ReplaySession[] => read<ReplaySession[]>(KEYS.replay, []);
export const saveReplay = (list: ReplaySession[]) => write(KEYS.replay, list.slice(0, 100));

// ── What-if runs ──

export interface WhatIfRun { id: string; createdAt: string; rule: WhatIfRule; trades: number; actualNet: number; whatIfNet: number; saved: number }
export const loadWhatIfs = (): WhatIfRun[] => read<WhatIfRun[]>(KEYS.whatif, []);
export const saveWhatIfs = (list: WhatIfRun[]) => write(KEYS.whatif, list.slice(0, 50));

// ── Playbook expected stats ──

export interface PlaybookExpectedStats {
  playbookId: string; runId: string; runName: string; savedAt: string;
  trades: number; winRate: number; avgR: number; pf: number | null; maxDDPct: number; stdR: number; symbol: string;
}
export const loadExpected = (): Record<string, PlaybookExpectedStats> => read(KEYS.expected, {});
export const saveExpected = (m: Record<string, PlaybookExpectedStats>) => write(KEYS.expected, m);

// ── Points: awarded once per session / run ──

export function claimPoints(kind: 'replay' | 'backtest', id: string): number {
  const done = read<string[]>(KEYS.awarded, []);
  const key = `${kind}:${id}`;
  if (done.includes(key)) return 0;
  write(KEYS.awarded, [...done, key].slice(-500));
  return kind === 'replay' ? POINTS.replaySession : POINTS.savedBacktest;
}

// ── Practice (replay) custom filters ──

export type PracticeMarket = 'Forex' | 'Indices' | 'Commodities' | 'Crypto' | 'Stocks';
export interface PracticeFilter { markets: PracticeMarket[]; symbols: string[]; result: 'all' | 'losses' | 'wins'; playbook: string; mistake: string }
export interface SavedPracticeFilter { id: string; name: string; filter: PracticeFilter }
const PRACTICE_FILTERS = 'ms_backtest_practice_filters_v1';
export const loadPracticeFilters = (): SavedPracticeFilter[] => read<SavedPracticeFilter[]>(PRACTICE_FILTERS, []);
export const savePracticeFilters = (list: SavedPracticeFilter[]) => write(PRACTICE_FILTERS, list.slice(0, 20));
