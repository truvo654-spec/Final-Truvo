import { Trade } from './types';
import { rng } from './marketData';

export interface MonteCarlo {
  runs: number;
  tradesPerRun: number;
  /** Percentile paths of equity, indexed by trade number (0..tradesPerRun). */
  bands: { p5: number[]; p25: number[]; p50: number[]; p75: number[]; p95: number[] };
  finals: number[];
  maxDDs: number[];
  probProfit: number;
  probDD20: number;
  probDD30: number;
  probRuin: number;
  medianFinal: number;
  p5Final: number;
  p95Final: number;
  medianDD: number;
  p95DD: number;
}

const pct = (sorted: number[], p: number) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.round((p / 100) * (sorted.length - 1))))];

/** Reshuffles the strategy's own trades (as % of balance) many times to show how much the order of wins and losses matters. */
export function monteCarlo(trades: Trade[], capital: number, runs = 500, seed = 7): MonteCarlo | null {
  if (trades.length < 5) return null;
  const r = rng(seed);
  const rets = trades.map((t) => t.pnlPct / 100);
  const len = rets.length;
  const paths: number[][] = [];
  const finals: number[] = [];
  const maxDDs: number[] = [];
  for (let k = 0; k < runs; k++) {
    let eq = capital;
    let peak = capital;
    let mdd = 0;
    const path = [eq];
    for (let i = 0; i < len; i++) {
      eq *= 1 + rets[Math.floor(r() * len)];
      path.push(eq);
      peak = Math.max(peak, eq);
      mdd = Math.max(mdd, peak > 0 ? ((peak - eq) / peak) * 100 : 0);
    }
    paths.push(path);
    finals.push(eq);
    maxDDs.push(mdd);
  }
  const bands = { p5: [] as number[], p25: [] as number[], p50: [] as number[], p75: [] as number[], p95: [] as number[] };
  for (let i = 0; i <= len; i++) {
    const col = paths.map((p) => p[i]).sort((a, b) => a - b);
    bands.p5.push(pct(col, 5));
    bands.p25.push(pct(col, 25));
    bands.p50.push(pct(col, 50));
    bands.p75.push(pct(col, 75));
    bands.p95.push(pct(col, 95));
  }
  const sf = [...finals].sort((a, b) => a - b);
  const sd = [...maxDDs].sort((a, b) => a - b);
  return {
    runs,
    tradesPerRun: len,
    bands,
    finals,
    maxDDs,
    probProfit: (finals.filter((f) => f > capital).length / runs) * 100,
    probDD20: (maxDDs.filter((d) => d >= 20).length / runs) * 100,
    probDD30: (maxDDs.filter((d) => d >= 30).length / runs) * 100,
    probRuin: (finals.filter((f) => f < capital * 0.5).length / runs) * 100,
    medianFinal: pct(sf, 50),
    p5Final: pct(sf, 5),
    p95Final: pct(sf, 95),
    medianDD: pct(sd, 50),
    p95DD: pct(sd, 95),
  };
}
