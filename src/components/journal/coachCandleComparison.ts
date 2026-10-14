import type { JournalEntry } from '../../types';
import type { Bar } from '../../backtest/types';
import type { Marker, PriceLine, LineSeries } from '../backtest/charts';
import { replayJournalTrade } from '../../backtest/replay';
import { pathOf, toMs, type WhatIfRule, type WhatIfTrade } from '../../backtest/whatif';
import { netOf, timestampMs } from './journalMath';

export interface CoachCandleScenario { name: string; description: string; color: string; rule: WhatIfRule; outcome: WhatIfTrade }

/** The candles and scenario exits share the same 48-step estimator used by What-if. */
export function buildCoachCandleComparison(entry: JournalEntry, scenarios: CoachCandleScenario[]) {
  if (!Number.isFinite(entry.entryPrice) || entry.entryPrice <= 0) return null;
  const safeEntry = { ...entry, entryTime: Number.isFinite(timestampMs(entry.entryTime)) ? entry.entryTime : undefined, exitTime: Number.isFinite(timestampMs(entry.exitTime)) ? entry.exitTime : undefined };
  const t0 = toMs(safeEntry.entryTime, entry.date);
  if (!Number.isFinite(t0)) return null;
  const feed = replayJournalTrade(safeEntry);
  const path = pathOf(entry);
  const direction = entry.direction === 'BUY' ? 1 : -1;
  const distance = entry.stopPrice && Math.abs(entry.entryPrice - entry.stopPrice) > 0 ? Math.abs(entry.entryPrice - entry.stopPrice) : entry.entryPrice * 0.003;
  const risk = Number.isFinite(entry.initialRisk) && entry.initialRisk! > 0 ? entry.initialRisk! : null;
  const rawExit = toMs(safeEntry.exitTime, entry.date, 13);
  const t1 = rawExit >= t0 + 48 ? rawExit : t0 + 3600000;
  const step = (t1 - t0) / 48;
  const price = (r: number) => Math.max(feed.tick, entry.entryPrice + direction * r * distance);
  const pre = feed.bars.slice(feed.start - 24, feed.start);
  const start = pre.length;
  const bars: Bar[] = [...pre];
  for (let i = 0; i <= 48; i++) {
    const o = i ? price(path[i - 1]) : entry.entryPrice;
    const c = i === 48 && Number.isFinite(entry.exitPrice) && entry.exitPrice! > 0 ? entry.exitPrice! : price(path[i]);
    bars.push({ t: Math.round(t0 + i * step), o, c, h: Math.max(o, c) + distance * 0.035, l: Math.max(feed.tick, Math.min(o, c) - distance * 0.035), v: feed.bars[feed.start + i]?.v || 0 });
  }
  const exitIndex = start + 48;
  const post = feed.bars.slice(feed.trade!.exitIndex + 1, feed.trade!.exitIndex + 9).map((bar, i) => {
    const o = Number.isFinite(bar.o) && bar.o > 0 ? bar.o : bars[exitIndex].c;
    const c = Number.isFinite(bar.c) && bar.c > 0 ? bar.c : o;
    return { ...bar, t: Math.round(t1 + (i + 1) * Math.max(step, 1)), o, c, h: Math.max(o, c, Number.isFinite(bar.h) ? bar.h : c), l: Math.max(feed.tick, Math.min(o, c, Number.isFinite(bar.l) && bar.l > 0 ? bar.l : c)) };
  });
  bars.push(...post);
  const basePoints = bars.flatMap((bar, i) => {
    if (i >= exitIndex) return [{ x: bar.t, y: netOf(entry) }];
    if (risk == null) return [];
    return [{ x: bar.t, y: i < start ? 0 : path[i - start] * risk }];
  });
  const series: LineSeries[] = [{ name: 'Your recorded trade', color: '#0b1c30', points: basePoints }];
  const markers: Marker[] = [{ index: start, price: entry.entryPrice, kind: direction === 1 ? 'buy' : 'sell' }, { index: exitIndex, price: bars[exitIndex].c, kind: 'exit', label: 'ACTUAL' }];
  const lines: PriceLine[] = [{ price: entry.entryPrice, color: '#64748b', label: 'Entry', dashed: true }];
  if (entry.stopPrice && entry.stopPrice > 0) lines.push({ price: entry.stopPrice, color: '#e11d48', label: 'Your SL', dashed: true });
  if (entry.takeProfit && entry.takeProfit > 0) lines.push({ price: entry.takeProfit, color: '#059669', label: 'Your TP', dashed: true });
  const exits = scenarios.map(scenario => {
    const { rule, outcome } = scenario;
    let k = 48, r = path[48];
    if (outcome.status === 'changed') {
      if (rule.kind === 'target') { k = path.findIndex(value => value >= rule.r); r = rule.r; }
      else if (rule.kind === 'stop') { k = path.findIndex(value => value <= -rule.mult); r = -rule.mult; }
      else if (rule.kind === 'breakeven') { const armed = path.findIndex(value => value >= rule.r); k = path.findIndex((value, i) => i > armed && value <= 0); r = 0; }
    }
    const index = start + (k < 0 ? 48 : k);
    const points = bars.flatMap((bar, i) => {
      if (outcome.status === 'skipped') return [{ x: bar.t, y: 0 }];
      if (i >= index) return [{ x: bar.t, y: outcome.newNet }];
      if (risk == null) return [];
      return [{ x: bar.t, y: i < start ? 0 : path[i - start] * risk }];
    });
    series.push({ name: `${scenario.name} · ${scenario.description}`, color: scenario.color, dashed: true, points });
    if (outcome.status === 'changed') markers.push({ index, price: price(r), kind: 'exit', color: scenario.color, label: scenario.name });
    if (risk != null && rule.kind === 'target') lines.push({ price: price(rule.r), color: scenario.color, label: `${scenario.name} TP`, dashed: true });
    if (risk != null && rule.kind === 'stop') lines.push({ price: price(-rule.mult), color: scenario.color, label: `${scenario.name} SL`, dashed: true });
    return { name: scenario.name, index, status: outcome.status, net: outcome.newNet, note: outcome.note, color: scenario.color };
  });
  return { bars, start, exitIndex, dp: feed.dp, series, markers, lines, exits, riskKnown: risk != null, timesKnown: Number.isFinite(timestampMs(entry.entryTime)) && Number.isFinite(timestampMs(entry.exitTime)) && timestampMs(entry.exitTime) >= timestampMs(entry.entryTime) + 48 };
}

/** Return a chart snapshot without exposing later candles, outcomes or exit markers. */
export function coachCandleSnapshot(model: NonNullable<ReturnType<typeof buildCoachCandleComparison>>, cursor: number) {
  const to = Math.max(1, Math.min(model.bars.length, Math.floor(cursor)));
  const visibleTimes = new Set(model.bars.slice(0, to).map(bar => bar.t));
  return { to, series: model.series.map(series => ({ ...series, points: series.points.filter(point => visibleTimes.has(point.x)) })), markers: model.markers.filter(marker => marker.index < to) };
}
