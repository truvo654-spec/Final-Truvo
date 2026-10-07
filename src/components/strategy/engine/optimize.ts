import { runBacktest } from './backtest';
import { Bar, Condition, Strategy } from './types';
import { cloneStrategy } from './templates';

export interface Tunable {
  id: string;
  label: string;
  get: (s: Strategy) => number | undefined;
  set: (s: Strategy, v: number) => void;
  min: number;
  max: number;
  step: number;
  integer: boolean;
}

const kindName: Record<string, string> = {
  sma: 'SMA',
  ema: 'EMA',
  rsi: 'RSI',
  macd: 'MACD',
  macdSignal: 'MACD signal',
  macdHist: 'MACD histogram',
  bbUpper: 'Upper band',
  bbMid: 'Middle band',
  bbLower: 'Lower band',
  atr: 'ATR',
  stoch: 'Stochastic',
  donchianHigh: 'High breakout',
  donchianLow: 'Low breakout',
};

/** Every number in the strategy that is worth sweeping: indicator lengths, constants, stops and targets. */
export function getTunables(s: Strategy): Tunable[] {
  const out: Tunable[] = [];
  const groups: { key: 'longEntry' | 'shortEntry'; label: string }[] = [
    { key: 'longEntry', label: 'Long' },
    { key: 'shortEntry', label: 'Short' },
  ];
  const addCond = (path: (s: Strategy) => Condition | undefined, tag: string) => {
    (['left', 'right'] as const).forEach((side) => {
      const probe = path(s);
      if (!probe) return;
      const o = probe[side];
      if (['sma', 'ema', 'rsi', 'atr', 'stoch', 'bbUpper', 'bbMid', 'bbLower', 'donchianHigh', 'donchianLow', 'macd', 'macdSignal', 'macdHist'].includes(o.kind)) {
        out.push({
          id: `${tag}.${side}.period`,
          label: `${tag} · ${kindName[o.kind]} length (now ${o.period ?? 14})`,
          get: (st) => path(st)?.[side].period,
          set: (st, v) => {
            const c = path(st);
            if (c) c[side].period = v;
          },
          min: Math.max(2, Math.round((o.period ?? 14) * 0.5)),
          max: Math.max(4, Math.round((o.period ?? 14) * 1.8)),
          step: 1,
          integer: true,
        });
      }
      if (o.kind === 'value') {
        const v0 = o.value ?? 0;
        out.push({
          id: `${tag}.${side}.value`,
          label: `${tag} · level ${v0}`,
          get: (st) => path(st)?.[side].value,
          set: (st, v) => {
            const c = path(st);
            if (c) c[side].value = v;
          },
          min: Math.round(v0 - Math.max(5, Math.abs(v0) * 0.4)),
          max: Math.round(v0 + Math.max(5, Math.abs(v0) * 0.4)),
          step: 1,
          integer: false,
        });
      }
    });
  };
  groups.forEach(({ key, label }) => s[key].conditions.forEach((c, idx) => addCond((st) => st[key].conditions[idx], `${label} rule ${idx + 1}`)));
  s.exit.exitRules.conditions.forEach((c, idx) => addCond((st) => st.exit.exitRules.conditions[idx], `Exit rule ${idx + 1}`));

  if (s.exit.stopLoss.type !== 'none') {
    out.push({ id: 'exit.stop', label: `Stop loss (${s.exit.stopLoss.type === 'atr' ? '× ATR' : s.exit.stopLoss.type})`, get: (st) => st.exit.stopLoss.value, set: (st, v) => (st.exit.stopLoss.value = v), min: Math.max(0.5, +(s.exit.stopLoss.value * 0.5).toFixed(1)), max: +(s.exit.stopLoss.value * 2).toFixed(1), step: 0.5, integer: false });
  }
  if (s.exit.takeProfit.type !== 'none') {
    out.push({ id: 'exit.target', label: `Take profit (${s.exit.takeProfit.type === 'rr' ? '× risk' : s.exit.takeProfit.type})`, get: (st) => st.exit.takeProfit.value, set: (st, v) => (st.exit.takeProfit.value = v), min: Math.max(0.5, +(s.exit.takeProfit.value * 0.5).toFixed(1)), max: +(s.exit.takeProfit.value * 2).toFixed(1), step: 0.5, integer: false });
  }
  if (s.exit.trailing.enabled) {
    out.push({ id: 'exit.trail', label: `Trailing stop (${s.exit.trailing.type === 'atr' ? '× ATR' : 'pips'})`, get: (st) => st.exit.trailing.value, set: (st, v) => (st.exit.trailing.value = v), min: Math.max(0.5, +(s.exit.trailing.value * 0.5).toFixed(1)), max: +(s.exit.trailing.value * 2).toFixed(1), step: 0.5, integer: false });
  }
  if (s.exit.timeExitBars > 0) {
    out.push({ id: 'exit.time', label: 'Time exit (bars)', get: (st) => st.exit.timeExitBars, set: (st, v) => (st.exit.timeExitBars = Math.round(v)), min: Math.max(2, Math.round(s.exit.timeExitBars * 0.5)), max: Math.round(s.exit.timeExitBars * 2), step: 1, integer: true });
  }
  return out;
}

export type GridMetric = 'returnPct' | 'sharpe' | 'maxDrawdownPct' | 'profitFactor' | 'winRate';

export interface GridResult {
  xs: number[];
  ys: number[];
  /** cells[y][x] */
  cells: { value: number; trades: number; returnPct: number; maxDD: number }[][];
  metric: GridMetric;
}

export const linspace = (min: number, max: number, steps: number, integer: boolean): number[] => {
  const out: number[] = [];
  for (let i = 0; i < steps; i++) {
    const v = steps === 1 ? min : min + ((max - min) * i) / (steps - 1);
    out.push(integer ? Math.round(v) : +v.toFixed(2));
  }
  return Array.from(new Set(out));
};

const pick = (m: ReturnType<typeof runBacktest>['metrics'], metric: GridMetric) => {
  const v = m[metric];
  return metric === 'profitFactor' && !isFinite(v) ? 5 : v;
};

/** Runs the strategy for every pair of values. Yields to the browser between rows so the page stays usable. */
export async function runGrid(
  strategy: Strategy,
  bars: Bar[],
  a: Tunable,
  xs: number[],
  b: Tunable,
  ys: number[],
  metric: GridMetric,
  onProgress?: (done: number, total: number) => void
): Promise<GridResult> {
  const cells: GridResult['cells'] = [];
  let done = 0;
  for (const y of ys) {
    const row: GridResult['cells'][number] = [];
    for (const x of xs) {
      const s = cloneStrategy(strategy);
      a.set(s, x);
      b.set(s, y);
      const r = runBacktest(s, bars);
      row.push({ value: pick(r.metrics, metric), trades: r.metrics.trades, returnPct: r.metrics.returnPct, maxDD: r.metrics.maxDrawdownPct });
      done++;
    }
    cells.push(row);
    onProgress?.(done, xs.length * ys.length);
    await new Promise((res) => setTimeout(res, 0));
  }
  return { xs, ys, cells, metric };
}

/** How well the best cell holds up in its neighbourhood. Near 1 means a broad plateau, near 0 a lone spike. */
export function robustness(g: GridResult): { bestX: number; bestY: number; best: number; neighbourMean: number; score: number } {
  const higherBetter = g.metric !== 'maxDrawdownPct';
  let bx = 0;
  let by = 0;
  let best = higherBetter ? -Infinity : Infinity;
  g.cells.forEach((row, y) =>
    row.forEach((c, x) => {
      if (c.trades === 0) return;
      if (higherBetter ? c.value > best : c.value < best) {
        best = c.value;
        bx = x;
        by = y;
      }
    })
  );
  const vals: number[] = [];
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      const c = g.cells[by + dy]?.[bx + dx];
      if (c && c.trades > 0 && !(dx === 0 && dy === 0)) vals.push(c.value);
    }
  const mean = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : best;
  let score = 0;
  if (isFinite(best) && vals.length) {
    if (higherBetter) score = best > 0 ? Math.max(0, Math.min(1, mean / best)) : 0;
    else score = best > 0 ? Math.max(0, Math.min(1, best / Math.max(mean, 0.0001))) : 0;
  }
  return { bestX: bx, bestY: by, best, neighbourMean: mean, score };
}
