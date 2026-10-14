import test from 'node:test';
import assert from 'node:assert/strict';
import { JOURNAL_ENTRIES } from '../../../data/journalData';
import { runWhatIf, pathOf, type WhatIfRule } from '../../../backtest/whatif';
import { buildCoachCandleComparison, coachCandleSnapshot } from '../coachCandleComparison';
import { eligible } from '../journalMath';

const entry = { ...JOURNAL_ENTRIES.find(entry => eligible(entry))!, id: 'candle-fixture', entryPrice: 100, exitPrice: 102.5, stopPrice: 99, takeProfit: 103, initialRisk: 100, pnl: 250, commission: 0, rMultiple: 2.5, entryTime: '2026-10-01T09:00:00Z', exitTime: '2026-10-01T12:00:00Z' };
const scenario = (rule: WhatIfRule, name = 'S1') => ({ name, description: name, color: '#5338ec', rule, outcome: runWhatIf([entry], rule).trades[0] });

test('candle overlays reconcile with recorded and alternative results on the same path', () => {
  const scenarios = [scenario({ kind: 'target', r: 1 }), scenario({ kind: 'stop', mult: 0.5 }, 'S2'), scenario({ kind: 'hours', start: 0, end: 7 }, 'S3')];
  const model = buildCoachCandleComparison(entry, scenarios)!;
  assert.equal(model.series[0].points.at(-1)!.y, 250);
  scenarios.forEach((candidate, i) => assert.equal(model.series[i + 1].points.at(-1)!.y, candidate.outcome.newNet));
  assert.ok(model.bars.every((bar, i) => [bar.o, bar.h, bar.l, bar.c, bar.t].every(Number.isFinite) && bar.h >= Math.max(bar.o, bar.c) && bar.l <= Math.min(bar.o, bar.c) && (!i || bar.t > model.bars[i - 1].t)));
  const crossing = pathOf(entry).findIndex(value => value >= 1);
  assert.equal(model.exits[0].index, model.start + crossing);
  assert.ok(model.series[3].points.every(point => point.y === 0));
});

test('timeline rewind cannot expose future P&L points or exit markers', () => {
  const model = buildCoachCandleComparison(entry, [scenario({ kind: 'target', r: 1 })])!;
  const snapshot = coachCandleSnapshot(model, model.start + 1);
  const lastTime = model.bars[snapshot.to - 1].t;
  assert.ok(snapshot.series.every(series => series.points.every(point => point.x <= lastTime)));
  assert.ok(snapshot.markers.every(marker => marker.index < snapshot.to));
  assert.ok(!snapshot.markers.some(marker => marker.label === 'ACTUAL' || marker.label === 'S1'));
});

test('missing risk does not invent open P&L and invalid prices cannot create a chart', () => {
  const model = buildCoachCandleComparison({ ...entry, initialRisk: undefined }, [])!;
  assert.equal(model.riskKnown, false);
  assert.ok(model.series[0].points.every(point => point.x >= model.bars[model.exitIndex].t));
  assert.equal(buildCoachCandleComparison({ ...entry, entryPrice: NaN }, []), null);
});

test('missing or malformed timestamps use a finite reconstructed timeline', () => {
  const model = buildCoachCandleComparison({ ...entry, entryTime: 'invalid', exitTime: undefined }, [])!;
  assert.equal(model.timesKnown, false);
  assert.ok(model.bars.every((bar, i) => Number.isFinite(bar.t) && (!i || bar.t > model.bars[i - 1].t)));
  assert.equal(buildCoachCandleComparison({ ...entry, date: 'invalid', entryTime: undefined }, []), null);
});
