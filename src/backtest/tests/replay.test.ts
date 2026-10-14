import test from 'node:test';
import assert from 'node:assert/strict';
import type { JournalEntry } from '../../types';
import { DEFAULT_FILTER, matchesJournal } from '../../components/backtest/PracticeFilters';
import { replayDaysLikeToday, replayJournalTrade, replayRandom, replayTimeframes } from '../replay';

const trade = (patch: Partial<JournalEntry> = {}): JournalEntry => ({
  id: 'journal-source-1', date: '2026-10-01', entryTime: '2026-10-01T10:00:00Z', exitTime: '2026-10-01T11:00:00Z',
  symbol: 'EUR/USD', assetClass: 'Forex', direction: 'SELL', entryPrice: 1.1, exitPrice: 1.095, size: 0.2,
  quantityUnit: 'lots', stopPrice: 1.105, takeProfit: 1.09, pnl: 100, commission: 4, rMultiple: 1,
  initialRisk: 100, equityAtEntry: 10000, marginAtEntry: 200, outcome: 'win', tradingStatus: 'closed',
  strategy: 'Breakout', tags: ['retest'], mistakes: ['late entry'], setupNotes: 'Wait for candle close',
  emotionBefore: null, emotionAfter: null, followedPlan: true, checklistDone: [], lessons: '', rating: null,
  source: 'manual', accountCurrency: 'USD',
  ...patch,
});

test('journal replay imports recorded trade setup and account evidence without changing the generated-feed label', () => {
  const entry = trade();
  const replay = replayJournalTrade(entry);
  assert.equal(replay.source, 'journal');
  assert.equal(replay.trade?.id, entry.id);
  assert.equal(replay.trade?.direction, entry.direction);
  assert.equal(replay.trade?.entry, entry.entryPrice);
  assert.equal(replay.trade?.stop, entry.stopPrice);
  assert.equal(replay.trade?.takeProfit, entry.takeProfit);
  assert.equal(replay.trade?.size, entry.size);
  assert.equal(replay.trade?.quantityUnit, entry.quantityUnit);
  assert.equal(replay.trade?.commission, entry.commission);
  assert.equal(replay.trade?.initialRisk, entry.initialRisk);
  assert.equal(replay.trade?.equityAtEntry, entry.equityAtEntry);
  assert.equal(replay.trade?.marginAtEntry, entry.marginAtEntry);
  assert.equal(replay.trade?.accountCurrency, entry.accountCurrency);
  assert.equal(replay.trade?.setupNotes, entry.setupNotes);
  assert.deepEqual(replay.trade?.tags, entry.tags);
  assert.match(replay.label, /EUR\/USD/);
});

test('missing user stop, target and account evidence stay absent from the imported replay parameters', () => {
  const replay = replayJournalTrade(trade({
    stopPrice: undefined, takeProfit: undefined, quantityUnit: undefined, commission: undefined,
    initialRisk: null, equityAtEntry: null, marginAtEntry: null, accountCurrency: 'EUR',
  }));
  assert.equal(replay.trade?.stop, null);
  assert.equal(replay.trade?.takeProfit, null);
  assert.equal(replay.trade?.quantityUnit, null);
  assert.equal(replay.trade?.commission, null);
  assert.equal(replay.trade?.initialRisk, null);
  assert.equal(replay.trade?.equityAtEntry, null);
  assert.equal(replay.trade?.marginAtEntry, null);
  assert.equal(replay.trade?.accountCurrency, 'EUR');
});

test('daily bars are available as a replay timeframe', () => {
  assert.deepEqual(replayTimeframes, ['5m', '15m', '1h', '1D']);
  const replay = replayRandom('EUR/USD', '1D', 42);
  assert.equal(replay.tf, '1D');
  assert.ok(replay.bars.length > 100);
  assert.ok(replay.bars.every((bar, index) => index === 0 || bar.t > replay.bars[index - 1].t));
});

test('random replay date bounds constrain the chart to the selected dates', () => {
  const replay = replayRandom('EUR/USD', '1D', 42, { from: '2026-02-01', to: '2026-02-28' });
  const date = new Date(replay.bars[replay.start].t).toISOString().slice(0, 10);
  assert.ok(date >= '2026-02-01' && date <= '2026-02-28', date);
  assert.ok(replay.bars.every((bar) => new Date(bar.t).toISOString().slice(0, 10) <= '2026-02-28'));
});

test('similar-day replay date bounds constrain the chart to the selected dates', () => {
  const replay = replayDaysLikeToday('EUR/USD', '1D', { from: '2025-02-01', to: '2025-02-28' });
  const date = new Date(replay.bars[replay.start].t).toISOString().slice(0, 10);
  assert.ok(date >= '2025-02-01' && date <= '2025-02-28', date);
});

test('similar-day replay keeps equity-market charts inside the selected dates', () => {
  const replay = replayDaysLikeToday('NVDA', '5m', { from: '2025-02-01', to: '2025-02-28' });
  const date = new Date(replay.bars[replay.start].t).toISOString().slice(0, 10);
  assert.ok(date >= '2025-02-01' && date <= '2025-02-28', date);
  assert.ok(replay.bars.every((bar) => new Date(bar.t).toISOString().slice(0, 10) <= '2025-02-28'));
});

test('replay rejects date ranges without feed bars', () => {
  assert.throws(() => replayRandom('EUR/USD', '1D', 42, { from: '2026-10-08', to: '2026-10-12' }), /No replay bars/);
});

test('journal replay filters honor the selected entry date range', () => {
  const entry = trade({ date: '2026-10-01' });
  const filter = { ...DEFAULT_FILTER, result: 'all' as const, from: '2026-10-02', to: '2026-10-10' };
  assert.equal(matchesJournal(entry, filter), false);
  assert.equal(matchesJournal(entry, { ...filter, from: '2026-10-01' }), true);
});
