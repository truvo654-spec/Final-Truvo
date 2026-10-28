import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { JournalEntry } from '../../../types';
import { JOURNAL_ENTRIES } from '../../../data/journalData';
import {
  aggregateInsights, insightsBounds, insightsUrl, readInsightsFilters, zonedParts,
  formatInsightsMoney, type InsightsFilters, type InsightsSettings,
} from '../insights/insightsData';
import { SimpleInsights } from '../insights/SimpleInsights';
import { InsightsLoading } from '../insights/InsightsShared';
import { JournalReportingSettings } from '../insights/JournalReportingSettings';
import { JOURNAL_CARD_REGISTRY, defaultJournalViews, journalCardsFor, migrateJournalViews, updateJournalViews } from '../journalViews';
import type { JournalCardsController } from '../useJournalCards';

const settings: InsightsSettings = { currency: 'USD', timeZone: 'UTC', locale: 'en-GB' };
const filters: InsightsFilters = { range: '30D', account: 'all', side: 'all', asOf: '2026-10-28' };
const trade = (patch: Partial<JournalEntry> = {}): JournalEntry => ({
  id: 'one', date: '2026-10-02', symbol: 'TEST', assetClass: 'Stocks', direction: 'BUY', entryPrice: 10,
  exitPrice: 12, size: 1, pnl: 100, commission: 10, rMultiple: null, outcome: 'win', tradingStatus: 'closed',
  entryTime: '2026-10-01T22:00:00Z', exitTime: '2026-10-02T01:00:00Z',
  accountId: 'A', accountCurrency: 'USD', strategy: 'Test', tags: ['patient'], setupNotes: '',
  emotionBefore: null, emotionAfter: null, followedPlan: null, checklistDone: [], mistakes: [], lessons: '', rating: null, source: 'manual', ...patch,
});
test('closed net results deduct recorded costs; win rate includes breakeven, not open trades', () => {
  const data = aggregateInsights([
    trade(), trade({ id: 'loss', pnl: -30, commission: 10 }), trade({ id: 'be', pnl: 5, commission: 5 }),
    trade({ id: 'open', tradingStatus: 'open', pnl: 10000 }), trade({ id: 'planned', tradingStatus: 'planned' }),
  ], filters, settings);
  assert.equal(data.summary.n, 3);
  assert.equal(data.summary.net, 50);
  assert.equal(data.summary.wins, 1); assert.equal(data.summary.losses, 1); assert.equal(data.summary.breakeven, 1);
  assert.ok(Math.abs(data.summary.winRate! - 100 / 3) < 1e-10);
  assert.equal(data.summary.profitFactor, 2.25);
  assert.equal(data.summary.avgWin, 90); assert.equal(data.summary.avgLoss, 40); assert.equal(data.summary.payoff, 2.25);
  assert.equal(data.coverage.closed, 3);
});
test('profit factor handles no losses, no wins, all breakeven and no observations honestly', () => {
  assert.equal(aggregateInsights([trade()], filters, settings).summary.profitFactor, Infinity);
  assert.equal(aggregateInsights([trade({ pnl: -10 })], filters, settings).summary.profitFactor, 0);
  assert.equal(aggregateInsights([trade({ pnl: 10 })], filters, settings).summary.profitFactor, null);
  const empty = aggregateInsights([], filters, settings).summary;
  assert.equal(empty.winRate, null); assert.equal(empty.payoff, null); assert.equal(empty.avgWin, null);
});
test('calendar, curve, weekdays and weekly totals use exit dates, not journal or entry dates', () => {
  const data = aggregateInsights([trade({ date: '2026-08-01', entryTime: '2026-09-28T22:00:00Z', exitTime: '2026-10-02T01:00:00Z' })], filters, settings);
  assert.equal(data.current.length, 1);
  assert.equal(data.days[0].key, '2026-10-02');
  assert.equal(data.curve[0].key, '2026-10-02');
  assert.equal(data.weekdays[4].net, 90); // Friday exit.
  assert.equal(data.hours[22].n, 1);
  assert.equal(data.heatmap.find(bucket => bucket.key === '0-22')!.n, 1); // Monday entry.
  assert.equal(data.weeks.get('2026-09-28')!.net, 90);
});
test('timezone midnight boundaries move closing date and entry weekday/hour together', () => {
  const entry = trade({ entryTime: '2026-10-01T23:30:00Z', exitTime: '2026-10-02T00:15:00Z' });
  const ny = aggregateInsights([entry], filters, { ...settings, timeZone: 'America/New_York' });
  assert.equal(ny.days[0].key, '2026-10-01');
  assert.equal(ny.hours[19].n, 1);
  assert.equal(ny.heatmap.find(bucket => bucket.key === '3-19')!.n, 1);
  const bangkok = aggregateInsights([entry], filters, { ...settings, timeZone: 'Asia/Bangkok' });
  assert.equal(bangkok.days[0].key, '2026-10-02');
  assert.equal(bangkok.hours[6].n, 1);
  assert.equal(bangkok.heatmap.find(bucket => bucket.key === '4-6')!.n, 1);
  assert.equal(bangkok.summary.net, ny.summary.net);
});
test('DST repeated hour and fractional offsets do not create phantom hours or dates', () => {
  const entries = [
    trade({ id: 'first', entryTime: '2026-11-01T05:30:00Z', exitTime: '2026-11-01T07:00:00Z' }),
    trade({ id: 'second', entryTime: '2026-11-01T06:30:00Z', exitTime: '2026-11-01T08:00:00Z' }),
  ];
  const data = aggregateInsights(entries, { ...filters, asOf: '2026-11-02' }, { ...settings, timeZone: 'America/New_York' });
  assert.equal(data.hours[1].n, 2);
  assert.equal(data.heatmap.find(bucket => bucket.key === '6-1')!.n, 2);
  assert.equal(data.days[0].key, '2026-11-01');
  assert.deepEqual(zonedParts(Date.parse('2026-10-01T18:20:00Z'), 'Asia/Kathmandu'), { date: '2026-10-02', hour: 0, weekday: 4 });
});
test('account, side and date filters feed every aggregate, with exact current/previous equal periods', () => {
  const entries = [
    trade({ id: 'current', accountId: 'A', direction: 'SELL' }),
    trade({ id: 'other-account', accountId: 'B', direction: 'SELL' }),
    trade({ id: 'other-side', accountId: 'A', direction: 'BUY' }),
    trade({ id: 'previous', accountId: 'A', direction: 'SELL', entryTime: '2026-09-10T00:00:00Z', exitTime: '2026-09-10T01:00:00Z', pnl: -20, commission: 0 }),
  ];
  const data = aggregateInsights(entries, { ...filters, account: 'A', side: 'short' }, settings);
  assert.equal(data.bounds.from, '2026-09-29'); assert.equal(data.bounds.to, '2026-10-28');
  assert.equal(data.bounds.previousFrom, '2026-08-30'); assert.equal(data.bounds.previousTo, '2026-09-28');
  assert.deepEqual(data.current.map(trade => trade.entry.id), ['current']);
  assert.equal(data.previousSummary.net, -20);
  for (const list of [data.days, data.weekdays, data.hours, data.heatmap]) assert.equal(list.reduce((sum, bucket) => sum + bucket.n, 0), 1);
  assert.equal(data.curve.at(-1)!.cumulative, data.summary.net);
  assert.equal(data.trends.at(-1)!.net, data.summary.net);
});
test('drawdown is measured from a zero-start realized peak, including an initial loss', () => {
  const entries = [100, -40, -100, 50].map((pnl, i) => trade({ id: String(i), pnl, commission: 0, entryTime: `2026-10-0${i + 1}T00:00:00Z`, exitTime: `2026-10-0${i + 1}T01:00:00Z` }));
  const data = aggregateInsights(entries, filters, settings);
  assert.deepEqual(data.curve.map(point => point.cumulative), [100, 60, -40, 10]);
  assert.deepEqual(data.curve.map(point => point.drawdown), [0, -40, -140, -90]);
  assert.equal(aggregateInsights([trade({ pnl: -10, commission: 0 })], filters, settings).curve[0].drawdown, -10);
});
test('missing data and currencies are explicitly covered, not silently guessed', () => {
  const data = aggregateInsights([
    trade(), trade({ id: 'eur', accountCurrency: 'EUR', pnl: 100000 }),
    trade({ id: 'undated', exitTime: undefined }), trade({ id: 'unknown', pnlKnown: false }),
    trade({ id: 'badcost', commission: -1 }), trade({ id: 'no-fees', commission: undefined }),
    trade({ id: 'no-entry', entryTime: undefined }), trade({ id: 'bad-order', entryTime: '2026-10-03T00:00:00Z' }),
  ], filters, settings);
  assert.equal(data.summary.n, 4);
  assert.equal(data.summary.net, 370);
  assert.equal(data.coverage.otherCurrency, 1); assert.equal(data.coverage.missingExit, 1);
  assert.equal(data.coverage.unknownResult, 1); assert.equal(data.coverage.invalidCosts, 1);
  assert.equal(data.coverage.unknownCosts, 1); assert.equal(data.coverage.missingEntry, 2);
  assert.equal(data.hours.reduce((sum, bucket) => sum + bucket.n, 0), 2);
  const invalid = aggregateInsights([trade({ exitTime: '2026-02-30T12:00:00Z' }), trade({ id: 'date-only', exitTime: '2026-10-02' })], filters, settings);
  assert.equal(invalid.coverage.missingExit, 2);
  assert.equal(invalid.current.length, 0);
});
test('URL filters round-trip, preserve unrelated parameters, reject bad values and anchor dates for sharing', () => {
  const chosen: InsightsFilters = { range: '90D', account: 'Account / A&B', side: 'short', asOf: '2026-10-28' };
  const url = insightsUrl(new URL('http://localhost:3000/trade/journal?journalTest=1&keep=yes'), chosen);
  assert.deepEqual(readInsightsFilters(url.search, '2030-01-01').filters, chosen);
  assert.equal(url.searchParams.get('journalTest'), '1'); assert.equal(url.searchParams.get('keep'), 'yes');
  assert.equal(url.searchParams.get('journalTab'), 'insights');
  const invalid = readInsightsFilters('?insightsRange=oops&insightsSide=wat&insightsAsOf=2026-02-30', '2026-10-28');
  assert.equal(invalid.errors.length, 3); assert.deepEqual(invalid.filters, filters);
  assert.equal(insightsBounds({ ...filters, range: '7D' }, '2026-01-01').from, '2026-10-22');
  assert.equal(insightsBounds({ ...filters, range: 'YTD', asOf: '2024-02-29' }, '2020-01-01').days, 60);
});
test('callouts require at least five observations in every compared group', () => {
  const four = Array.from({ length: 4 }, (_, i) => trade({ id: `four-${i}` }));
  assert.equal(aggregateInsights(four, filters, settings).callouts.length, 0);
  const five = [...four, trade({ id: 'fifth' })];
  assert.ok(aggregateInsights(five, filters, settings).callouts.length > 0);
  const compared = aggregateInsights([...five, ...four.map(entry => ({ ...entry, id: `short-${entry.id}`, direction: 'SELL' as const, pnl: -100 }))], filters, settings);
  assert.equal(compared.callouts.some(callout => callout.id === 'side'), false);
  const both = aggregateInsights([...five, ...five.map(entry => ({ ...entry, id: `short-${entry.id}`, direction: 'SELL' as const, pnl: -100 }))], filters, settings);
  assert.equal(both.callouts.some(callout => callout.id === 'side'), true);
  for (const callout of both.callouts) assert.ok(callout.trades.length >= 5);
});
test('Insights widgets have independent registry identities, persist hide/order, and migrate the old workspace safely', () => {
  let prefs = defaultJournalViews();
  assert.equal(journalCardsFor(prefs, 'insights').length, 7);
  prefs = updateJournalViews(prefs, { type: 'move', tab: 'insights', id: 'insights-calendar', direction: -1 });
  assert.equal(journalCardsFor(prefs, 'insights')[0].id, 'insights-calendar');
  prefs = updateJournalViews(prefs, { type: 'hide', tab: 'insights', id: 'insights-heatmap' });
  assert.equal(journalCardsFor(prefs, 'insights').length, 6);
  const restored = migrateJournalViews(JSON.parse(JSON.stringify(prefs)));
  assert.deepEqual(restored, prefs);
  const legacy = migrateJournalViews({ version: 1, tabs: { insights: { level: 'easy', hidden: ['insights-workspace'], added: [], order: [] } } });
  assert.equal(journalCardsFor(legacy, 'insights').length, 7);
});
test('default screen renders seven widgets with only the requested filters and one-account selector hidden', () => {
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { location: { search: '?journalTab=insights&insightsAsOf=2026-10-28' } } });
  const cards = JOURNAL_CARD_REGISTRY.filter(card => card.tab === 'insights');
  const view: JournalCardsController = {
    cards, level: 'easy', baseLevel: 'easy', error: '', welcomed: true,
    setLevel: () => {}, add: () => {}, hide: () => {}, moveUp: () => {}, moveDown: () => {}, reset: () => {}, dismissWelcome: () => {},
  };
  const html = renderToStaticMarkup(React.createElement(SimpleInsights, {
    entries: JOURNAL_ENTRIES, settings, view, settingsWarnings: [],
    onTradeLog: () => {}, onOpenTrade: () => {}, onOpenTrades: () => {},
  }));
  for (const card of cards) assert.ok(html.includes(`aria-label="${card.title.replace(/&/g, '&amp;')}"`));
  assert.match(html, /Insights date range/); assert.match(html, /Insights side/);
  assert.doesNotMatch(html, /aria-label="Insights account"|SESSION FILTER|Export CSV|Cross analysis matrix/);
  assert.match(html, /overflow-x-auto/);
  assert.equal((renderToStaticMarkup(React.createElement(InsightsLoading)).match(/aria-label="Loading /g) || []).length, 8);
  Reflect.deleteProperty(globalThis, 'window');
});
test('international formatting and selector performance meet the instant-data budget', () => {
  assert.match(formatInsightsMoney(1234.5, { ...settings, currency: 'EUR', locale: 'de-DE' }), /1\.234,50/);
  const rows = Array.from({ length: 5000 }, (_, i) => trade({ id: `bench-${i}`, exitTime: `2026-10-${String(i % 28 + 1).padStart(2, '0')}T23:00:00Z`, entryTime: undefined }));
  const started = performance.now(), data = aggregateInsights(rows, filters, settings), elapsed = performance.now() - started;
  assert.equal(data.current.length, 5000);
  assert.equal(data.summary.net, 450000);
  assert.ok(elapsed < 1000, `Aggregation took ${elapsed.toFixed(1)} ms`);
});
test('profile reporting controls expose the saved IANA timezone and ISO reporting currency', () => {
  const html = renderToStaticMarkup(React.createElement(JournalReportingSettings, {
    user: { timeZone: 'Asia/Kathmandu', preferredCurrency: 'EUR' }, onUpdate: () => {},
  }));
  assert.match(html, /aria-label="Profile journal timezone"/);
  assert.match(html, /aria-label="Profile journal currency"/);
  assert.match(html, /selected="">Asia\/Kathmandu<\/option>/);
  assert.match(html, /<option selected="">EUR<\/option>/);
});
