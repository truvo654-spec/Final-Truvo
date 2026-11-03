// Browser storage for the Backtesting module until a backend exists.
// Entities follow the spec: BacktestRun (with its BacktestTrades), ReplaySession, WhatIfRun, PlaybookExpectedStats.
import { POINTS } from './config';
import { computeMetrics } from './metrics';
import { BacktestSettings, JobOutput } from './types';
import type { WhatIfOutput, WhatIfRule } from './whatif';
import type { RecommendationGoal } from './recommender';
import LZString from 'lz-string';
const COMPRESSED_RUNS='ms-lz1:';

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
  engineVersion?:number;
  activeMs?:number;activityId?:string;
  sourceTradeIds?: string[];
  dataSource?: 'generated';
  timezone?: string;
  playbookFingerprint?: string;
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

export function loadRuns():BacktestRun[]{
  try{
    const raw=localStorage.getItem(KEYS.runs);if(!raw)return [];
    const value=JSON.parse(raw.startsWith(COMPRESSED_RUNS)?LZString.decompressFromUTF16(raw.slice(COMPRESSED_RUNS.length)):raw);
    return Array.isArray(value)?value:[];
  }catch{return [];}
}

/** Keep the latest comparison complete, even when it contains more than 30 results. */
export function retainRuns(runs:BacktestRun[]) {
 const activity=runs[0]?.activityId;
 const latestCount=activity?runs.filter(run=>run.activityId===activity).length:1;
 return runs.slice(0,Math.max(30,latestCount));
}

/** Never report success after silently dropping results or truncating trade history. */
export function saveRuns(runs: BacktestRun[]): boolean {
  try{localStorage.setItem(KEYS.runs,COMPRESSED_RUNS+LZString.compressToUTF16(JSON.stringify(retainRuns(runs))));return true;}
  catch{return false;}
}

// ── Monthly usage of automated runs ──

/** used: included runs used; prepaid: extra runs bought with credits and not used yet. */
export interface Usage { month: string; used: number; extraPaid: number; prepaid: number }
export const thisMonth = () => new Date().toISOString().slice(0, 7);
export function loadUsage(): Usage {
  const u = read<Usage>(KEYS.usage, { month: thisMonth(), used: 0, extraPaid: 0, prepaid: 0 });
  const count=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)&&v>=0?Math.floor(v):0;
  return {month:thisMonth(),used:u?.month===thisMonth()?count(u.used):0,extraPaid:u?.month===thisMonth()?count(u.extraPaid):0,prepaid:count(u?.prepaid)};
}
export const saveUsage = (u: Usage) => write(KEYS.usage, u);

// ── Replay sessions ──

export interface PracticeTrade { dir: 'long' | 'short'; entry: number; exit: number; size: number; net: number; r: number | null; entryBar: number; exitBar: number; tags: string[]; entryTime?: string; exitTime?: string }
export interface ReplaySession {
  activeMs?:number;startBalance?:number;currency?:string;
  id: string; source: 'random' | 'similar' | 'journal'; symbol: string; label: string; startedAt: string; finishedAt: string | null;
  trades: PracticeTrade[]; net: number; notes: string; tags: string[]; pointsAwarded: boolean; journalTradeId?: string; marketDate?: string; timeframe?: string;
}
export const loadReplay = (): ReplaySession[] => read<ReplaySession[]>(KEYS.replay, []);
export const saveReplay = (list: ReplaySession[]) => write(KEYS.replay, list.slice(0, 100));

// ── What-if runs ──

export interface WhatIfSnapshot {
  version: 1;
  breakdowns?:import('./whatifResults').WhatIfBreakdown[];
  selectedBreakdown?:string;
  demoData?:import('./whatifDemoData').WhatIfDemoMetadata;
  currency: string;
  source: 'user' | 'ai' | 'parameter';
  benchmark: string;
  scope: Record<string,string>;
  goal: RecommendationGoal;
  output: WhatIfOutput;
  training: WhatIfOutput;
  validation: WhatIfOutput | null;
  crossingCount: number;
}
// Optional snapshot preserves older checklist saves without inventing missing evidence.
export interface WhatIfRun { id: string; createdAt: string; rule: WhatIfRule; trades: number; actualNet: number; whatIfNet: number; saved: number; name?:string; snapshot?:WhatIfSnapshot }
export function loadWhatIfs():WhatIfRun[] {
  try {
    const list=JSON.parse(localStorage.getItem(KEYS.whatif)||'[]',(_key,value)=>value&&typeof value==='object'&&Object.keys(value).length===1&&value.__whatIfNumber?({Infinity:Infinity,'-Infinity':-Infinity,NaN:NaN}[value.__whatIfNumber as 'Infinity'|'NaN'|'-Infinity']??value):value);
    return Array.isArray(list)?list:[];
  }catch{return [];}
}
export function saveWhatIfs(list:WhatIfRun[]):boolean {
  try {localStorage.setItem(KEYS.whatif,JSON.stringify(list.slice(0,50),(_key,value)=>typeof value==='number'&&!Number.isFinite(value)?{__whatIfNumber:String(value)}:value));return true;}catch{return false;}
}

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
export interface PracticeFilter { markets: PracticeMarket[]; symbols: string[]; result: 'all' | 'losses' | 'wins'; playbook: string; mistake: string; from?: string; to?: string }
export interface SavedPracticeFilter { id: string; name: string; filter: PracticeFilter }
const PRACTICE_FILTERS = 'ms_backtest_practice_filters_v1';
export const loadPracticeFilters = (): SavedPracticeFilter[] => read<SavedPracticeFilter[]>(PRACTICE_FILTERS, []);
export const savePracticeFilters = (list: SavedPracticeFilter[]) => write(PRACTICE_FILTERS, list.slice(0, 20));
