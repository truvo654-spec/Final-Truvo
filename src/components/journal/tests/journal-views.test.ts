import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { defaultJournalViews, JOURNAL_CARD_REGISTRY, journalCardsFor, migrateJournalViews, updateJournalViews } from '../journalViews';
import { createJournalViewStore } from '../journalViewStore';
import { useJournalCards, type JournalCardsController } from '../useJournalCards';
import { JournalSimpleTradeLog } from '../JournalSimpleTradeLog';
import { JournalTradeLog } from '../JournalTradeLog';
import { JournalWorkspaceCard } from '../JournalCards';
import { formatPlainPF, pluralize } from '../journalPlain';
import { filterTradeLogEntries, planAnswer, quickReviewPatch, tradeLogKpis } from '../journalTradeLogModel';
import { metrics } from '../journalMath';
import type { JournalEntry } from '../../../types';

const trade = (patch: Partial<JournalEntry> = {}): JournalEntry => ({
  id: 'one', date: '2026-10-01', symbol: 'TEST', assetClass: 'Stocks', direction: 'BUY', entryPrice: 10,
  exitPrice: 12, size: 1, pnl: 20, commission: 0, rMultiple: null, outcome: 'win', tradingStatus: 'closed',
  strategy: 'Test', tags: [], setupNotes: '', emotionBefore: null, emotionAfter: null, followedPlan: null,
  checklistDone: [], mistakes: [], lessons: '', rating: null, source: 'manual', ...patch,
});
const storage = () => {
  const data = new Map<string, string>();
  return { data, getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); } };
};
test('registry has unique IDs and Easy has exactly summary and trades; Standard has four figures and table', () => {
  assert.equal(new Set(JOURNAL_CARD_REGISTRY.map(card => card.id)).size, JOURNAL_CARD_REGISTRY.length);
  const easy = defaultJournalViews();
  assert.deepEqual(journalCardsFor(easy, 'entries').map(card => card.id), ['summary', 'trades']);
  const standard = updateJournalViews(easy, { type: 'level', tab: 'entries', level: 'standard' });
  assert.deepEqual(journalCardsFor(standard, 'entries').map(card => card.id), ['net', 'win-rate', 'payoff', 'profit-factor', 'trades']);
  const advanced = updateJournalViews(easy, { type: 'level', tab: 'entries', level: 'advanced' });
  assert.ok(journalCardsFor(advanced, 'entries').some(card => card.id === 'tools'));
});
test('card visibility, add, hide, order and reset are scoped to a tab', () => {
  let preferences = defaultJournalViews();
  preferences = updateJournalViews(preferences, { type: 'add', tab: 'entries', id: 'profit-factor' });
  preferences = updateJournalViews(preferences, { type: 'move', tab: 'entries', id: 'profit-factor', direction: -1 });
  assert.equal(journalCardsFor(preferences, 'entries')[0].id, 'profit-factor');
  preferences = updateJournalViews(preferences, { type: 'hide', tab: 'entries', id: 'summary' });
  assert.deepEqual(journalCardsFor(preferences, 'entries').map(card => card.id), ['profit-factor', 'trades']);
  assert.equal(journalCardsFor(preferences, 'insights')[0].id, 'insights-workspace');
  preferences = updateJournalViews(preferences, { type: 'reset', tab: 'entries' });
  assert.deepEqual(journalCardsFor(preferences, 'entries').map(card => card.id), ['summary', 'trades']);
  assert.deepEqual(updateJournalViews(preferences, { type: 'add', tab: 'entries', id: 'insights-workspace' }), preferences);
});
test('versioned migration accepts legacy levels, de-duplicates and removes stale IDs without importing old trade filters', () => {
  assert.equal(migrateJournalViews('advanced').defaultLevel, 'advanced');
  const migrated = migrateJournalViews({
    version: 0, defaultLevel: 'standard',
    tabs: { insights: 'advanced', entries: { level: 'easy', hidden: ['summary', 'stale', 'summary'], added: ['summary', 'points', 'points'], order: ['points', 'stale'] } },
    brokerOff: ['old-broker'],
  });
  assert.equal(migrated.version, 1);
  assert.equal(migrated.tabs.insights.level, 'advanced');
  assert.deepEqual(migrated.tabs.entries, { level: 'easy', hidden: ['summary'], added: ['points'], order: ['points'] });
  assert.deepEqual(migrateJournalViews(migrated), migrated);
  assert.throws(() => migrateJournalViews({ version: 9 }));
});
test('preference store notifies subscribers, survives reload and reports blocked storage explicitly', () => {
  const memory = storage(), store = createJournalViewStore(memory, 'views');
  let notifications = 0;
  const unsubscribe = store.subscribe(() => notifications++);
  store.dispatch({ type: 'add', tab: 'entries', id: 'fees' });
  assert.equal(notifications, 1);
  const restored = createJournalViewStore(memory, 'views');
  assert.deepEqual(restored.getSnapshot().preferences, store.getSnapshot().preferences);
  unsubscribe();
  store.dispatch({ type: 'welcome' });
  assert.equal(notifications, 1);
  const failing = createJournalViewStore({ getItem: () => null, setItem: () => { throw new Error('quota'); } }, 'views');
  failing.dispatch({ type: 'level', tab: 'entries', level: 'standard' });
  assert.match(failing.getSnapshot().error, /could not be saved/);
  assert.equal(failing.getSnapshot().preferences.tabs.entries.level, 'standard');
});
test('corrupt/future preferences remain untouched until an explicit reset', () => {
  const memory = storage();
  memory.setItem('views', '{"version":42}');
  const store = createJournalViewStore(memory, 'views');
  store.dispatch({ type: 'hide', tab: 'entries', id: 'summary' });
  assert.equal(memory.getItem('views'), '{"version":42}');
  assert.match(store.getSnapshot().error, /preserved/);
  store.dispatch({ type: 'reset' });
  assert.equal(JSON.parse(memory.getItem('views')).version, 1);
  assert.equal(store.getSnapshot().error, '');
});
test('useJournalCards exposes Custom, persistence, move and reset; Easy does not render heavy tools', () => {
  const memory = storage();
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage: memory, addEventListener: () => {} } });
  let view: JournalCardsController;
  function Probe() { view = useJournalCards('entries'); return null; }
  const read = () => { renderToStaticMarkup(React.createElement(Probe)); return view; };
  assert.equal(read().level, 'easy');
  view.add('fees');
  assert.equal(read().level, 'custom');
  view.moveUp('fees');
  assert.deepEqual(read().cards.map(card => card.id), ['summary', 'fees', 'trades']);
  view.hide('fees');
  assert.equal(read().cards.length, 2);
  view.setLevel('standard');
  assert.equal(read().baseLevel, 'standard');
  assert.equal(JSON.parse(memory.getItem('ms-journal-v2-views')).tabs.entries.level, 'standard');
  view.reset();
  read();
  const html = renderToStaticMarkup(React.createElement(JournalSimpleTradeLog, {
    entries: [trade()], brokers: [], currency: 'USD', rangeLabel: 'All time', view,
    onClearPreset: () => {}, onChange: () => {}, onOpen: () => {}, onToast: () => {}, onAdd: () => {},
    onImport: () => {}, onReplay: () => {}, onReplayLog: () => {}, onBacktestTrades: () => {},
  }));
  assert.match(html, /My trades/);
  assert.match(html, /\+\$20\.00/);
  assert.doesNotMatch(html, /Columns|GROUP:|Export all|Profit Factor|type="checkbox"|Loading trade tools/);
  Reflect.deleteProperty(globalThis, 'window');
});
test('Quick review merges only its answers and preserves advanced fields and trading status', () => {
  const original = trade({
    emotionBefore: 'Calm', commission: 3, initialRisk: 9, rating: 4, reviewState: 'complete',
    fills: [{ id: 'fill', time: '2026-10-01T10:00:00Z', side: 'entry', quantity: 1, price: 10, fee: 3 }],
    ruleEvidence: [], mistakes: ['Chased price'], checklistDone: ['check'], setupNotes: 'Keep',
  });
  const patch = quickReviewPatch({ emotionAfter: 'Confident', plan: 'partly', lessons: 'Wait for confirmation' });
  const updated = { ...original, ...patch };
  assert.deepEqual(Object.keys(patch).sort(), ['emotionAfter', 'followedPlan', 'lessons', 'planAdherence']);
  assert.equal(updated.followedPlan, false);
  assert.equal(planAnswer(updated), 'partly');
  assert.equal(updated.emotionBefore, 'Calm');
  for (const key of ['commission', 'initialRisk', 'rating', 'reviewState', 'fills', 'ruleEvidence', 'mistakes', 'checklistDone', 'setupNotes', 'tradingStatus'] as const) assert.deepEqual(updated[key], original[key]);
  assert.equal(quickReviewPatch({ emotionAfter: null, plan: '', lessons: '' }).followedPlan, null);
  assert.equal(quickReviewPatch({ emotionAfter: 'Calm', plan: 'yes', lessons: 'Kept' }).followedPlan, true);
});
test('Easy and Advanced use identical filtering and KPI formulas, with ineligible trades excluded from money', () => {
  const entries = [trade(), trade({ id: 'two', pnl: -10, commission: 2 }), trade({ id: 'open', tradingStatus: 'open', pnl: 200 }), trade({ id: 'unknown', commission: undefined })];
  const filters = { query: '', needsReview: false, fOutcome: 'all', fTradingStatus: 'all' as const, marketOff: [], brokerOff: [] };
  const rows = filterTradeLogEntries(entries, filters, new Map());
  const kpi = tradeLogKpis(rows, new Map()), expected = metrics(rows);
  assert.equal(kpi.net, expected.total);
  assert.equal(kpi.n, expected.n);
  assert.equal(kpi.pf, expected.pf);
  assert.equal(kpi.winRate, expected.winRate);
  assert.equal(kpi.net, 8);
  assert.equal(kpi.fees, 2);
  assert.equal(filterTradeLogEntries(entries, { ...filters, query: 'nothing' }, new Map()).length, 0);
  assert.equal(filterTradeLogEntries(entries, { ...filters, query: 'nothing' }, new Map(), { ids: ['one'] }).length, 1);
});
test('plain language handles missing results, infinity, currency and singular counts', () => {
  assert.equal(formatPlainPF(2.21), '$2.21 won for every $1 lost');
  assert.match(formatPlainPF(Infinity), /no losing trades/);
  assert.match(formatPlainPF(null), /No gains or losses/);
  assert.match(formatPlainPF(2.21, 'EUR'), /€/);
  assert.equal(pluralize(1, 'trade'), '1 trade');
  assert.equal(pluralize(2, 'trade'), '2 trades');
});
test('Standard table has the requested six-column order; Advanced keeps the original eight KPI strip and tools', () => {
  const props = { entries: [trade()], brokers: [], onChange: () => {}, onOpen: () => {}, onToast: () => {} };
  const standard = renderToStaticMarkup(React.createElement(JournalTradeLog, { ...props, variant: 'standard' }));
  const head = standard.slice(standard.indexOf('<thead'), standard.indexOf('</thead>'));
  const labels = ['Date &amp; Time', 'Instrument', 'Side', 'Net P&amp;L', 'Review', 'Playbook'];
  let previous = -1;
  for (const label of labels) {
    const index = head.indexOf(label);
    assert.ok(index > previous, `${label} must follow the preceding column`);
    previous = index;
  }
  assert.equal((head.match(/<th /g) || []).length, 7); // Six data columns plus selection.
  assert.doesNotMatch(standard, /Cumul\. Net P&amp;L/);
  const advanced = renderToStaticMarkup(React.createElement(JournalTradeLog, props));
  for (const text of ['Cumul. Net P&amp;L', 'Profit Factor', 'Realized R-Avg', 'Export all', 'GROUP:']) assert.ok(advanced.includes(text));
  assert.ok(advanced.includes('+$20.00') && standard.includes('+$20.00'));
});
test('hidden workspace cards never mount their existing components; Advanced adds no card wrapper', () => {
  let mounts = 0;
  const Existing = () => { mounts++; return React.createElement('p', null, 'Existing workspace'); };
  const hidden: JournalCardsController = {
    cards: [], baseLevel: 'easy', level: 'custom', error: '', welcomed: true,
    setLevel: () => {}, hide: () => {}, add: () => {}, moveUp: () => {}, moveDown: () => {}, reset: () => {}, dismissWelcome: () => {},
  };
  const html = renderToStaticMarkup(React.createElement(JournalWorkspaceCard, { view: hidden, children: React.createElement(Existing) }));
  assert.equal(html, '');
  assert.equal(mounts, 0);
  const advanced: JournalCardsController = { ...hidden, baseLevel: 'advanced', level: 'advanced' };
  assert.equal(renderToStaticMarkup(React.createElement(JournalWorkspaceCard, { view: advanced, children: React.createElement(Existing) })), '<p>Existing workspace</p>');
  assert.equal(mounts, 1);
});
