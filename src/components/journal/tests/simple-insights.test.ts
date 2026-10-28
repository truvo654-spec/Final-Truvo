import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { JournalEntry } from '../../../types';
import { JOURNAL_ENTRIES } from '../../../data/journalData';
import {
  aggregateInsights, insightsBounds, insightsUrl, readInsightsFilters, zonedParts,
  formatInsightsMoney, openPositionSnapshot, type InsightsFilters, type InsightsSettings,
} from '../insights/insightsData';
import { SimpleInsights } from '../insights/SimpleInsights';
import { InsightsLoading, InsightTradeDrawer } from '../insights/InsightsShared';
import { JournalReportingSettings } from '../insights/JournalReportingSettings';
import { InsightsPlaybookProgress, InsightsDisciplineProgress } from '../insights/InsightsProgress';
import { computeDiscipline, hasDisciplineEvidence } from '../journalDiscipline';
import { computeDiscipline as overviewDiscipline } from '../JournalMonitors';
import { easyInsightsLayout } from '../insights/insightsLayout';
import { InsightsCurve, InsightsRealizedCurve } from '../insights/InsightsCurve';
import { JOURNAL_CARD_REGISTRY, defaultJournalViews, journalCardAvailable, journalCardsFor, migrateJournalViews, updateJournalViews } from '../journalViews';
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
  assert.equal(journalCardsFor(prefs, 'insights').length, 8);
  const before = journalCardsFor(prefs, 'insights').findIndex(card => card.id === 'insights-calendar');
  prefs = updateJournalViews(prefs, { type: 'move', tab: 'insights', id: 'insights-calendar', direction: -1 });
  assert.equal(journalCardsFor(prefs, 'insights')[before - 1].id, 'insights-calendar');
  prefs = updateJournalViews(prefs, { type: 'hide', tab: 'insights', id: 'insights-hours' });
  assert.equal(journalCardsFor(prefs, 'insights').length, 7);
  const restored = migrateJournalViews(JSON.parse(JSON.stringify(prefs)));
  assert.deepEqual(restored, prefs);
  const legacy = migrateJournalViews({ version: 1, tabs: { insights: { level: 'easy', hidden: ['insights-workspace'], added: [], order: [] } } });
  assert.equal(journalCardsFor(legacy, 'insights').length, 8);
});
test('default Easy screen renders eight widgets, full-width calendar/KPIs and no heatmap', () => {
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { location: { search: '?journalTab=insights&insightsAsOf=2026-10-28' } } });
  const cards = journalCardsFor(defaultJournalViews(), 'insights');
  const view: JournalCardsController = {
    cards, level: 'easy', baseLevel: 'easy', error: '', welcomed: true,
    setLevel: () => {}, add: () => {}, hide: () => {}, moveUp: () => {}, moveDown: () => {}, reset: () => {}, dismissWelcome: () => {},
  };
  const html = renderToStaticMarkup(React.createElement(SimpleInsights, {
    entries: JOURNAL_ENTRIES, settings, view, settingsWarnings: [], checklistLength: 5,
    onTradeLog: () => {}, onOpenTrade: () => {}, onOpenTrades: () => {},
  }));
  for (const card of cards) assert.ok(html.includes(`aria-label="${card.title.replace(/&/g, '&amp;')}"`));
  assert.ok(html.indexOf('aria-label="How am I doing?"') < html.indexOf('aria-label="Trading calendar"'));
  assert.match(html, /data-insights-layout="dashboard"/);
  assert.match(html, /aria-label="Trading calendar" class="[^"]*xl:col-span-12/);
  assert.match(html, /aria-label="How am I doing\?" class="[^"]*xl:col-span-12/);
  assert.match(html, /Insights date range/); assert.match(html, /Insights side/);
  assert.match(html, /aria-label="Insights side" class="[^"]*ml-auto[^"]*shrink-0/);
  assert.doesNotMatch(html, /aria-label="Insights account"|SESSION FILTER|Export CSV|Cross analysis matrix/);
  assert.doesNotMatch(html, /Scrollable entry day and hour heatmap|aria-label="Day × hour"/);
  assert.equal((renderToStaticMarkup(React.createElement(InsightsLoading)).match(/aria-label="Loading /g) || []).length, 10);
  const skeleton = renderToStaticMarkup(React.createElement(InsightsLoading, { compact: true }));
  assert.equal((skeleton.match(/aria-label="Loading /g) || []).length, 9);
  assert.doesNotMatch(skeleton, /Loading Day and hour/);
  assert.ok(skeleton.indexOf('Loading Overview') < skeleton.indexOf('Loading Trading calendar'));
  const standardCards = journalCardsFor({ ...defaultJournalViews(), defaultLevel: 'standard' }, 'insights');
  const standard = renderToStaticMarkup(React.createElement(SimpleInsights, {
    entries: JOURNAL_ENTRIES, settings, view: { ...view, baseLevel: 'standard', level: 'standard', cards: standardCards }, settingsWarnings: [],
    onTradeLog: () => {}, onOpenTrade: () => {}, onOpenTrades: () => {},
  }));
  assert.match(standard, /data-insights-layout="stacked"/);
  assert.match(standard, /Scrollable entry day and hour heatmap/);
  assert.ok(standard.indexOf('aria-label="How am I doing?"') < standard.indexOf('aria-label="Trading calendar"'));
  Reflect.deleteProperty(globalThis, 'window');
});
test('Easy defaults to KPI summary then calendar, preserving saved custom orders and hidden cards', () => {
  const defaults = defaultJournalViews();
  assert.deepEqual(journalCardsFor(defaults, 'insights').slice(0, 2).map(card => card.id), ['insights-kpis', 'insights-calendar']);
  for (const level of ['standard', 'advanced'] as const) {
    assert.equal(journalCardsFor({ ...defaults, defaultLevel: level }, 'insights')[0].id, 'insights-kpis');
  }
  const custom = updateJournalViews(defaults, { type: 'move', tab: 'insights', id: 'insights-calendar', direction: -1 });
  assert.equal(journalCardsFor(migrateJournalViews(custom), 'insights')[0].id, 'insights-calendar');
  assert.equal(journalCardsFor(updateJournalViews(custom, { type: 'reset', tab: 'insights' }), 'insights')[0].id, 'insights-kpis');
  const hidden = updateJournalViews(defaults, { type: 'hide', tab: 'insights', id: 'insights-kpis' });
  assert.equal(journalCardsFor(hidden, 'insights')[0].id, 'insights-calendar');
});
test('Easy dashboard pairs fit the row without reordering and unpaired cards expand', () => {
  const ids = journalCardsFor(defaultJournalViews(), 'insights').map(card => card.id);
  const layout = easyInsightsLayout(ids);
  for (const id of ['insights-calendar', 'insights-kpis']) {
    for (const breakpoint of ['md', 'lg', 'xl']) assert.ok(layout[id].includes(`${breakpoint}:col-span-12`));
  }
  assert.match(layout['insights-playbooks'], /md:col-span-6/);
  assert.match(layout['insights-discipline'], /xl:col-span-5/);
  assert.match(layout['insights-curve'], /lg:col-span-7/);
  for (const id of ['insights-hours', 'insights-callouts']) assert.match(layout[id], /xl:col-span-12/);
  for (const selected of [ids, ids.filter(id => id !== 'insights-kpis'), ['insights-calendar', 'insights-curve', 'insights-weekdays'], ['insights-kpis', 'insights-hours', 'insights-discipline']]) {
    const sizes = easyInsightsLayout(selected);
    assert.deepEqual(Object.keys(sizes), selected);
    for (const breakpoint of ['md', 'lg', 'xl']) {
      let row = 0;
      for (const id of selected) {
        row += Number(sizes[id].match(new RegExp(`${breakpoint}:col-span-(\\d+)`))![1]);
        assert.ok(row <= 12, `Row overflow at ${breakpoint}`);
        if (row === 12) row = 0;
      }
      assert.equal(row, 0, `Unfilled row at ${breakpoint}`);
    }
  }
});
test('Easy heatmap removal survives saved layouts and cannot be undone through Add card', () => {
  const defaults = defaultJournalViews(), heatmap = JOURNAL_CARD_REGISTRY.find(card => card.id === 'insights-heatmap');
  assert.ok(heatmap);
  assert.equal(journalCardAvailable(heatmap, 'easy'), false);
  assert.equal(journalCardAvailable(heatmap, 'standard'), true);
  assert.equal(journalCardAvailable(heatmap, 'advanced'), true);
  const legacy = { ...defaults, tabs: { insights: { level: 'easy' as const, hidden: [], added: ['insights-heatmap'], order: ['insights-heatmap', 'insights-calendar', 'insights-kpis'] } } };
  assert.equal(journalCardsFor(legacy, 'insights').some(card => card.id === 'insights-heatmap'), false);
  const migrated = migrateJournalViews(legacy);
  assert.deepEqual(migrated.tabs.insights!.added, []);
  assert.deepEqual(migrated.tabs.insights!.order, ['insights-calendar', 'insights-kpis']);
  assert.deepEqual(updateJournalViews(defaults, { type: 'add', tab: 'insights', id: 'insights-heatmap' }), defaults);
  assert.equal(journalCardsFor({ ...defaults, defaultLevel: 'standard' }, 'insights').length, 9);
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
const reviewed = (patch: Partial<JournalEntry> = {}) => trade({
  date: '2026-10-02', entryTime: '2026-10-02T09:00:00Z', exitTime: '2026-10-02T11:00:00Z',
  strategy: 'Breakout', followedPlan: true, mistakesReviewed: true, checklistDone: ['a', 'b'], ...patch,
});
test('automatic discipline uses the exact existing Overview score and evidence rules', () => {
  const rows = [
    reviewed({ id: 'newest' }),
    reviewed({ id: 'older', date: '2026-10-01', entryTime: '2026-10-01T09:00:00Z', exitTime: '2026-10-01T11:00:00Z', followedPlan: false, checklistDone: [], mistakes: ['Chased price'] }),
    reviewed({ id: 'unknown', followedPlan: null }),
  ];
  assert.equal(overviewDiscipline, computeDiscipline);
  const data = aggregateInsights(rows, filters, settings, 2), track = data.discipline;
  assert.deepEqual(track.score, { score: 50, plan: 50, checklist: 50, clean: 50, run: 1 });
  assert.equal(track.reviewed.length, 2);
  assert.equal(track.unanswered.length, 1);
  assert.deepEqual(track.streak.map(trade => trade.entry.id), ['newest']);
  assert.equal(track.nextMilestone, 3);
  assert.equal(track.streakKnown, true);
  assert.equal(hasDisciplineEvidence(reviewed({ followedPlan: null })), false);
  assert.equal(hasDisciplineEvidence(reviewed({ mistakesReviewed: false, emotionBefore: 'Calm', emotionAfter: 'Calm', rating: 5 })), false);
  assert.equal(hasDisciplineEvidence(reviewed({ mistakesReviewed: undefined, emotionBefore: 'Calm', emotionAfter: 'Calm', rating: 5 })), true);
});
test('playbook progress uses each recorded setup and excludes unanswered plan checks from percentages', () => {
  const data = aggregateInsights([
    reviewed({ id: 'b1' }), reviewed({ id: 'b2', followedPlan: null }),
    reviewed({ id: 's1', strategy: 'Swing', followedPlan: false, pnl: -10, commission: 0 }),
    reviewed({ id: 'none', strategy: '' }), reviewed({ id: 'unassigned', strategy: 'Unassigned' }),
    reviewed({ id: 'blank', strategy: '  ' }),
  ], filters, settings, 2);
  assert.equal(data.playbooks.reduce((sum, playbook) => sum + playbook.n, 0), data.summary.n);
  assert.equal(data.playbookFocus!.name, 'Breakout');
  const breakout = data.playbooks.find(playbook => playbook.name === 'Breakout')!;
  assert.equal(breakout.n, 2); assert.equal(breakout.answered.length, 1); assert.equal(breakout.adherence, 100);
  assert.equal(data.playbooks.find(playbook => !playbook.assigned)!.n, 3);
  assert.equal(data.playbooks.find(playbook => playbook.name === 'Swing')!.adherence, 0);
  assert.equal(aggregateInsights([reviewed({ strategy: '' })], filters, settings, 2).playbookFocus, null);
});
test('progress respects currency/date/account/side filters and previous-period comparison', () => {
  const rows = [
    reviewed({ id: 'current', accountId: 'A', direction: 'SELL' }),
    reviewed({ id: 'wrong-account', accountId: 'B', direction: 'SELL', strategy: 'Other' }),
    reviewed({ id: 'wrong-side', direction: 'BUY', strategy: 'Other' }),
    reviewed({ id: 'open', tradingStatus: 'open', direction: 'SELL', strategy: 'Other' }),
    reviewed({ id: 'eur', accountCurrency: 'EUR', direction: 'SELL', strategy: 'Other' }),
    reviewed({ id: 'previous', date: '2026-09-10', entryTime: '2026-09-10T09:00:00Z', exitTime: '2026-09-10T11:00:00Z', direction: 'SELL', followedPlan: false, checklistDone: [], mistakes: ['Chased price'] }),
  ];
  const data = aggregateInsights(rows, { ...filters, account: 'A', side: 'short' }, settings, 2);
  assert.equal(data.playbooks.length, 1);
  assert.deepEqual(data.discipline.reviewed.map(trade => trade.entry.id), ['current']);
  assert.equal(data.discipline.score!.score, 100);
  assert.equal(data.discipline.previousScore!.score, 0);
});
test('streak order is deterministic within a day and timing gaps never become fabricated streaks', () => {
  const rows = [
    reviewed({ id: 'early', entryTime: '2026-10-02T08:00:00Z', followedPlan: false }),
    reviewed({ id: 'late', entryTime: '2026-10-02T10:00:00Z' }),
    reviewed({ id: 'unanswered-between', entryTime: '2026-10-02T09:00:00Z', followedPlan: null }),
  ];
  const data = aggregateInsights(rows, filters, settings, 2);
  assert.equal(data.discipline.score!.run, 1);
  assert.deepEqual(data.discipline.streak.map(trade => trade.entry.id), ['late']);
  const unknown = aggregateInsights([reviewed({ entryTime: undefined })], filters, settings, 2).discipline;
  assert.equal(unknown.score!.score, 100);
  assert.equal(unknown.streakKnown, false);
  assert.equal(unknown.nextMilestone, null);
});
test('habit markers are read-only current-view progress, independent of profit and trading rewards', () => {
  const rows = Array.from({ length: 5 }, (_, i) => reviewed({ id: `row-${i}`, entryTime: `2026-10-02T0${i}:00:00Z`, pnl: -100, commission: 0 }));
  const before = JSON.stringify(rows), data = aggregateInsights(rows, filters, settings, 2);
  assert.equal(data.discipline.score!.score, 100);
  assert.equal(data.discipline.score!.run, 5);
  assert.equal(data.discipline.nextMilestone, 10);
  assert.equal(JSON.stringify(rows), before);
  const profitable = aggregateInsights(rows.map(entry => ({ ...entry, pnl: 100 })), filters, settings, 2);
  assert.deepEqual(profitable.discipline.score, data.discipline.score);
  assert.equal(aggregateInsights(rows.slice(0, 3), filters, settings, 2).discipline.nextMilestone, 5);
  assert.throws(() => aggregateInsights(rows, filters, settings, -1), /checklist length/);
});
test('automatic cards stay basic, show evidence gaps and never render extra settings', () => {
  const empty = aggregateInsights([trade()], filters, settings, 2);
  const missing = renderToStaticMarkup(React.createElement(InsightsDisciplineProgress, { data: empty, onDrill: () => {} }));
  assert.match(missing, /Missing answers are not failures/);
  assert.doesNotMatch(missing, /aria-valuenow="0"/);
  const data = aggregateInsights([reviewed()], filters, settings, 2);
  const playbook = renderToStaticMarkup(React.createElement(InsightsPlaybookProgress, { data, onDrill: () => {} }));
  const discipline = renderToStaticMarkup(React.createElement(InsightsDisciplineProgress, { data, onDrill: () => {} }));
  assert.match(playbook, /Early progress/);
  assert.match(playbook, /Small sample/);
  assert.match(discipline, /No Points or Credits are awarded/);
  assert.match(discipline, /aria-label="Discipline score"/);
  assert.match(discipline, /data-keep-button-icons/);
  assert.doesNotMatch(playbook + discipline, /<input|<select|Earn XP|Claim reward/);
  const compact = renderToStaticMarkup(React.createElement(InsightsPlaybookProgress, { data, onDrill: () => {}, compact: true }));
  assert.match(compact, /aria-label="Plan followed · Breakout: 1 of 1 answered · 100%"/);
  const noChecklist = aggregateInsights([reviewed({ checklistDone: [] })], filters, settings, 0);
  assert.equal(noChecklist.discipline.score!.score, 100);
  const noChecklistHtml = renderToStaticMarkup(React.createElement(InsightsDisciplineProgress, { data: noChecklist, onDrill: () => {} }));
  assert.match(noChecklistHtml, /No checklist configured/);
  assert.match(noChecklistHtml, /existing calculator gives full checklist credit/);
});
const position = (patch: Partial<JournalEntry> = {}) => trade({
  tradingStatus: 'open', outcome: 'open', exitTime: undefined, exitPrice: null, ...patch,
});
test('open snapshot applies account/side/currency but does not net reported P&L with recorded costs', () => {
  const entries = [
    position({ id: 'win', pnl: 120 }), position({ id: 'loss', pnl: -50 }),
    position({ id: 'zero', pnl: 0 }), position({ id: 'eur', accountCurrency: 'EUR', pnl: 9999 }),
    position({ id: 'other-account', accountId: 'B', pnl: 500 }), position({ id: 'short', direction: 'SELL', pnl: 100 }),
    trade({ id: 'closed', pnl: 10000 }), position({ id: 'planned', tradingStatus: 'planned', pnl: 10000 }),
  ];
  const before = JSON.stringify(entries), snapshot = openPositionSnapshot(entries, { account: 'A', side: 'long' }, 'USD');
  assert.deepEqual(new Set(snapshot.positions.map(row => row.entry.id)), new Set(['win', 'loss', 'zero']));
  assert.equal(snapshot.known, 3); assert.equal(snapshot.unknown, 0); assert.equal(snapshot.otherCurrency, 1);
  assert.equal(snapshot.unrealized, 70);
  assert.equal(snapshot.floatingLosses, -50);
  assert.equal(snapshot.knownSubtotal, 70);
  assert.equal(JSON.stringify(entries), before);
  assert.throws(() => openPositionSnapshot(entries, filters, 'invalid'), /currency/);
});
test('unknown open P&L never becomes a zero total or zero floating loss', () => {
  const snapshot = openPositionSnapshot([
    position({ id: 'win', pnl: 100 }), position({ id: 'loss', pnl: -40 }),
    position({ id: 'unknown', pnl: 0, pnlKnown: false }), position({ id: 'invalid', pnl: NaN }),
  ], filters, 'USD');
  assert.equal(snapshot.known, 2); assert.equal(snapshot.unknown, 2);
  assert.equal(snapshot.unrealized, null); assert.equal(snapshot.floatingLosses, null);
  assert.equal(snapshot.knownSubtotal, 60); assert.equal(snapshot.knownFloatingLosses, -40);
  const none = openPositionSnapshot([], filters, 'USD');
  assert.equal(none.unrealized, null); assert.equal(none.floatingLosses, null);
  const unreported = openPositionSnapshot([position({ pnlKnown: false })], filters, 'USD');
  assert.equal(unreported.knownSubtotal, null); assert.equal(unreported.knownFloatingLosses, null);
  const zero = openPositionSnapshot([position({ pnl: 0 })], filters, 'USD');
  assert.equal(zero.unrealized, 0); assert.equal(zero.floatingLosses, 0);
});
test('saved open snapshot ignores historical date windows without changing closed stats or curve', () => {
  const closed = trade({ id: 'closed-day', date: '2026-09-14', entryTime: '2026-09-14T09:00:00Z', exitTime: '2026-09-14T10:00:00Z' });
  const historical: InsightsFilters = { ...filters, range: '7D', asOf: '2026-09-15' };
  const baseline = aggregateInsights([closed], historical, settings);
  const data = aggregateInsights([
    closed,
    position({ id: 'older-open', date: '2026-01-01', entryTime: '2026-01-01T09:00:00Z', pnl: 120 }),
    position({ id: 'later-open', date: '2026-10-05', entryTime: '2026-10-05T09:00:00Z', pnl: -70 }),
  ], historical, settings);
  assert.equal(data.openSnapshot.positions.length, 2);
  assert.equal(data.openSnapshot.unrealized, 50);
  assert.deepEqual(data.summary, baseline.summary);
  assert.deepEqual(data.curve, baseline.curve);
  assert.deepEqual(data.current.map(row => row.entry.id), ['closed-day']);
});
test('drawer toggles preserve the closed cohort and render saved open positions without invented exits or R', () => {
  const data = aggregateInsights([
    trade({ id: 'closed-row', symbol: 'CLOSED' }),
    position({ id: 'open-row', symbol: 'OPEN', pnl: -50, pnlKnown: true, rMultiple: 99 }),
    position({ id: 'unknown-row', symbol: 'UNKNOWN', pnlKnown: false }),
  ], filters, settings);
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { location: { href: 'http://localhost:3000/trade/journal?journalTab=insights&insightsRange=30D' } } });
  try {
    const props = { label: 'Clicked closing day', trades: data.current, openSnapshot: data.openSnapshot, settings, onClose: () => {}, onOpenTrade: () => {}, onOpenTrades: () => {} };
    const closed = renderToStaticMarkup(React.createElement(InsightTradeDrawer, props));
    assert.match(closed, /Trade drawer view/);
    assert.match(closed, /Closed trades \(1\)/); assert.match(closed, /Open positions \(2\)/);
    assert.match(closed, /Clicked closing day/);
    assert.match(closed, /journalTrade=closed-row/);
    assert.doesNotMatch(closed, /journalTrade=open-row/);
    const open = renderToStaticMarkup(React.createElement(InsightTradeDrawer, { ...props, initialView: 'open' }));
    assert.match(open, /Open positions · saved snapshot/);
    assert.match(open, /Reported unrealized P&amp;L/);
    assert.match(open, /Floating losses/);
    assert.match(open, /Full totals remain unknown/);
    assert.match(open, /not historical peak-to-trough drawdown/);
    assert.match(open, /report date range and clicked day\/group do not restrict/);
    assert.match(open, /journalTrade=open-row/);
    assert.match(open, /Not reported/);
    assert.doesNotMatch(open, /journalTrade=closed-row|<dt>Exit<\/dt>|<dt>R-multiple<\/dt>|99\.00R/);
  } finally { Reflect.deleteProperty(globalThis, 'window'); }
});
test('closed-only popup renders trade details without navigation or an open-positions toggle', () => {
  const entry = trade({ id: 'popup-row', symbol: 'POPUP' });
  const html = renderToStaticMarkup(React.createElement(InsightTradeDrawer, {
    label: 'Breakout · winning trades', trades: [{ entry, net: 20, r: 1.5 }],
    settings, onClose: () => {}, presentation: 'dialog',
  }));
  assert.match(html, /role="dialog"/);
  assert.match(html, /Breakout · winning trades/);
  assert.match(html, /POPUP/);
  assert.match(html, /Net P&amp;L/);
  assert.match(html, /1\.50R/);
  assert.doesNotMatch(html, /Trade drawer view|Open positions|journalTrade=|Open these trades in Trade Log/);
});
test('open-only journals can enter the shared drawer without fabricating a closed-result chart', () => {
  const data = aggregateInsights([position()], filters, settings);
  assert.equal(data.current.length, 0);
  assert.equal(data.curve.length, 0);
  assert.equal(data.openSnapshot.positions.length, 1);
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { location: { search: '?journalTab=insights&insightsAsOf=2026-10-28' } } });
  try {
    const view: JournalCardsController = {
      cards: journalCardsFor(defaultJournalViews(), 'insights'), level: 'easy', baseLevel: 'easy', error: '', welcomed: true,
      setLevel: () => {}, add: () => {}, hide: () => {}, moveUp: () => {}, moveDown: () => {}, reset: () => {}, dismissWelcome: () => {},
    };
    const html = renderToStaticMarkup(React.createElement(SimpleInsights, {
      entries: [position()], settings, view, settingsWarnings: [], onTradeLog: () => {}, onOpenTrade: () => {}, onOpenTrades: () => {},
    }));
    assert.match(html, /View open positions \(1\)/);
    assert.doesNotMatch(html, /Interactive cumulative P&amp;L/);
  } finally { Reflect.deleteProperty(globalThis, 'window'); }
});
test('daily P&L plots each exit-day result without changing cumulative values or realized drawdown', () => {
  const entries = [100, -40, 50].map((pnl, index) => trade({
    id: `daily-${index}`, commission: 0, pnl, date: `2026-10-0${index + 1}`,
    entryTime: `2026-10-0${index + 1}T00:00:00Z`, exitTime: `2026-10-0${index + 1}T01:00:00Z`,
  }));
  const data = aggregateInsights(entries, filters, settings), before = JSON.stringify(data.curve);
  assert.deepEqual(data.curve.map(point => point.net), [100, -40, 50]);
  assert.deepEqual(data.curve.map(point => point.cumulative), [100, 60, 110]);
  const props = { data, onDrill: () => {} };
  const cumulative = renderToStaticMarkup(React.createElement(InsightsRealizedCurve, { ...props, view: 'cumulative' }));
  const daily = renderToStaticMarkup(React.createElement(InsightsRealizedCurve, { ...props, view: 'daily' }));
  assert.ok(daily.includes(`daily ${formatInsightsMoney(-40, settings)}`));
  assert.ok(cumulative.includes(`cumulative ${formatInsightsMoney(60, settings)}`));
  const cy = (html: string) => [...html.matchAll(/<circle[^>]* cy="([^"]+)"/g)].map(match => Number(match[1]));
  assert.ok(cy(daily)[0] < cy(cumulative)[0]);
  assert.ok(cy(daily)[1] > cy(cumulative)[1]);
  const drawdown = (html: string) => html.match(/<path d="([^"]+)" fill="var\(--insights-loss\)"/)![1];
  assert.equal(drawdown(daily), drawdown(cumulative));
  assert.equal(JSON.stringify(data.curve), before);
});
test('chart view controls expose only cumulative and daily P&L without floating-loss or drawer-launch buttons', () => {
  const data = aggregateInsights([trade()], filters, settings);
  const html = renderToStaticMarkup(React.createElement(InsightsCurve, { data, view: 'cumulative', onViewChange: () => {}, onDrill: () => {} }));
  assert.match(html, /aria-label="P&amp;L chart view"/);
  for (const label of ['Cumulative P&amp;L', 'Daily P&amp;L']) assert.ok(html.includes(label));
  assert.match(html, /Interactive cumulative P&amp;L and drawdown/);
  assert.doesNotMatch(html, /Floating losses|View open positions in drawer|<input|<select/);
});
