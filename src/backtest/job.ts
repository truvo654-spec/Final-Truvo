// One backtest job: load data, run the engine with progress, then test a few small
// rule changes so the verdict can suggest ones that measurably help.
import { MIN_TRADES } from './config';
import { createRun, runSync } from './engine';
import { computeMetrics } from './metrics';
import { dayMs, marketData, parseDay, sliceSeries } from './marketData';
import { deepClone } from './rules';
import { BacktestSettings, JobOutput, RunResult, SESSIONS, Series, Suggestion, TF_MS } from './types';

export function seriesFor(s: BacktestSettings): Series {
  return sliceSeries(marketData.seriesSync(s.symbol, s.timeframe), parseDay(s.from), parseDay(s.to) + dayMs);
}

export function applyPatch(s: BacktestSettings, p: Suggestion['patch']): BacktestSettings {
  const { rulesPatch, exitsPatch, ...rest } = p;
  const next = { ...deepClone(s), ...deepClone(rest) } as BacktestSettings;
  if (rulesPatch) next.rules = { ...next.rules, ...deepClone(rulesPatch) };
  if (exitsPatch) next.rules.exits = { ...next.rules.exits, ...deepClone(exitsPatch) };
  return next;
}

type Candidate = Omit<Suggestion, 'deltaR' | 'trades'>;

export function candidateChanges(s: BacktestSettings, res: RunResult): Candidate[] {
  const out: Candidate[] = [];
  const x = s.rules.exits;
  if (x.targetR) {
    const up = +(x.targetR + 0.5).toFixed(1);
    out.push({ id: 'target-up', label: `Target ${up}R`, detail: `Take profit at ${up}R instead of ${x.targetR}R.`, patch: { exitsPatch: { targetR: up } } });
    if (x.targetR > 1.25) { const dn = +(x.targetR - 0.5).toFixed(1); out.push({ id: 'target-down', label: `Target ${dn}R`, detail: `Take profit at ${dn}R instead of ${x.targetR}R.`, patch: { exitsPatch: { targetR: dn } } }); }
  }
  if (x.stop.type === 'atr') {
    const m = x.stop.mult;
    out.push({ id: 'stop-wider', label: `Stop ${m + 0.5} ATR`, detail: `Give trades more room: stop at ${m + 0.5} × ATR instead of ${m}.`, patch: { exitsPatch: { stop: { type: 'atr', mult: m + 0.5 } } } });
    if (m > 0.75) out.push({ id: 'stop-tighter', label: `Stop ${m - 0.5} ATR`, detail: `Tighter stop: ${m - 0.5} × ATR instead of ${m}.`, patch: { exitsPatch: { stop: { type: 'atr', mult: m - 0.5 } } } });
  }
  if (s.news === 'include') out.push({ id: 'skip-news', label: 'Skip news days', detail: 'Skip days with NFP, CPI or FOMC releases.', patch: { news: 'skip' } });
  if (!x.breakevenAtR) out.push({ id: 'breakeven', label: 'Breakeven at 1R', detail: 'Move the stop to breakeven once a trade is 1R in profit.', patch: { exitsPatch: { breakevenAtR: 1, breakevenLockR: 0 } } });
  if (s.session.id === 'any' && TF_MS[s.timeframe] < dayMs && res.trades.length) {
    const best = (['london', 'ny', 'asia'] as const)
      .map((id) => {
        const l = res.trades.filter((t) => { const h = new Date(t.entryTime).getUTCHours(); return h >= SESSIONS[id].start && h < SESSIONS[id].end; });
        return { id, n: l.length, avg: l.length ? l.reduce((a, t) => a + t.r, 0) / l.length : -Infinity };
      })
      .filter((v) => v.n >= 10)
      .sort((a, b) => b.avg - a.avg)[0];
    if (best) out.push({ id: `session-${best.id}`, label: `${SESSIONS[best.id].label} hours only`, detail: `Only take trades during ${SESSIONS[best.id].label} hours (${SESSIONS[best.id].start}:00–${SESSIONS[best.id].end}:00 UTC).`, patch: { session: { id: best.id, start: SESSIONS[best.id].start, end: SESSIONS[best.id].end } } });
  }
  if (s.rules.direction === 'both') {
    const longs = res.trades.filter((t) => t.direction === 'long'), shorts = res.trades.filter((t) => t.direction === 'short');
    const avg = (l: typeof longs) => (l.length ? l.reduce((a, t) => a + t.r, 0) / l.length : 0);
    if (longs.length >= 10 && shorts.length >= 10) {
      const side = avg(longs) >= avg(shorts) ? 'long' : 'short';
      out.push({ id: `only-${side}`, label: `${side === 'long' ? 'Long' : 'Short'} trades only`, detail: `Drop the ${side === 'long' ? 'short' : 'long'} side, which did worse.`, patch: { rulesPatch: { direction: side } } });
    }
  }
  return out;
}

/** Re-run each candidate on the same data; keep the ones that improve average R without losing most of the trades. */
export function evaluateSuggestions(s: BacktestSettings, series: Series, res: RunResult, onEach?: (done: number, total: number) => void): Suggestion[] {
  const base = computeMetrics(res.trades, res.startBalance, res.rangeStart, res.rangeEnd);
  if (base.trades < 10) return [];
  const cands = candidateChanges(s, res);
  const out: Suggestion[] = [];
  cands.forEach((c, k) => {
    const r = runSync(applyPatch(s, c.patch), series);
    const m = computeMetrics(r.trades, r.startBalance, r.rangeStart, r.rangeEnd);
    const delta = m.avgR - base.avgR;
    if (delta >= 0.03 && m.trades >= Math.max(10, Math.min(MIN_TRADES, base.trades * 0.5)) && m.netPnl > base.netPnl) out.push({ ...c, deltaR: delta, trades: m.trades });
    onEach?.(k + 1, cands.length);
  });
  return out.sort((a, b) => b.deltaR - a.deltaR).slice(0, 3);
}

export interface JobHooks { onProgress?: (p: number) => void; cancelled?: () => boolean; yieldEvery?: () => Promise<void> }

export class CancelledError extends Error { constructor() { super('Backtest cancelled'); this.name = 'CancelledError'; } }

export async function performJob(settings: BacktestSettings, hooks: JobHooks = {}): Promise<JobOutput> {
  hooks.onProgress?.(0.02);
  const series = seriesFor(settings);
  const h = createRun(settings, series);
  const chunk = 4000;
  hooks.onProgress?.(0.05);
  while (!h.step(chunk)) {
    if (hooks.cancelled?.()) throw new CancelledError();
    hooks.onProgress?.(0.05 + 0.75 * (h.done / Math.max(1, h.total)));
    if (hooks.yieldEvery) await hooks.yieldEvery();
  }
  const result = h.result();
  hooks.onProgress?.(0.8);
  const suggestions = evaluateSuggestions(settings, series, result, (d, t) => hooks.onProgress?.(0.8 + 0.2 * (d / t)));
  hooks.onProgress?.(1);
  return { result, suggestions };
}
