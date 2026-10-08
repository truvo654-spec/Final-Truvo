// Data for manual replay: a random past date, a past day that looked like today, or one of
// your own journal trades rebuilt bar by bar (with the date hidden).
import type { JournalEntry } from '../types';
import { DATA_END } from './config';
import { aggregate, dayMs, marketData, parseDay, symbolSpec } from './marketData';
import { hashSeed, normal, rng } from './rng';
import { Bar, TF_MS, Timeframe } from './types';
import { pathOf, toMs } from './whatif';

export interface ReplayTrade {
  id: string; direction: 'BUY' | 'SELL'; entry: number; stop: number | null; exit: number; r: number | null; pnl: number;
  entryIndex: number; exitIndex: number; date: string; strategy: string; mistakes: string[];
}

export interface ReplayData {
  id: string;
  source: 'random' | 'similar' | 'journal';
  symbol: string;
  tf: Timeframe;
  bars: Bar[];
  /** Bars 0..start-1 are visible when the session begins. */
  start: number;
  dp: number;
  tick: number;
  multiplier: number;
  sizeUnit: string;
  minSize: number;
  label: string;
  dateLabel: string; // revealed at the end in blind mode
  trade?: ReplayTrade;
}

const toBars = (symbol: string, tf: Timeframe, a: number, b: number): Bar[] => {
  const s = marketData.seriesSync(symbol, tf);
  const out: Bar[] = [];
  for (let i = Math.max(0, a); i < Math.min(s.length, b); i++) out.push({ t: s.t[i], o: s.o[i], h: s.h[i], l: s.l[i], c: s.c[i], v: s.v[i] });
  return out;
};

const fmtDay = (t: number) => new Date(t).toUTCString().slice(0, 16);

function fromFeed(source: ReplayData['source'], symbol: string, tf: Timeframe, idx: number, label: string): ReplayData {
  const spec = symbolSpec(symbol)!;
  const before = 150, after = 300;
  const bars = toBars(spec.symbol, tf, idx - before, idx + after);
  return {
    id: `rp_${Date.now().toString(36)}`, source, symbol: spec.symbol, tf, bars, start: Math.min(before, bars.length - 1),
    dp: spec.priceDp, tick: spec.tickSize, multiplier: spec.multiplier, sizeUnit: spec.sizeUnit, minSize: spec.minSize,
    label, dateLabel: fmtDay(bars[Math.min(before, bars.length - 1)]?.t ?? 0),
  };
}

export function replayRandom(symbol: string, tf: Timeframe, seed = Date.now()): ReplayData {
  const s = marketData.seriesSync(symbol, tf);
  const r = rng(seed >>> 0);
  const idx = 200 + Math.floor(r() * Math.max(1, s.length - 600));
  return fromFeed('random', symbol, tf, idx, 'Random date');
}

/** A past day whose range and direction looked most like the latest day in the data. */
export function replayDaysLikeToday(symbol: string, tf: Timeframe): ReplayData {
  const spec = symbolSpec(symbol)!;
  const base = marketData.seriesSync(spec.symbol, '5m');
  const daily = aggregate(base, '1D');
  const n = daily.length;
  const feat = (i: number) => ({ range: (daily.h[i] - daily.l[i]) / daily.c[i], dir: Math.sign(daily.c[i] - daily.o[i]), prevDir: i ? Math.sign(daily.c[i - 1] - daily.o[i - 1]) : 0, dow: new Date(daily.t[i]).getUTCDay() });
  const today = feat(n - 1);
  let best = -1, bestScore = Infinity;
  for (let i = 1; i < n - 10; i++) {
    const f = feat(i);
    const score = Math.abs(f.range - today.range) / today.range + (f.prevDir === today.prevDir ? 0 : 0.5) + (f.dow === today.dow ? 0 : 0.3);
    if (score < bestScore) { bestScore = score; best = i; }
  }
  const s = marketData.seriesSync(spec.symbol, tf);
  const target = daily.t[Math.max(0, best)] + 7 * 3600000; // that day's London open
  let idx = 0;
  while (idx < s.length - 1 && s.t[idx] < target) idx++;
  return fromFeed('similar', spec.symbol, tf, idx, `A day like ${fmtDay(parseDay(DATA_END)).slice(0, 11)}`);
}

/** Rebuild one of your journal trades as 5-minute bars: 150 bars before the entry, the trade, then 60 bars after. */
export function replayJournalTrade(e: JournalEntry): ReplayData {
  const spec = symbolSpec(e.symbol);
  const dir = e.direction === 'BUY' ? 1 : -1;
  const entry = e.entryPrice;
  const exit = e.exitPrice ?? entry;
  const rDist = e.stopPrice ? Math.abs(entry - e.stopPrice) : entry * 0.003;
  const dp = entry < 10 ? 5 : entry < 500 ? 2 : 1;
  const tick = 10 ** -dp;
  const sig = rDist / 3.2;
  const r = rng(hashSeed(`${e.id}-replay`));
  const step = TF_MS['5m'];
  const t0 = toMs(e.entryTime, e.date);
  const t1 = Math.max(t0 + step * 6, toMs(e.exitTime, e.date, 13));
  const K = Math.max(6, Math.min(120, Math.round((t1 - t0) / step)));
  const round = (x: number) => Math.round(x / tick) * tick;
  const mk = (t: number, o: number, c: number, wick: number, lo?: number, hi?: number): Bar => {
    let h = Math.max(o, c) + Math.abs(normal(r)) * wick;
    let l = Math.min(o, c) - Math.abs(normal(r)) * wick;
    if (lo !== undefined) l = Math.max(l, lo);
    if (hi !== undefined) h = Math.min(h, hi);
    return { t, o: round(o), h: round(Math.max(h, o, c)), l: round(Math.min(l, o, c)), c: round(c), v: Math.round(800 + r() * 600) };
  };
  // Before the entry: a walk that arrives at the entry price.
  const pre: number[] = [entry];
  for (let k = 0; k < 150; k++) pre.unshift(pre[0] - sig * normal(r) * 0.9);
  const bars: Bar[] = [];
  for (let k = 0; k < 150; k++) bars.push(mk(t0 - (150 - k) * step, pre[k], pre[k + 1], sig * 0.5));
  // The trade itself, following a path that matches how it really ended.
  const path = pathOf(e, K).map((p) => entry + dir * p * rDist);
  const stop = e.stopPrice ?? entry - dir * rDist;
  for (let k = 0; k < K; k++) {
    const last = k === K - 1;
    const guardLo = dir === 1 && !last ? stop + tick : undefined;
    const guardHi = dir === -1 && !last ? stop - tick : undefined;
    bars.push(mk(t0 + k * step, path[k], last ? exit : path[k + 1], sig * 0.35, guardLo, guardHi));
  }
  // After the exit.
  let p = exit;
  for (let k = 0; k < 60; k++) { const c = p + sig * normal(r); bars.push(mk(t0 + (K + k) * step, p, c, sig * 0.5)); p = c; }
  return {
    id: `rp_${e.id}_${Date.now().toString(36)}`, source: 'journal', symbol: e.symbol, tf: '5m', bars, start: 150,
    dp, tick, multiplier: spec?.multiplier ?? (e.assetClass === 'Forex' ? 100000 : 1), sizeUnit: spec?.sizeUnit ?? 'units', minSize: spec?.minSize ?? 0.01,
    label: `${e.symbol} · ${e.strategy}`, dateLabel: new Date(t0).toUTCString().slice(0, 22),
    trade: { id: e.id, direction: e.direction, entry, stop: e.stopPrice ?? null, exit, r: e.rMultiple, pnl: e.pnl, entryIndex: 150, exitIndex: 150 + K - 1, date: e.date, strategy: e.strategy, mistakes: e.mistakes },
  };
}

export const replayTimeframes: Timeframe[] = ['5m', '15m', '1h'];
export const dayOfMs = (t: number) => Math.floor(t / dayMs);
