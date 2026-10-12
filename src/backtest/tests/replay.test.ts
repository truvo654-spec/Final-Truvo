import test from 'node:test';
import assert from 'node:assert/strict';
import type { JournalEntry } from '../../types';
import { replayJournalTrade, replayRandom, replayTimeframes } from '../replay';

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
