// Engine tests. Run with: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRun, GuardedSeries, LookAheadError, runSync } from '../engine';
import { computeMetrics } from '../metrics';
import { marketData, parseDay, seriesFromBars, sliceSeries } from '../marketData';
import { cond, defaultSettings, price, val } from '../rules';
import { BacktestSettings, Series } from '../types';

const T0 = Date.UTC(2026, 0, 5, 8, 0); // Monday 08:00 UTC
const STEP = 5 * 60000;
const noNews = { isNewsDay: () => false };

type B = [o: number, h: number, l: number, c: number];
const flat: B = [1.095, 1.0955, 1.0945, 1.095];

function series(bars: B[]): Series {
  return seriesFromBars('EUR/USD', '5m', bars.map(([o, h, l, c], i) => ({ t: T0 + i * STEP, o, h, l, c, v: 1000 })));
}

/** Long-only rule: buy when the close crosses above 1.1000; 20-pip stop; 2R target; 1 lot; no costs. */
function settings(over: Partial<BacktestSettings> = {}): BacktestSettings {
  const s = defaultSettings();
  s.symbol = 'EUR/USD';
  s.timeframe = '5m';
  s.session = { id: 'any', start: 0, end: 24 };
  s.weekdays = [1, 2, 3, 4, 5];
  s.news = 'include';
  s.rules = {
    direction: 'long',
    entry: [cond(price('close'), 'crossAbove', val(1.1))],
    entryOrder: { type: 'market' },
    exits: { stop: { type: 'points', value: 20 }, targetR: 2, breakevenAtR: null, breakevenLockR: 0, trailing: null, partial: null, timeExitBars: null, sessionEndExit: false },
    maxTradesPerDay: null,
  };
  s.risk = { ...s.risk, mode: 'fixedQty', qty: 1, startBalance: 100000, dailyLossPct: null, maxDrawdownPct: null };
  s.costs = { enabled: false, brokerId: null, commissionPerSide: 3.5, spread: 0.2, slippage: 0.2, fillModel: 'nextOpen' };
  return { ...s, ...over };
}

/** 20 flat bars, a signal bar closing at 1.1010, then the given bars. */
const scenario = (...after: B[]): B[] => [...Array.from({ length: 20 }, () => flat), [1.095, 1.1012, 1.0948, 1.101], ...after];

const close = (a: number, b: number, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b}`);

test('guarded series refuses to read a future bar', () => {
  const g = new GuardedSeries(series([flat, flat, flat]));
  g.advance(1);
  assert.equal(g.c(1), 1.095);
  assert.throws(() => g.c(2), LookAheadError);
});

test('engine never reads price data beyond the bar it is on', () => {
  const base = sliceSeries(marketData.seriesSync('EUR/USD', '15m'), parseDay('2025-01-01'), parseDay('2025-04-01'));
  let current = () => -1;
  const watch = (arr: Float64Array) => new Proxy(arr, {
    get(target, prop, recv) {
      if (typeof prop === 'string' && /^\d+$/.test(prop) && Number(prop) > current()) throw new LookAheadError(Number(prop), current());
      const v = Reflect.get(target, prop, target);
      return typeof v === 'function' ? v.bind(target) : v;
    },
  });
  const s: Series = { ...base, t: watch(base.t), o: watch(base.o), h: watch(base.h), l: watch(base.l), c: watch(base.c), v: watch(base.v) };
  const st = defaultSettings({ playbook: { name: 'Breakout', style: 'Momentum' } as never });
  st.symbol = 'EUR/USD'; st.timeframe = '15m'; st.session = { id: 'any', start: 0, end: 24 };
  const h = createRun(st, s, noNews);
  current = () => h.guard.current;
  assert.doesNotThrow(() => { while (!h.step(500)); });
  assert.ok(h.result().trades.length > 0);
});

test('a run on a shorter history gives identical trades up to the cut (no look-ahead)', () => {
  const full = sliceSeries(marketData.seriesSync('EUR/USD', '15m'), parseDay('2025-01-01'), parseDay('2025-07-01'));
  const st = defaultSettings({ playbook: { name: 'Trend Pullback', style: 'Trend' } as never });
  st.symbol = 'EUR/USD'; st.timeframe = '15m'; st.session = { id: 'london', start: 7, end: 16 };
  const cutIdx = Math.floor(full.length * 0.6);
  const prefix = { ...full, length: cutIdx, t: full.t.subarray(0, cutIdx), o: full.o.subarray(0, cutIdx), h: full.h.subarray(0, cutIdx), l: full.l.subarray(0, cutIdx), c: full.c.subarray(0, cutIdx), v: full.v.subarray(0, cutIdx) };
  const a = runSync(st, full, noNews).trades;
  const b = runSync(st, prefix, noNews).trades.filter((t) => t.exitReason !== 'end of test');
  assert.ok(b.length > 5, 'needs trades to compare');
  b.forEach((t, k) => {
    assert.equal(a[k].entryTime, t.entryTime);
    assert.equal(a[k].exitTime, t.exitTime);
    close(a[k].net, t.net, 1e-6);
  });
});

test('market order fills at the next bar open; stop exits at the stop price', () => {
  const s = series(scenario([1.1012, 1.103, 1.1005, 1.102], [1.102, 1.103, 1.1, 1.101], [1.101, 1.1015, 1.099, 1.0995]));
  const { trades } = runSync(settings(), s, noNews);
  assert.equal(trades.length, 1);
  const t = trades[0];
  assert.equal(t.entryTime, T0 + 21 * STEP);
  close(t.entryPrice, 1.1012);
  close(t.stopPrice, 1.0992);
  assert.equal(t.exitReason, 'stop');
  close(t.exitPrice, 1.0992);
  close(t.net, -200, 1e-6);
  close(t.r, -1);
});

test('same-close fill model enters at the signal bar close', () => {
  const s = series(scenario([1.1012, 1.103, 1.1005, 1.102], [1.101, 1.1015, 1.0985, 1.0995]));
  const st = settings();
  st.costs.fillModel = 'sameClose';
  const t = runSync(st, s, noNews).trades[0];
  close(t.entryPrice, 1.101);
  assert.equal(t.entryTime, T0 + 21 * STEP);
});

test('a limit order fills only when price trades through it', () => {
  const st = settings();
  st.rules.entryOrder = { type: 'limit', offsetAtr: 0, validBars: 3 }; // limit at the signal close, 1.1010
  const s = series(scenario(
    [1.1015, 1.102, 1.101, 1.1016], // touches 1.1010 exactly: no fill
    [1.1014, 1.1018, 1.1008, 1.1012], // trades through: fill at 1.1010
    [1.1012, 1.1015, 1.098, 1.0985],
  ));
  const t = runSync(st, s, noNews).trades[0];
  assert.equal(t.orderType, 'limit');
  assert.equal(t.entryTime, T0 + 22 * STEP);
  close(t.entryPrice, 1.101);
});

test('costs: commission, spread and slippage reduce P&L by the expected amount', () => {
  const st = settings();
  st.costs = { ...st.costs, enabled: true, commissionPerSide: 3.5, spread: 0.2, slippage: 0.2 };
  const s = series(scenario([1.1012, 1.103, 1.1005, 1.102], [1.101, 1.1015, 1.0985, 1.0995]));
  const t = runSync(st, s, noNews).trades[0];
  close(t.gross, -200, 1e-6); // raw move: 1.1012 → 1.0992, 1 lot
  // spread 0.2 + slippage 0.2 on each side = 0.6 pips = $6, commission $3.50 × 2 = $7
  close(t.costs, 13, 1e-6);
  close(t.net, -213, 1e-6);
  close(t.entryPrice, 1.10123);
});

test('stop is assumed first when stop and target are both hit in one bar', () => {
  const s = series(scenario([1.1012, 1.103, 1.1005, 1.102], [1.102, 1.106, 1.099, 1.1]));
  const t = runSync(settings(), s, noNews).trades[0];
  assert.equal(t.exitReason, 'stop');
  assert.equal(t.ambiguous, true);
  close(t.r, -1);
});

test('target exit when only the target is reached', () => {
  const s = series(scenario([1.1012, 1.103, 1.1005, 1.102], [1.102, 1.106, 1.1, 1.105]));
  const t = runSync(settings(), s, noNews).trades[0];
  assert.equal(t.exitReason, 'target');
  close(t.exitPrice, 1.1052);
  close(t.r, 2);
});

test('zero-trade run explains which rule never triggered', () => {
  const st = settings();
  st.rules.entry = [cond(price('close'), 'gt', val(5))];
  const r = runSync(st, series(scenario()), noNews);
  assert.equal(r.trades.length, 0);
  assert.match(r.zeroTradeReason || '', /No bar met "the close is above 5"/);
});

test('metric formulas match a hand-calculated fixture', () => {
  const day = (d: number) => Date.UTC(2026, 0, 5 + d, 12);
  const trades = [100, -50, 200, -100, 0].map((net, i) => ({ entryTime: day(i) - 3600000, exitTime: day(i), net, r: [1, -0.5, 2, -1, 0][i] }));
  const m = computeMetrics(trades, 1000, Date.UTC(2026, 0, 5), Date.UTC(2026, 0, 10));
  assert.equal(m.trades, 5);
  assert.equal(m.wins, 2); assert.equal(m.losses, 2); assert.equal(m.breakevens, 1);
  close(m.winRate, 0.4);
  close(m.profitFactor!, 300 / 150);
  close(m.avgWin, 150); close(m.avgLoss, -75);
  close(m.expectancy, 0.4 * 150 - 0.4 * 75); // 30
  close(m.avgR, 0.3);
  close(m.netPnl, 150);
  close(m.maxDD, 100); // peak 1250 → 1150
  close(m.maxDDPct, 100 / 1250);
  const rets = [100 / 1000, -50 / 1100, 200 / 1050, -100 / 1250, 0];
  const mu = rets.reduce((a, b) => a + b) / 5;
  const sd = Math.sqrt(rets.reduce((a, r) => a + (r - mu) ** 2, 0) / 4);
  const dd = Math.sqrt(rets.reduce((a, r) => a + Math.min(r, 0) ** 2, 0) / 5);
  close(m.sharpe!, (mu / sd) * Math.sqrt(252));
  close(m.sortino!, (mu / dd) * Math.sqrt(252));
  const ann = (1150 / 1000) ** (365.25 / 5) - 1;
  close(m.calmar!, ann / (100 / 1250), 1e-3);
  assert.equal(m.longestWinStreak, 1);
  assert.equal(m.longestLossStreak, 1);
});
