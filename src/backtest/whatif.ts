// What-if on real journal trades: change one rule and compare with what actually happened.
// Rules that only need the trade list (losses per day, daily loss, hours, mistake tags) are exact.
// Rules that depend on price movement inside a trade (stop, target, breakeven) use a path rebuilt
// from the trade's entry, stop, exit and times, and are labelled as estimates.
import type { JournalEntry } from '../types';
import { computeMetrics, Metrics } from './metrics';
import { hashSeed, normal, rng } from './rng';

export type WhatIfRule =
  | { kind: 'stop'; mult: number }
  | { kind: 'target'; r: number }
  | { kind: 'breakeven'; r: number }
  | { kind: 'lossesPerDay'; n: number }
  | { kind: 'dailyLoss'; usd: number }
  | { kind: 'hours'; start: number; end: number }
  | { kind: 'mistakes'; tags: string[] };

export const ESTIMATED_RULES: WhatIfRule['kind'][] = ['stop', 'target', 'breakeven'];

export interface WhatIfTrade {
  id: string; symbol: string; strategy: string; direction: 'BUY' | 'SELL'; entryTime: number; exitTime: number;
  actualNet: number; actualR: number | null; newNet: number; newR: number | null;
  status: 'same' | 'changed' | 'skipped'; note: string; mistakes: string[];
}

export interface WhatIfOutput {
  trades: WhatIfTrade[];
  actual: Metrics;
  whatIf: Metrics;
  changed: number;
  skipped: number;
  lossesAvoided: number;
  winsForfeited: number;
  saved: number; // whatIf net − actual net
  estimated: boolean;
}

export const toMs = (iso: string | undefined, date: string, fallbackHour = 12) =>
  iso ? Date.parse(iso.endsWith('Z') ? iso : `${iso}Z`) : Date.parse(`${date}T${String(fallbackHour).padStart(2, '0')}:00:00Z`);

/** Dollar risk of a journal trade (1R). */
export function riskOf(e: JournalEntry, fallback: number): number {
  if (e.rMultiple !== null && Math.abs(e.rMultiple) > 0.05 && e.pnl !== 0) return Math.abs(e.pnl / e.rMultiple);
  return fallback;
}

/**
 * Rebuild a plausible path of the trade in R units (0 = entry, −1 = original stop) from entry to its
 * final result. The path never touches the original stop or target before the exit unless that is how
 * the trade ended. Seeded by the trade id, so it is the same every time.
 */
export function pathOf(e: JournalEntry, steps = 48): number[] {
  const end = e.rMultiple ?? 0;
  const r = rng(hashSeed(e.id));
  const tpR = e.takeProfit && e.stopPrice ? Math.abs(e.takeProfit - e.entryPrice) / Math.max(1e-9, Math.abs(e.entryPrice - e.stopPrice)) : null;
  const sigma = 0.75 / Math.sqrt(steps);
  const w = [0];
  for (let k = 1; k <= steps; k++) w.push(w[k - 1] + sigma * normal(r));
  const dev = w.map((x, k) => x - (k / steps) * w[steps]); // Brownian bridge: 0 at both ends
  const ok = (f: number) => dev.every((d, k) => {
    if (k === 0 || k === steps) return true;
    const p = (k / steps) * end + f * d;
    if (p <= -0.98) return false; // the original stop was not hit before the exit
    if (tpR !== null && end < tpR - 0.02 && p >= tpR) return false;
    return true;
  });
  let f = 1;
  for (let tries = 0; tries < 30 && !ok(f); tries++) f *= 0.8;
  if (!ok(f)) f = 0;
  return dev.map((d, k) => (k / steps) * end + f * d);
}

export function runWhatIf(entries: JournalEntry[], rule: WhatIfRule, startBalance = 10000): WhatIfOutput {
  const closed = entries.filter((e) => e.outcome !== 'open' && e.exitPrice !== null)
    .map((e) => ({ e, t0: toMs(e.entryTime, e.date), t1: toMs(e.exitTime, e.date, 13) }))
    .sort((a, b) => a.t0 - b.t0);
  const risks = closed.map(({ e }) => riskOf(e, NaN)).filter(Number.isFinite).sort((a, b) => a - b);
  const medRisk = risks.length ? risks[Math.floor(risks.length / 2)] : 100;

  const dayLosses = new Map<string, number>();
  const dayPnl = new Map<string, number>();
  const out: WhatIfTrade[] = closed.map(({ e, t0, t1 }) => {
    const risk = riskOf(e, medRisk);
    const base: WhatIfTrade = {
      id: e.id, symbol: e.symbol, strategy: e.strategy, direction: e.direction, entryTime: t0, exitTime: Math.max(t1, t0),
      actualNet: e.pnl, actualR: e.rMultiple, newNet: e.pnl, newR: e.rMultiple, status: 'same', note: '', mistakes: e.mistakes,
    };
    const skip = (note: string): WhatIfTrade => ({ ...base, newNet: 0, newR: null, status: 'skipped', note });
    const change = (rr: number, note: string): WhatIfTrade => (Math.abs(rr - (e.rMultiple ?? 0)) < 0.005 ? base : { ...base, newNet: Math.round(rr * risk * 100) / 100, newR: rr, status: 'changed', note });
    const day = e.date;
    const record = (t: WhatIfTrade) => {
      if (t.status !== 'skipped') {
        if (t.newNet < 0) dayLosses.set(day, (dayLosses.get(day) || 0) + 1);
        dayPnl.set(day, (dayPnl.get(day) || 0) + t.newNet);
      }
      return t;
    };
    switch (rule.kind) {
      case 'lossesPerDay':
        if ((dayLosses.get(day) || 0) >= rule.n) return record(skip(`Skipped: already ${rule.n} loss${rule.n === 1 ? '' : 'es'} that day`));
        return record(base);
      case 'dailyLoss':
        if ((dayPnl.get(day) || 0) <= -rule.usd) return record(skip(`Skipped: daily loss of $${rule.usd} already reached`));
        return record(base);
      case 'hours': {
        const h = new Date(t0).getUTCHours() + new Date(t0).getUTCMinutes() / 60;
        const inside = rule.start < rule.end ? h >= rule.start && h < rule.end : h >= rule.start || h < rule.end;
        return record(inside ? base : skip('Skipped: outside allowed hours'));
      }
      case 'mistakes': {
        const hit = [...e.mistakes, ...e.tags].find((m) => rule.tags.includes(m));
        return record(hit ? skip(`Skipped: tagged "${hit}"`) : base);
      }
      default: {
        if (e.rMultiple === null) return record(base);
        const path = pathOf(e);
        if (rule.kind === 'stop') {
          const k = path.findIndex((p) => p <= -rule.mult);
          return record(k >= 0 && k < path.length - 1 ? change(-rule.mult, `Stopped at −${rule.mult}R by the tighter stop`) : base);
        }
        if (rule.kind === 'target') {
          const k = path.findIndex((p) => p >= rule.r);
          return record(k >= 0 ? change(rule.r, `Took profit at ${rule.r}R`) : base);
        }
        const k = path.findIndex((p) => p >= rule.r);
        if (k < 0) return record(base);
        const back = path.slice(k + 1).some((p) => p <= 0);
        return record(back ? change(0, `Closed at breakeven after reaching ${rule.r}R`) : base);
      }
    }
  });

  const mt = (sel: 'actual' | 'new') => out.filter((t) => sel === 'actual' || t.status !== 'skipped').map((t) => ({ entryTime: t.entryTime, exitTime: t.exitTime, net: sel === 'actual' ? t.actualNet : t.newNet, r: sel === 'actual' ? t.actualR : t.newR }));
  const rs = closed[0]?.t0;
  const re = closed.length ? Math.max(...closed.map((c) => Math.max(c.t1, c.t0))) + 1 : undefined;
  const actual = computeMetrics(mt('actual'), startBalance, rs, re);
  const whatIf = computeMetrics(mt('new'), startBalance, rs, re);
  const diff = out.filter((t) => t.status !== 'same');
  return {
    trades: out,
    actual, whatIf,
    changed: out.filter((t) => t.status === 'changed').length,
    skipped: out.filter((t) => t.status === 'skipped').length,
    lossesAvoided: diff.filter((t) => t.actualNet < 0 && t.newNet > t.actualNet).length,
    winsForfeited: diff.filter((t) => t.actualNet > 0 && t.newNet < t.actualNet).length,
    saved: whatIf.netPnl - actual.netPnl,
    estimated: ESTIMATED_RULES.includes(rule.kind),
  };
}

export function describeWhatIf(rule: WhatIfRule): string {
  switch (rule.kind) {
    case 'stop': return `Stop at ${rule.mult}R instead of 1R (tighter stop)`;
    case 'target': return `Take profit at ${rule.r}R`;
    case 'breakeven': return `Move the stop to breakeven at ${rule.r}R`;
    case 'lossesPerDay': return `Stop trading after ${rule.n} loss${rule.n === 1 ? '' : 'es'} a day`;
    case 'dailyLoss': return `Stop trading after losing $${rule.usd} in a day`;
    case 'hours': return `Only trade ${String(rule.start).padStart(2, '0')}:00–${String(rule.end).padStart(2, '0')}:00 UTC`;
    case 'mistakes': return `Skip trades tagged ${rule.tags.map((t) => `"${t}"`).join(', ') || '(none chosen)'}`;
  }
}
