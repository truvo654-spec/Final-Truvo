// Robustness checks and the verdict.
import { MAX_RULES, MIN_TRADES, MONTE_CARLO_RUNS, OOS_SPLIT, WALK_FORWARD_PERIODS } from './config';
import { computeMetrics, maxDrawdown, MetricTrade, Metrics } from './metrics';
import { rng } from './rng';

export interface OosCheck { splitTime: number; inSample: Metrics; outSample: Metrics; pass: boolean; text: string }
export interface WalkForward { periods: { from: number; to: number; m: Metrics }[]; profitable: number; pass: boolean; text: string }
export interface MonteCarlo { runs: number; median: number; p95: number; worst: number; actual: number; limit: number; pass: boolean; text: string }
export interface Robustness { oos: OosCheck; wf: WalkForward; mc: MonteCarlo }

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
const r2 = (x: number) => `${x >= 0 ? '+' : '−'}${Math.abs(x).toFixed(2)}R`;

export function outOfSample(trades: MetricTrade[], start: number, end: number, bal: number, split = OOS_SPLIT): OosCheck {
  const splitTime = start + (end - start) * split;
  const a = trades.filter((t) => t.entryTime < splitTime);
  const b = trades.filter((t) => t.entryTime >= splitTime);
  const inSample = computeMetrics(a, bal, start, splitTime);
  const outSample = computeMetrics(b, bal, splitTime, end);
  const pass = outSample.trades >= 5 && outSample.avgR > 0 && (outSample.profitFactor === null || outSample.profitFactor >= 1);
  const text = outSample.trades < 5
    ? `Only ${outSample.trades} trades in the last ${Math.round((1 - split) * 100)}% of the range, too few to judge.`
    : pass
      ? `Still profitable on the last ${Math.round((1 - split) * 100)}% of the range: ${r2(outSample.avgR)} per trade over ${outSample.trades} trades (first ${Math.round(split * 100)}%: ${r2(inSample.avgR)}).`
      : `Lost its edge on the last ${Math.round((1 - split) * 100)}% of the range: ${r2(outSample.avgR)} per trade over ${outSample.trades} trades (first ${Math.round(split * 100)}%: ${r2(inSample.avgR)}).`;
  return { splitTime, inSample, outSample, pass, text };
}

export function walkForward(trades: MetricTrade[], start: number, end: number, bal: number, k = WALK_FORWARD_PERIODS): WalkForward {
  const len = (end - start) / k;
  const periods = Array.from({ length: k }, (_, i) => {
    const from = start + i * len, to = from + len;
    return { from, to, m: computeMetrics(trades.filter((t) => t.entryTime >= from && t.entryTime < to), bal, from, to) };
  });
  const profitable = periods.filter((p) => p.m.netPnl > 0).length;
  const need = Math.ceil(k * 0.75);
  return {
    periods, profitable, pass: profitable >= need,
    text: `Same rules, period by period: profitable in ${profitable} of ${k} periods${profitable >= need ? '.' : `; ${need} of ${k} are needed to pass.`}`,
  };
}

export function monteCarlo(trades: MetricTrade[], bal: number, limitPct: number, runs = MONTE_CARLO_RUNS, seed = 7): MonteCarlo {
  const pnl = [...trades].sort((a, b) => a.exitTime - b.exitTime).map((t) => t.net);
  const actual = maxDrawdown(bal, pnl).ddPct;
  const r = rng(seed);
  const dds: number[] = [];
  const arr = pnl.slice();
  for (let k = 0; k < runs; k++) {
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    dds.push(maxDrawdown(bal, arr).ddPct);
  }
  dds.sort((a, b) => a - b);
  const q = (p: number) => (dds.length ? dds[Math.min(dds.length - 1, Math.floor(p * dds.length))] : 0);
  const limit = limitPct / 100;
  const p95 = q(0.95);
  return {
    runs, median: q(0.5), p95, worst: dds[dds.length - 1] ?? 0, actual, limit, pass: p95 < limit,
    text: `Reshuffled ${runs.toLocaleString('en-US')} times: typical drawdown ${pct(q(0.5))}, worst 5% reach ${pct(p95)} (your limit is ${limitPct}%).`,
  };
}

export function robustness(trades: MetricTrade[], start: number, end: number, bal: number, ddLimitPct: number): Robustness {
  return { oos: outOfSample(trades, start, end, bal), wf: walkForward(trades, start, end, bal), mc: monteCarlo(trades, bal, ddLimitPct) };
}

export interface Verdict { label: string; tone: 'good' | 'warn' | 'bad' | 'neutral'; score: number; reasons: string[] }

export function verdictFor(m: Metrics, rob: Robustness, rules: number): Verdict {
  const passes = [rob.oos.pass, rob.wf.pass, rob.mc.pass].filter(Boolean).length;
  let score = 50;
  if (m.profitFactor === null ? m.netPnl > 0 : m.profitFactor >= 1.3) score += 15;
  if (m.avgR > 0.15) score += 10;
  score += passes * 8;
  if (m.netPnl <= 0) score -= 25;
  if (m.trades < MIN_TRADES) score -= 15;
  if (rules > MAX_RULES) score -= 5;
  score = Math.max(0, Math.min(100, Math.round(score)));

  const ratio = m.avgLoss < 0 && m.wins ? m.avgWin / Math.abs(m.avgLoss) : null;
  const payoff = m.trades
    ? `Average result ${r2(m.avgR)} per trade over ${m.trades} trades${ratio !== null ? `; the average winner is ${ratio.toFixed(2)}× the average loser` : ''}.`
    : 'No trades yet.';
  const consistency = `${rob.oos.pass ? 'Held up' : 'Did not hold up'} on unseen data, and was profitable in ${rob.wf.profitable} of ${rob.wf.periods.length} periods.`;
  const risk = `In ${rob.mc.runs.toLocaleString('en-US')} reshuffles of the trade order, the worst 5% of drawdowns reached ${pct(rob.mc.p95)}.`;
  const reasons = [payoff, consistency, risk];

  if (m.trades < MIN_TRADES) return { label: 'Not enough trades yet', tone: 'neutral', score, reasons: [`${m.trades} trades is below the ${MIN_TRADES} needed to trust the numbers. Test a longer range or a lower timeframe.`, consistency, risk] };
  if (m.netPnl <= 0 || m.avgR <= 0) return { label: 'No edge in this test', tone: 'bad', score, reasons };
  if (passes === 3 && (m.profitFactor === null || m.profitFactor >= 1.2)) return { label: 'Durable edge', tone: 'good', score, reasons };
  return { label: 'Fragile edge', tone: 'warn', score, reasons };
}
